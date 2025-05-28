// app/api/generate-report/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCompletedSublevelsWithResponses } from "@/db/queries";  // ← our new helper
import jsPDF from "jspdf";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1) grab every finished sublevel (with level+sublevel titles, questions, AND mapped responseText)
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

    // header
    doc.setFontSize(20);
    doc.text("Cumulative Health Report", W / 2, y, { align: "center" });
    y += 15;
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, W / 2, y, { align: "center" });
    y += 20;

    let lastLevel = "";
    for (const grp of completed) {
      // page break
      if (y > maxY) { doc.addPage(); y = 30; }

      // level header (once)
      if (grp.levelTitle !== lastLevel) {
        doc.setFontSize(16);
        doc.text(grp.levelTitle, margin, y);
        y += 8;
        lastLevel = grp.levelTitle;
      }

      // sublevel header
      doc.setFontSize(14);
      doc.text(`• ${grp.sublevelTitle}`, margin + 5, y);
      y += 6;

      // each question + its mapped .responseText
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

      y += 8; // space before next sublevel
    }

    const buf = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=cumulative-report.pdf`,
      },
    });
  } catch (e) {
    console.error("PDF generation failed:", e);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
