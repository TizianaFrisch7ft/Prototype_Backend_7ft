import mongoose from "mongoose";

const consultaSchema = new mongoose.Schema({
  ticket: String,
  user_input: String,
  output_user: String,
  video: String
});

export const Consulta = mongoose.model("Consulta", consultaSchema);
