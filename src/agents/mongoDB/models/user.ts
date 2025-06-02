// src/db/models/user.ts
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  dni: string;
  birthDate: Date;
  email?: string;
  gpa?: number;
  actScore?: number;
  intendedMajor?: string;
  targetUniversity?: string;
  extracurriculars?: string[];
  notes?: string;
}

export const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    dni: { type: String, required: true },
    birthDate: { type: Date, required: true },
    email: { type: String },
    gpa: { type: Number },
    actScore: { type: Number },
    intendedMajor: { type: String },
    targetUniversity: { type: String },
    extracurriculars: [String],
    notes: { type: String }
  },
  { timestamps: true }
);

// Exporta el modelo para uso general
export const User = model<IUser>("User", userSchema);
export default User;
