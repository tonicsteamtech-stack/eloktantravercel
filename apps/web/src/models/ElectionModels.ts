import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  aadhaarHash: { type: String },
  constituencyId: { type: String }, // Simplified for web app use
  isVerified: { type: Boolean, default: false },
  hasVoted: { type: Boolean, default: false },
  votedOffline: { type: Boolean, default: false },
}, { timestamps: true });

const ElectionSchema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED'], default: 'UPCOMING' },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

const CandidateSchema = new Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  constituency: { type: String, required: true },
  criminalCases: { type: Number, default: 0 },
  netWorth: { type: Number, default: 0 }
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);
export const Election = models.Election || model('Election', ElectionSchema);
export const Candidate = models.Candidate || model('Candidate', CandidateSchema);

export default { User, Election, Candidate };
