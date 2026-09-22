import mongoose, { Schema, models, model } from "mongoose";

/**
 * A home-page section that groups products one way, e.g. "Browse by category" or
 * "Browse by space". The admin can create as many as they like. Each section owns
 * a set of Groups (the cards shown in it).
 */
const SectionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true }, // URL segment: /<slug>/<group-slug>
    label: { type: String, required: true, trim: true }, // singular: "Category"
    pluralLabel: { type: String, required: true, trim: true }, // "Categories" (navbar link, "All categories")
    title: { type: String, default: "" }, // section heading: "Browse by category"
    eyebrow: { type: String, default: "" }, // small text above the heading: "Our work"
    cardCta: { type: String, default: "View collection" }, // link text on each card
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (models.Section as mongoose.Model<mongoose.InferSchemaType<typeof SectionSchema>>) || model("Section", SectionSchema);
