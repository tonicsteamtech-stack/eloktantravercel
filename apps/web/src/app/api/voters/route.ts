import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CSV_PATH = path.join(process.cwd(), 'public', 'voters.csv');

// ─── CSV Helpers ─────────────────────────────────────────────────────────────

function parseCSV(content: string) {
  const lines = content.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  // headers: name,constituency,phone,voter_id
  return lines.slice(1).map((line, idx) => {
    const [name, constituency, phone, voter_id] = line.split(',').map(s => s.trim());
    return { id: idx + 1, name, constituency, phone, voter_id };
  });
}

function serializeCSV(voters: any[]) {
  const header = 'name,constituency,phone,voter_id';
  const rows = voters.map(v => `${v.name},${v.constituency},${v.phone},${v.voter_id}`);
  return [header, ...rows].join('\n');
}

function readVoters() {
  try {
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    return parseCSV(content);
  } catch {
    return [];
  }
}

function writeVoters(voters: any[]) {
  fs.writeFileSync(CSV_PATH, serializeCSV(voters), 'utf-8');
}

// ─── GET: Read all voters ────────────────────────────────────────────────────
export async function GET() {
  const voters = readVoters();
  return NextResponse.json({ success: true, voters });
}

// ─── POST: Add new voter ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, constituency, phone, voter_id } = body;
    if (!name || !constituency || !phone || !voter_id) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const voters = readVoters();
    // Check duplicate voter_id
    if (voters.some(v => v.voter_id === voter_id.trim())) {
      return NextResponse.json({ success: false, error: 'Voter ID already exists.' }, { status: 409 });
    }

    const newVoter = { id: voters.length + 1, name: name.trim(), constituency: constituency.trim(), phone: phone.trim(), voter_id: voter_id.trim() };
    voters.push(newVoter);
    writeVoters(voters);

    return NextResponse.json({ success: true, voter: newVoter });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal error.' }, { status: 500 });
  }
}

// ─── PUT: Update existing voter ──────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { voter_id, name, constituency, phone } = body;
    if (!voter_id) {
      return NextResponse.json({ success: false, error: 'voter_id is required.' }, { status: 400 });
    }

    const voters = readVoters();
    const idx = voters.findIndex(v => v.voter_id === voter_id);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Voter not found.' }, { status: 404 });
    }

    voters[idx] = {
      ...voters[idx],
      name: name?.trim() ?? voters[idx].name,
      constituency: constituency?.trim() ?? voters[idx].constituency,
      phone: phone?.trim() ?? voters[idx].phone,
    };
    writeVoters(voters);

    return NextResponse.json({ success: true, voter: voters[idx] });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal error.' }, { status: 500 });
  }
}

// ─── DELETE: Remove voter ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { voter_id } = await req.json();
    if (!voter_id) {
      return NextResponse.json({ success: false, error: 'voter_id is required.' }, { status: 400 });
    }

    let voters = readVoters();
    const exists = voters.some(v => v.voter_id === voter_id);
    if (!exists) {
      return NextResponse.json({ success: false, error: 'Voter not found.' }, { status: 404 });
    }
    voters = voters.filter(v => v.voter_id !== voter_id);
    writeVoters(voters);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal error.' }, { status: 500 });
  }
}
