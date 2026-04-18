import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  const conn = await connectDB();
  let models = [];
  if (conn) {
    models = Object.keys(mongoose.models);
  }
  const partyModel = mongoose.models.Party;

  let errorMsg = null;
  let sampleData = null;

  try {
    // Dynamic retrieval prevents build-time 'missing module' errors
    const PartyModel = mongoose.models.Party || mongoose.model('Party', new mongoose.Schema({}, { strict: false }));
    sampleData = await PartyModel.find({}).limit(1);
  } catch (err: any) {
    errorMsg = err.message;
  }

  return NextResponse.json({
    models,
    partyRegistered: !!partyModel,
    path: !!Party,
    error: errorMsg,
    data: sampleData
  });
}
