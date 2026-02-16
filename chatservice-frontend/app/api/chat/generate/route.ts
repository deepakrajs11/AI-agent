export const runtime = "edge";

import { NextRequest } from "next/server";

const API_URL = process.env.API_URL;

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const response = await fetch(`${API_URL}/ollama/chat/stream/tools`, {
    method: "POST",
    headers: { "Content-Type": "text/plain", username: "default-user" },
    body: message,
  });

  if (!response.body) throw new Error("No body stream");

  return new Response(response.body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

