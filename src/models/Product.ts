import mongoose, { Schema, models, model } from "mongoose";

/** A piece of work. It is tagged with one group per section (e.g. Category: Sofa, Space: Hall). */
const ProductSchema = new Schema(
  {
    groups: { type: [{ type: Schema.Types.ObjectId, ref: "Group" }], default: [], index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    material: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    year: { type: String, default: "" },
    price: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (models.Product as mongoose.Model<mongoose.InferSchemaType<typeof ProductSchema>>) ||
  model("Product", ProductSchema);
