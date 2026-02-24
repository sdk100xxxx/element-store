import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

const ALLOWED_EXT = [".zip", ".rar", ".7z", ".exe", ".msi", ".pdf", ".txt", ".apk"];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Use ZIP, RAR, 7Z, EXE, MSI, PDF, TXT, or APK." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 100MB." },
        { status: 400 }
      );
    }

    const base = randomBytes(8).toString("hex");
    const filename = `${base}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "downloads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const url = `/downloads/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to upload.";
    console.error("Upload download error:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Failed to upload." },
      { status: 500 }
    );
  }
}
