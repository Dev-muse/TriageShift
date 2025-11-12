import { inngest } from "../client";
import User from "../../models/user.models";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer.js";

//Onboarding
export const onUserSignUp = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      // get email data passed into event
      const { email } = event.data;

      //step 1: check db for user
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({
          email,
        });
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in db");
        }
        return userObject;
      });

      // step 2 :

      step.run("send-welcome-email", async () => {
        const subject = "Welcome to TriageShift";
        const message = ` Hi , 
        \n\n 
        Thanks for signing up. We're glad to have you on board!
        
        `;

        await sendEmail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("error on user/signup func", error.message);
      return { success: false };
    }
  }
);
