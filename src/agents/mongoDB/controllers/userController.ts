import { RequestHandler} from "express";
import { generateAnswer } from "../services/aiService";
import { User } from "../models/user";



export const handleUserQuery: RequestHandler = async (req, res) => {
  try {
    const { question, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const answer = await generateAnswer(JSON.stringify(user), question);
    res.json({ answer });
  } catch (err) {
    console.error("Error in userController:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser: RequestHandler = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
