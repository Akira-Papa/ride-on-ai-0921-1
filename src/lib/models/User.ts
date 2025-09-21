import { InferSchemaType, Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    providerId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Schema.Types.ObjectId;
};

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ providerId: 1 }, { unique: true });

export const UserModel = models.User ?? model("User", userSchema);
