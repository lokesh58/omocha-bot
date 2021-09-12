import { model, Schema } from 'mongoose';
import { reqString } from './constants';

export interface Welcome {
  _id: string,
  message: string,
  channelId: string,
}

export const welcomeModel = model<Welcome>('welcome', new Schema<Welcome>({
  _id: reqString, // guild id
  message: reqString,
  channelId: reqString,
}));
