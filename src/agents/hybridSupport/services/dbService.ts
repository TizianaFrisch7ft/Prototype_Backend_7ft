import mongoose from 'mongoose';
import { connectWithCredentials } from '../../../db/connect';

const consultaSchema = new mongoose.Schema({
  tema: String,
  resumen: String
});

export const getConsultaInfo = async (query: string, dbCreds: any) => {
  const conn = await connectWithCredentials(
    dbCreds.dbUser,
    dbCreds.dbPassword,
    dbCreds.dbName,
    dbCreds.cluster
  );
  const Consulta = conn.models.Consulta || conn.model('Consulta', consultaSchema);
  const result = await Consulta.findOne({ tema: { $regex: query, $options: 'i' } });
  return result;
};

export const saveConsulta = async (data: any, dbCreds: any) => {
  const conn = await connectWithCredentials(
    dbCreds.dbUser,
    dbCreds.dbPassword,
    dbCreds.dbName,
    dbCreds.cluster
  );
  const Consulta = conn.models.Consulta || conn.model('Consulta', consultaSchema);
  await new Consulta(data).save();
};
