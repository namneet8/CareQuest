import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request, { params }: { params: { fileId: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = params;
  if (!["1", "2", "3"].includes(fileId)) {
    return NextResponse.json({ error: "Invalid levelId" }, { status: 400 });
  }

  const fileName = `healthreport-${fileId}.pdf`;
  const filePath = path.join(process.cwd(), "tmp", fileName);

  try {
    // Check if file exists
    await fs.access(filePath);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${fileName}`,
      },
    });
  } catch (e) {
    console.error("Failed to fetch PDF:", e);
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }
}