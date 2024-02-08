import { Post } from "../models/postSchema.js";
import { oneMonth } from "../utils/calculateOneMonth.js";
import { errorHandler } from "../utils/error.js";
import { generateRandom } from "../utils/generateRandom.js";

export const createPost = async (req, res, next) => {
  const { isAdmin, _id } = req.user;
  const { title, content, image, category } = req.body;
  if (!isAdmin) {
    return next(errorHandler(403, "You are not allowed to create a post"));
  }
  if (
    !title ||
    !content ||
    title.trim().length === 0 ||
    content.trim().length === 0
  ) {
    return next(
      errorHandler(404, "Unable to create post without title or content")
    );
  }
  let slug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^\w-]+/g, "");
  const randomN = generateRandom();
  slug = `${slug}-${randomN}`;
  try {
    const newPost = new Post({
      title,
      content,
      image,
      slug,
      author: _id,
      category,
    });
    await newPost.save();
    return res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    next(errorHandler(500, "Failed to create new post"));
  }
};

export const getPosts = async (req, res, next) => {
  const {
    limit,
    startIndex,
    order,
    userId,
    category,
    slug,
    postId,
    searchTerm,
  } = req.query;
  const startingIndex = parseInt(startIndex) || 0;
  const max = parseInt(limit) || 9;
  const sortDir = order === "asc" ? 1 : -1;
  try {
    const posts = await Post.find({
      ...(userId && { author: userId }),
      ...(category && { category }),
      ...(slug && { slug }),
      ...(postId && { _id: postId }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { content: { $regex: searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDir })
      .skip(startingIndex)
      .limit(max);

    const totalPosts = await Post.countDocuments();
    const oneMonthAgo = oneMonth();
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    return res.status(200).json({ posts, totalPosts, lastMonthPosts });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  const { postId } = req.params;
  const { _id, isAdmin } = req.user;
  try {
    if (!isAdmin) {
      return next(errorHandler(401, "Unauthorized to make this action"));
    }
    const post = await Post.findById(postId).select("author");
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }
    if (post.author !== _id) {
      return next(errorHandler(401, "You can delete only your posts"));
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.log(err);
  }
};

export const updatePost = async (req, res, next) => {
  const { postId } = req.params;
  const { _id, isAdmin } = req.user;
  const { title, content, image, category } = req.body;
  if (
    !title ||
    !content ||
    title.trim().length === 0 ||
    content.trim().length === 0
  ) {
    return next(
      errorHandler(404, "You cannot update post with empty content or title")
    );
  }
  if (!isAdmin) {
    return next(errorHandler(401, "Unauthorized to change this post"));
  }
  try {
    const post = await Post.findById(postId).select("author");
    if (!post) {
      return next(errorHandler(404, "Post not found"));
    }
    if (post.author !== _id) {
      return next(errorHandler(401, "You can update only your posts"));
    }
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          title,
          content,
          category,
          image,
        },
      },
      { new: true }
    );
    return res.status(200).json(updatedPost);
  } catch (err) {
    console.log(err);
  }
};
