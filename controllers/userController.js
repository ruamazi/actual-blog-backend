import { User } from "../models/userSchema.js";

export const test = (req, res) => {
  res.json({ message: "zab" });
};

export const deleteUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOneAndDelete({ username });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json({ success: "user deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};
