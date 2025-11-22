import { NonRetriableError } from "inngest";
import Inquiry from "../../models/inquiry.models.js";
import User from "../../models/user.models";
import analyzeInquiry from "../../utils/ai.js";
import { sendMail } from "../../utils/mailer.js";
import { inngest } from "../client";

export const onInquiryCreate = inngest.createFunction(
  { id: "on-inquiry-created", retries: 2 },
  { event: "inquiry/created" },
  async ({ event, step }) => {
    try {
      const { inquiryId } = event.data;

      const inquiry = await step.run("fetch-inquiry", async () => {
        // fetch ticket details from db
        const inquiryObject = await Inquiry.findById(inquiryId);
        if (!inquiryObject) {
          throw new NonRetriableError("Inquiry not found in DB");
        }

        return inquiryObject;
      });

      await step.run("update-inquiry-status", async () => {
        await Inquiry.findByIdAndUpdate(inquiry._id, { status: "TODO" });
      });

      const aiResponse = await analyzeInquiry(inquiry);

      const relatedSkills = await step.run("ai-processing", async () => {
        let specialities = [];
        if (aiResponse) {
          await Inquiry.findByIdAndUpdate(inquiry._id, {
            urgency: !["low", "medium", "high"].includes(aiResponse.urgency)
              ? "medium"
              : aiResponse.urgency,
            clinicalNotes: aiResponse.clinicalNotes || "",
            status: "IN_PROGRESS",
            requiredSpecialty: aiResponse.requiredSpecialty || [],
          });
          specialities = aiResponse.requiredSpecialty || [];
        }

        return specialities;
      });

      const moderator = step.run("assign-moderator", async () => {
        // find a user with matching related skills
        let user = await User.findOne({
          role: "moderator",
          specialities: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i",
            },
          },
        });

        // if no matching skills, assign any available to admin
        if (!user) {
          user = await User.findOne({ role: "admin" });
        }

        await Inquiry.findByIdAndUpdate(inquiry._id, {
          assignedTo: user?._id || null,
        });
        return user;
      });

      await step.run("send-notification-email", async () => {
        if (moderator && moderator.email) {
          const finalInquiry = await Inquiry.findById(inquiry._id);
          await sendMail(
            moderator.email,
            `New Inquiry Assigned: ${finalInquiry.chiefComplaint}`,
            `You have been assigned a new inquiry.\n\nChief Complaint: ${finalInquiry.chiefComplaint}\n\nPlease review it at your earliest convenience.`
          );
        }
      });

      return { success: true };
    } catch (error) {
      console.error("error running step", error.message);
      return { success: false };
    }
  }
);
