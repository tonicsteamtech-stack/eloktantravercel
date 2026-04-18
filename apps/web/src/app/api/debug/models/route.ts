import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  await connectDB();
  const models = Object.keys(mongoose.models);
  
  // Use dynamic model retrieval to prevent 'missing module' build errors
  let PartyModel;
  try {
    PartyModel = mongoose.models.Party || mongoose.model('Party', new mongoose.Schema({}, { strict: false }));
  } catch(e) {
    // Model might be registered differently or error out
  }
  
  let errorMsg = null;
  let sampleData = null;
  
  try {
    if (PartyModel) {
        sampleData = await PartyModel.find({}).limit(1);
    }
  } catch (err: any) {
    errorMsg = err.message;
  }
  
  return NextResponse.json({
    models,
    partyRegistered: !!PartyModel,
    path: true,
    error: errorMsg,
    data: sampleData
  });
}
