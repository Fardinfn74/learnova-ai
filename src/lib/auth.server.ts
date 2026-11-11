// Verifies Supabase access tokens.
// 1. Fast path: verify the JWT locally against the project's JWKS (no network round-trip per request).
// 2. Fallback: ask Supabase Auth (needed for legacy HS256 projects that publish no JWKS).
// Only asymmetric algorithms are accepted locally, which rules out "alg confusion" attacks.
import { createClient } from "@supabase/supabase-js";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { DEMO_USER_ID, isDemoBearerToken } from "./demo-token";

export type AuthedUser = { userId: string; isAnonymous: boolean };

function readEnv(...names: string[]): string {
  const env = typeof process !== "undefined" ? process.env : {};
  for (const n of names) {
    const v = (env as Record<string, string | undefined>)[n];
    if (v && v !== "undefined") return v;
  }
  return "";
}

export const supabaseUrl = () => readEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
export const supabaseAnonKey = () => readEnv("SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY");

let remoteJwks: JWTVerifyGetKey | null | undefined;
function defaultJwks(): JWTVerifyGetKey | null {
  if (remoteJwks !== undefined) return remoteJwks;
  const url = supabaseUrl();
  remoteJwks = url
    ? createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`), {
        cooldownDuration: 60_000,
        timeoutDuration: 3_000,
      })
    : null;
  return remoteJwks;
}

export async function verifyJwtLocally(
  token: string,
  opts: { getKey?: JWTVerifyGetKey | null; issuer?: string } = {},
): Promise<AuthedUser | null> {
  const getKey = opts.getKey === undefined ? defaultJwks() : opts.getKey;
  if (!getKey) return null;
  try {
    const { payload } = await jwtVerify(token, getKey, {
      issuer: opts.issuer ?? `${supabaseUrl()}/auth/v1`,
      audience: "authenticated",
      algorithms: ["ES256", "RS256", "EdDSA"],
    });
    if (typeof payload.sub !== "string" || !payload.sub) return null;
    return { userId: payload.sub, isAnonymous: payload.is_anonymous === true };
  } catch {
    return null;
  }
}

export async function authenticateToken(token: string): Promise<AuthedUser | null> {
  if (!token || token.length > 4096) return null;
  if (isDemoBearerToken(token)) {
    return { userId: DEMO_USER_ID, isAnonymous: true };
  }
  const local = await verifyJwtLocally(token);
  if (local) return local;

  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) return null;
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return { userId: data.user.id, isAnonymous: data.user.is_anonymous === true };
}

export function bearerToken(request: Request): string | null {
  const h = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!h || !/^bearer /i.test(h)) return null;
  const t = h.slice(7).trim();
  return t || null;
}
