import { Machine } from "../models/machine.model";
import { Consulta } from "../models/consulta.model";

export const getMachineById = async (id: string) => {
  return await Machine.findById(id);
};

export const getConsultasByMachineId = async (ticket: string) => {
  return await Consulta.find({ ticket });
};
