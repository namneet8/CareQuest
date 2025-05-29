import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCompletedSublevelsWithResponses } from "@/db/queries";
import jsPDF from "jspdf";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const levelId = url.searchParams.get("levelId");
  if (!levelId || !["1", "2", "3"].includes(levelId)) {
    return NextResponse.json({ error: "Invalid or missing levelId" }, { status: 400 });
  }

  const completed = await getCompletedSublevelsWithResponses();
  if (!completed.length) {
    return NextResponse.json({ error: "No completed sublevels found" }, { status: 404 });
  }

  try {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxY = 270;
    let y = 30;

    // Header
    doc.setFontSize(20);
    doc.text("Cumulative Health Report", W / 2, y, { align: "center" });
    y += 15;
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, W / 2, y, { align: "center" });
    y += 20;

    let lastLevel = "";
    for (const grp of completed) {
      if (y > maxY) { doc.addPage(); y = 30; }

      if (grp.levelTitle !== lastLevel) {
        doc.setFontSize(16);
        doc.text(grp.levelTitle, margin, y);
        y += 8;
        lastLevel = grp.levelTitle;
      }

      doc.setFontSize(14);
      doc.text(`• ${grp.sublevelTitle}`, margin + 5, y);
      y += 6;

      doc.setFontSize(11);
      for (const { questionText, responseText } of grp.questions) {
        if (y > maxY) { doc.addPage(); y = 30; }
        const line = `${questionText}: ${responseText}`;
        const lines = doc.splitTextToSize(line, W - margin * 2 - 5);
        for (const l of lines) {
          doc.text(l, margin + 10, y);
          y += 5;
          if (y > maxY) { doc.addPage(); y = 30; }
        }
        y += 2;
      }

      y += 8;
    }

    // Save PDF to temporary folder
    const tempDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tempDir, { recursive: true }); // Ensure tmp directory exists
    const fileName = `healthreport-${levelId}.pdf`;
    const filePath = path.join(tempDir, fileName);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    await fs.writeFile(filePath, pdfBuffer);

    // Return the file name and URL for accessing the PDF
    return NextResponse.json({
      fileName,
      levelId,
      url: `/api/reports/${levelId}`,
    });
  } catch (e) {
    console.error("PDF generation or saving failed:", e);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
