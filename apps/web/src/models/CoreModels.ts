import mongoose, { Schema, model, models } from 'mongoose';

const PartySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  logoUrl: { type: String },
  leader: { type: String }
}, { timestamps: true });

export const Party = models.Party || model('Party', PartySchema);

export default { Party };
