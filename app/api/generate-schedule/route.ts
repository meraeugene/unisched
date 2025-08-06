import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { ScheduleEntry } from "@/types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
  }

  // Prompt Gemini
  const systemPrompt = `Extract class schedules from raw text into a JSON array.

- Split multi-day entries (e.g. "MWF") into separate objects per day.
- Normalize day codes: "MW"→["Monday","Wednesday"], "TE"→["Tuesday","Friday"], "$"→["Saturday"].
- Each item must include: code, subject, day, time, room, instructor.
- Use "TBA" if instructor is missing.
- Output JSON only, no explanation.
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nRaw text:\n${text}` }],
        },
      ],
    });

    const response = result.text;
    if (!response) {
      return NextResponse.json(
        { error: "No response from Gemini." },
        { status: 500 }
      );
    }

    const jsonMatch = response.match(/\[\s*{[\s\S]*}\s*]/);
    const parsedSchedule = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!parsedSchedule) {
      return NextResponse.json(
        { error: "Failed to parse schedule." },
        { status: 500 }
      );
    }
    const scheduleWithIds = parsedSchedule.map((entry: ScheduleEntry) => ({
      ...entry,
      id: uuidv4(),
    }));

    return NextResponse.json({ schedule: scheduleWithIds });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json(
      { error: "Gemini parsing failed." },
      { status: 500 }
    );
  }
}
