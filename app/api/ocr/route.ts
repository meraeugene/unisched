import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  try {
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

    if (!ocrText) {
      return NextResponse.json(
        { error: "OCR failed to extract text." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: ocrText });
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json({ error: "OCR API failed." }, { status: 500 });
  }
}
