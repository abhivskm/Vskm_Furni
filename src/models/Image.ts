import mongoose, { Schema, models, model } from "mongoose";

/**
 * Uploaded images are stored directly in MongoDB so the site works on any host
 * (no local disk / cloud bucket needed). Served from /api/images/[id].
 */
const ImageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    filename: { type: String, default: "" },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (models.Image as mongoose.Model<mongoose.InferSchemaType<typeof ImageSchema>>) ||
  model("Image", ImageSchema);
