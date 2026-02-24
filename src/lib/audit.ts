import { prisma } from "@/lib/prisma";

type AuditPayload = {
  action: string;
  userId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
};

/** Write an audit log entry (keys added, order paid, etc.) so you have a trail and backup context. */
export async function auditLog(payload: AuditPayload) {
  const { action, userId, entityType, entityId, details } = payload;
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ?? null,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (e) {
    console.error("Audit log write failed:", e);
  }
}
