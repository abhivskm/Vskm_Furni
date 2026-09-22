import mongoose, { Schema, models, model } from "mongoose";

/** Single document holding the carpenter's profile + contact details shown in the footer. */
const SettingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    name: { type: String, default: "Shri Vishwakarma Furniture" },
    tagline: { type: String, default: "Handcrafted wooden furniture, built to last generations." },
    about: {
      type: String,
      default:
        "I am a carpenter with years of hands-on experience crafting custom wooden furniture. From beds and wardrobes to doors and modular kitchens, every piece is made with care, precision and the finest wood.",
    },
    yearsExperience: { type: String, default: "15+" },
    phone: { type: String, default: "+91 98765 43210" },
    whatsapp: { type: String, default: "+91 98765 43210" },
    email: { type: String, default: "contact@example.com" },
    address: { type: String, default: "Your Workshop Address, City, State" },
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    workingHours: { type: String, default: "Mon - Sat, 9:00 AM - 7:00 PM" },
    profileImage: { type: String, default: "" },
    // Free-form map of every other editable string / image, keyed as in lib/content.ts
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default (models.Settings as mongoose.Model<mongoose.InferSchemaType<typeof SettingsSchema>>) ||
  model("Settings", SettingsSchema);
