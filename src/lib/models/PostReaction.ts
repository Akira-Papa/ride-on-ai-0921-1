import { InferSchemaType, Schema, model, models } from "mongoose";

const postReactionSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["like", "bookmark"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

postReactionSchema.index(
  { postId: 1, userId: 1, type: 1 },
  { unique: true }
);

export type PostReactionDocument = InferSchemaType<typeof postReactionSchema> & {
  _id: Schema.Types.ObjectId;
};

export const PostReactionModel =
  models.PostReaction ?? model("PostReaction", postReactionSchema);
