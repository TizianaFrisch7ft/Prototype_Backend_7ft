import mongoose from 'mongoose';
import { connectWithCredentials } from '../../../db/connect';

const videoSchema = new mongoose.Schema({
  consultaId: String,
  url: String
});

export const getVideoLink = async (consultaId: string, dbCreds: any) => {
  const conn = await connectWithCredentials(
    dbCreds.dbUser,
    dbCreds.dbPassword,
    dbCreds.dbName,
    dbCreds.cluster
  );
  const Video = conn.models.Video || conn.model('Video', videoSchema);
  const result = await Video.findOne({ consultaId });
  return result?.url || '';
};

export const saveVideoLink = async (consultaId: string, videoUrl: string, dbCreds: any) => {
  const conn = await connectWithCredentials(
    dbCreds.dbUser,
    dbCreds.dbPassword,
    dbCreds.dbName,
    dbCreds.cluster
  );
  const Video = conn.models.Video || conn.model('Video', videoSchema);
  await Video.findOneAndUpdate({ consultaId }, { url: videoUrl }, { upsert: true });
};