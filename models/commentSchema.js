import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
