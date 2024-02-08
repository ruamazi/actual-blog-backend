import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      unique: true,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    author: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Post = model("Post", postSchema);
