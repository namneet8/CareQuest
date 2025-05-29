import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tempDir = path.join(process.cwd(), "tmp");
    const files = await fs.readdir(tempDir);
    const userReports = files
      .filter((file) => file.match(/^healthreport-[1-3]\.pdf$/))
      .map((file) => {
        const levelId = file.match(/^healthreport-([1-3])\.pdf$/)![1];
        return {
          levelId,
          fileName: file,
          url: `/api/reports/${levelId}`,
          createdAt: new Date(), // Optionally, get actual creation date from file stats or database
        };
      });

    return NextResponse.json({ reports: userReports });
  } catch (e) {
    console.error("Failed to list reports:", e);
    return NextResponse.json({ error: "Failed to list reports" }, { status: 500 });
  }
}