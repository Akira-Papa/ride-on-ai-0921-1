import { InferSchemaType, Schema, model, models } from "mongoose";

const postSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    lesson: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    situationalContext: {
      type: String,
      maxlength: 1000,
    },
    tags: {
      type: [String],
      validate: [(val: string[]) => val.length <= 5, "Tags limit exceeded"],
      default: [],
    },
    visibility: {
      type: String,
      enum: ["member", "private"],
      default: "member",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ categoryId: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: "text", lesson: "text", tags: "text" });

export type PostDocument = InferSchemaType<typeof postSchema> & {
  _id: Schema.Types.ObjectId;
};

export const PostModel = models.Post ?? model("Post", postSchema);
