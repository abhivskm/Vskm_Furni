import mongoose, { Schema, models, model } from "mongoose";

/** A card inside a Section (e.g. "Sofa" in Category, "Hall" in Space). Products are tagged with groups. */
const GroupSchema = new Schema(
  {
    section: { type: Schema.Types.ObjectId, ref: "Section", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
GroupSchema.index({ section: 1, slug: 1 }, { unique: true });

export default (models.Group as mongoose.Model<mongoose.InferSchemaType<typeof GroupSchema>>) || model("Group", GroupSchema);
