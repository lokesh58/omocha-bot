import { model, Schema } from 'mongoose';
import { reqString } from './constants';

interface Leaving {
  _id: string,
  message: string,
  channelId: string,
}

export const leavingModel = model<Leaving>('leaving', new Schema<Leaving>({
  _id: reqString, // guild id
  message: reqString,
  channelId: reqString,
}));
