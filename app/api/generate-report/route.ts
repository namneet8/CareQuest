import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCompletedSublevelsWithResponses } from "@/db/queries";
import jsPDF from "jspdf";
import { promises as fs } from "fs";
import path from "path";
import autoTable from 'jspdf-autotable';

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
  const H = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 30;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(33, 37, 41);
  doc.text("Cumulative Health Report", W / 2, y, { align: "center" });

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, W / 2, y, { align: "center" });

  y += 15;

  let lastLevel = "";

  for (const grp of completed) {
  if (grp.levelTitle !== lastLevel) {
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.setFont("helvetica", "bold");
    doc.text(grp.levelTitle, margin, y);
    y += 8;
    lastLevel = grp.levelTitle;
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(`• ${grp.sublevelTitle}`, margin + 2, y);
  y += 4;

  const tableData = grp.questions.map(({ questionText, responseText }) => [
    { content: questionText, styles: { cellPadding: 3 } },
    { content: responseText || "—", styles: { cellPadding: 3 } }
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Question", "Answer"]],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: 50
    }
  });

  // ✅ Move y update here, after autoTable is done rendering
  y = doc.lastAutoTable.finalY + 10;

  if (y > H - 30) {
    doc.addPage();
    y = 30;
  }
}

  // Footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, W - margin, H - 10, { align: "right" });
  }

  // Save PDF
  const tempDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(tempDir, { recursive: true });
  const fileName = `healthreport-${levelId}.pdf`;
  const filePath = path.join(tempDir, fileName);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  await fs.writeFile(filePath, pdfBuffer);

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

