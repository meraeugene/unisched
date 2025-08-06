import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";

interface ScheduleEntry {
  code: string;
  subject: string;
  day: string;
  time: string;
  room: string;
  instructor: string;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function extractMinutes(timeRange: string): number {
  const match = timeRange.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return Infinity;

  const [, hour, minute, meridian] = match;
  let h = parseInt(hour);
  const m = parseInt(minute);

  if (meridian.toUpperCase() === "PM" && h !== 12) h += 12;
  if (meridian.toUpperCase() === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  try {
    // Send file to OCR.space
    const ocrForm = new FormData();
    ocrForm.append("file", file);
    ocrForm.append("apikey", process.env.OCR_SPACE_API_KEY!);
    ocrForm.append("OCREngine", "2");
    ocrForm.append("isTable", "true");

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrForm,
    });

    const ocrData = await ocrRes.json();
    const ocrText = ocrData?.ParsedResults?.[0]?.ParsedText?.trim();

    console.log("ocr data:", ocrData);
    console.log("ocr text:", ocrText);

    if (!ocrText) {
      return NextResponse.json(
        { error: "OCR failed to extract text from the file." },
        { status: 500 }
      );
    }

    // Prompt Gemini
    const systemPrompt = `You are a helpful AI assistant that converts raw OCR or text-extracted data from school PDFs into clean, structured class schedules.

Guidelines:
- Each subject should have: code, title, day, time, room, instructor.
- If a class is scheduled on multiple days (e.g., "MWF" or "TTh"), output one JSON object per day (e.g., one for Monday, one for Wednesday, one for Friday).
- Normalize day combinations as:
  - M → Monday
  - T → Tuesday
  - W → Wednesday
  - Th → Thursday
  - F → Friday
  - S → Saturday,
  - "$" -> Saturday,
  - MW → Monday, Wednesday
  - MWF → Monday, Wednesday, Friday
  - TTh → Tuesday, Thursday
  - TW → Tuesday, Wednesday
  - TE → Tuesday, Friday
  - TF → Tuesday, Friday
  - WTh → Wednesday, Thursday
  - MT → Monday, Tuesday
  - MF → Monday, Friday
  - WF → Wednesday, Friday
  - MTh → Monday, Thursday
  - TWTh → Tuesday, Wednesday, Thursday
  - MTW → Monday, Tuesday, Wednesday
  - MTWF → Monday, Tuesday, Wednesday, Friday
  - MTThF → Monday, Tuesday, Thursday, Friday
  - MTWThF → Monday, Tuesday, Wednesday, Thursday, Friday

- Always output day as full word (e.g., "Monday" not "M").
- Set instructor to "TBA" if missing or unclear.
- Do not include units, fees, or other irrelevant information.

Format output as a JSON array like:
[
  {
    "code": "ITP 204",
    "subject": "Web Programming",
    "day": "Monday",
    "time": "10:30AM - 12:00PM",
    "room": "CIT 204",
    "instructor": "Mr. Reyes"
  },
  {
    "code": "ITP 204",
    "subject": "Web Programming",
    "day": "Wednesday",
    "time": "10:30AM - 12:00PM",
    "room": "CIT 204",
    "instructor": "Mr. Reyes"
  },
  ...
]`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nRaw text:\n${ocrText}` }],
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

    const cleaned = response.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\[\s*{[\s\S]*}\s*]/);
    const parsedSchedule = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!parsedSchedule) {
      return NextResponse.json(
        { error: "Failed to parse schedule from Gemini response." },
        { status: 500 }
      );
    }

    const scheduleWithIds = parsedSchedule.map((entry: ScheduleEntry) => ({
      id: uuidv4(),
      ...entry,
    }));

    interface ScheduleWithId extends ScheduleEntry {
      id: string;
    }

    scheduleWithIds.sort(
      (a: ScheduleWithId, b: ScheduleWithId) =>
        extractMinutes(a.time) - extractMinutes(b.time)
    );

    return NextResponse.json({ schedule: scheduleWithIds }, { status: 200 });
  } catch (err) {
    console.error("Backend error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
