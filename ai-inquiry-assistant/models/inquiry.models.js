import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  chiefComplaint: String,
  symptoms: String,
  status: { type: String, default: "TODO" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  urgency: String,
  deadline: Date,
  clinicalNotes: String,
  requiredSpecialty: [String],
  patientAge: Number,
  insuranceType: String,
  preferredLanguage: String,

  createdAt: { type: Date, default: Date.now() },
});

export default mongoose.model("Inquiry", inquirySchema);
