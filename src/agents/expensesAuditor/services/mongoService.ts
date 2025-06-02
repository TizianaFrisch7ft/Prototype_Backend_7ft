import mongoose from "mongoose";
import { getActiveConnection } from "../../../db/connect";



export const fetchExpensesFromMongo = async (): Promise<string> => {
  const conn = getActiveConnection();
  if (!conn) throw new Error("No hay conexión activa a Mongo");

  const expenseSchema = new mongoose.Schema({}, { strict: false });

  const Expense = conn.model("Expense", expenseSchema, "expensesauditor");
  const data = await Expense.find({}).lean();

  return JSON.stringify(data, null, 2);
};
