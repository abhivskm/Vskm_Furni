import mongoose, { Schema, models, model } from "mongoose";

const CarouselSchema = new Schema(
  {
    image: { type: String, required: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (models.Carousel as mongoose.Model<mongoose.InferSchemaType<typeof CarouselSchema>>) ||
  model("Carousel", CarouselSchema);
