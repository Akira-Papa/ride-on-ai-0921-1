import { InferSchemaType, Schema, model, models } from "mongoose";

const categorySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ name: 1 });

export type CategoryDocument = InferSchemaType<typeof categorySchema> & {
  _id: Schema.Types.ObjectId;
};

export const CategoryModel =
  models.Category ?? model("Category", categorySchema);
