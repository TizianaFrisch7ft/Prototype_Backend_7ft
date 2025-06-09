import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
  _id: String,
  name: String,
  description: String,
  model: String
});

export const Machine = mongoose.model("Machine", machineSchema);
