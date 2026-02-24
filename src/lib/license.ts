import { customAlphabet } from "nanoid";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SEGMENT_LENGTH = 4;
const SEGMENTS = 4;

const nanoid = customAlphabet(ALPHANUMERIC, SEGMENT_LENGTH);

export function generateLicenseKey(): string {
  return Array.from({ length: SEGMENTS }, () => nanoid()).join("-");
}
