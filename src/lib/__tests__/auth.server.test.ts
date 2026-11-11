import { describe, expect, it } from "vitest";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";
import { verifyJwtLocally } from "../auth.server";

const ISS = "https://proj.supabase.co/auth/v1";

async function setup() {
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "ES256", use: "sig" };
  return { privateKey, getKey: createLocalJWKSet({ keys: [jwk] }) };
}
const sign = (key: CryptoKey, claims: Record<string, unknown>, o: { iss?: string; aud?: string; exp?: string } = {}) =>
  new SignJWT(claims)
    .setProtectedHeader({ alg: "ES256", kid: "k1" })
    .setIssuer(o.iss ?? ISS).setAudience(o.aud ?? "authenticated")
    .setSubject("user-1").setIssuedAt().setExpirationTime(o.exp ?? "1h").sign(key);

describe("verifyJwtLocally", () => {
  it("accepts a valid Supabase token and reads the user id", async () => {
    const { privateKey, getKey } = await setup();
    const u = await verifyJwtLocally(await sign(privateKey, {}), { getKey, issuer: ISS });
    expect(u).toEqual({ userId: "user-1", isAnonymous: false });
  });
  it("marks anonymous (guest / judge demo) sessions", async () => {
    const { privateKey, getKey } = await setup();
    const u = await verifyJwtLocally(await sign(privateKey, { is_anonymous: true }), { getKey, issuer: ISS });
    expect(u?.isAnonymous).toBe(true);
  });
  it("rejects expired tokens", async () => {
    const { privateKey, getKey } = await setup();
    const t = await sign(privateKey, {}, { exp: "-10s" } as any).catch(() => null);
    // jose refuses to set a past exp via string; craft one manually
    const expired = await new SignJWT({}).setProtectedHeader({ alg: "ES256", kid: "k1" }).setIssuer(ISS).setAudience("authenticated")
      .setSubject("user-1").setIssuedAt(Math.floor(Date.now() / 1000) - 7200).setExpirationTime(Math.floor(Date.now() / 1000) - 3600).sign(privateKey);
    expect(t === null || t).toBeTruthy();
    expect(await verifyJwtLocally(expired, { getKey, issuer: ISS })).toBeNull();
  });
  it("rejects the wrong issuer or audience", async () => {
    const { privateKey, getKey } = await setup();
    expect(await verifyJwtLocally(await sign(privateKey, {}, { iss: "https://evil.example/auth/v1" }), { getKey, issuer: ISS })).toBeNull();
    expect(await verifyJwtLocally(await sign(privateKey, {}, { aud: "anon" }), { getKey, issuer: ISS })).toBeNull();
  });
  it("rejects a token signed by a different key", async () => {
    const { getKey } = await setup();
    const other = await generateKeyPair("ES256");
    expect(await verifyJwtLocally(await sign(other.privateKey, {}), { getKey, issuer: ISS })).toBeNull();
  });
  it("rejects HS256 tokens (alg-confusion attack)", async () => {
    const { getKey } = await setup();
    const forged = await new SignJWT({}).setProtectedHeader({ alg: "HS256", kid: "k1" }).setIssuer(ISS).setAudience("authenticated")
      .setSubject("admin").setExpirationTime("1h").sign(new TextEncoder().encode("any-secret"));
    expect(await verifyJwtLocally(forged, { getKey, issuer: ISS })).toBeNull();
  });
  it("rejects garbage", async () => {
    const { getKey } = await setup();
    expect(await verifyJwtLocally("not.a.jwt", { getKey, issuer: ISS })).toBeNull();
  });
  it("returns null (so the caller falls back to Supabase) when no JWKS is available", async () => {
    expect(await verifyJwtLocally("x.y.z", { getKey: null })).toBeNull();
  });
});
