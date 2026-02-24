import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function readKeyFromStripeFile(): string | null {
  const path = join(process.cwd(), ".env.stripe");
  try {
    if (!existsSync(path)) return null;
    const content = readFileSync(path, "utf8")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/^\uFEFF/, "");
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      if (t.slice(0, i).trim() !== "STRIPE_SECRET_KEY") continue;
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      val = val.split("#")[0].trim();
      if (val.startsWith("sk_")) return val;
      return null;
    }
  } catch {
    // ignore
  }
  return null;
}

function getStripeKey(): { key: string | null; source: "env" | "file" | null } {
  const fromEnv = process.env.STRIPE_SECRET_KEY?.trim();
  if (fromEnv && fromEnv.startsWith("sk_")) return { key: fromEnv, source: "env" };
  const fromFile = readKeyFromStripeFile();
  if (fromFile) return { key: fromFile, source: "file" };
  return { key: null, source: null };
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, message: "Not available in production" }, { status: 404 });
  }
  const { key, source } = getStripeKey();
  const hasKey = !!(key && key.startsWith("sk_"));
  const stripeFile = join(process.cwd(), ".env.stripe");
  return NextResponse.json({
    STRIPE_SECRET_KEY_set: hasKey,
    startsWith_sk: hasKey,
    length: key?.length ?? 0,
    source,
    cwd: process.cwd(),
    dotEnvStripeExists: existsSync(stripeFile),
    hint: hasKey
      ? "Key is set. Try Buy Now again."
      : existsSync(stripeFile)
        ? "STRIPE_SECRET_KEY in .env.stripe is missing or invalid (must be one line: STRIPE_SECRET_KEY=sk_test_...)."
        : "Create .env.stripe in project root with one line: STRIPE_SECRET_KEY=sk_test_...",
  });
}
