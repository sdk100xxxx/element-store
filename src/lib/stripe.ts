import Stripe from "stripe";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

let _stripe: Stripe | null = null;

/** Read a STRIPE_* value from .env.stripe by key name. */
function readFromStripeFile(keyName: string): string | null {
  const root = process.cwd();
  const path = join(root, ".env.stripe");
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
      const name = t.slice(0, i).trim();
      if (name !== keyName) continue;
      let val = t.slice(i + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      val = val.split("#")[0].trim();
      return val || null;
    }
  } catch {
    // ignore
  }
  return null;
}

function getStripeKey(): string | null {
  const fromEnv = process.env.STRIPE_SECRET_KEY?.trim();
  if (fromEnv && fromEnv.startsWith("sk_")) return fromEnv;
  const fromFile = readFromStripeFile("STRIPE_SECRET_KEY");
  if (fromFile?.startsWith("sk_")) return fromFile;
  return null;
}

/** Webhook signature verification; read from env or .env.stripe. */
export function getStripeWebhookSecret(): string | null {
  const fromEnv = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (fromEnv && fromEnv.startsWith("whsec_")) return fromEnv;
  const fromFile = readFromStripeFile("STRIPE_WEBHOOK_SECRET");
  if (fromFile?.startsWith("whsec_")) return fromFile;
  return null;
}

function getStripeInstance(): Stripe | null {
  if (_stripe) return _stripe;
  const key = getStripeKey();
  if (!key) return null;
  _stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  return _stripe;
}

export function getStripe(): Stripe | null {
  return getStripeInstance();
}
