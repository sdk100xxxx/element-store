import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { put as putBlob } from "@vercel/blob";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_SIZE_BLOB = 4.5 * 1024 * 1024; // 4.5MB (Vercel server upload limit)

export async function POST(req: Request) {
  const authErr = await requireAdmin();
  if (authErr) return authErr;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
    const maxSize = useBlob ? MAX_SIZE_BLOB : MAX_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: useBlob
            ? "File too large. Max 4.5MB for production uploads."
            : "File too large. Max 5MB.",
        },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || ".png";
    const base = randomBytes(8).toString("hex");
    const filename = `${base}${ext}`;

    if (useBlob) {
      const blob = await putBlob(`uploads/${filename}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to upload.";
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Failed to upload." },
      { status: 500 }
    );
  }
}
