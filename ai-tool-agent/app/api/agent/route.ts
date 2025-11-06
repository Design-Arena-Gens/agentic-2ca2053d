import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

interface AgentRequest {
  message?: string;
}

export async function POST(request: Request) {
  let payload: AgentRequest;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const message = payload.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const result = runAgent(message);

  return NextResponse.json(result, { status: 200 });
}

export function GET() {
  return NextResponse.json(
    {
      message:
        "POST a JSON body with a `message` field to receive an AI-assisted, tool-augmented response."
    },
    { status: 200 }
  );
}
