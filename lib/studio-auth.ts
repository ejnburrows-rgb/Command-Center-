import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME, expectedToken } from "./auth";

export async function studioAuthorized(): Promise<boolean> {
  const expected = await expectedToken();
  if (!expected) return false;
  const supplied = (await cookies()).get(COOKIE_NAME)?.value || "";
  const a = createHash("sha256").update(supplied).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
