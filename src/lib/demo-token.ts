export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
export const DEMO_BEARER_TOKEN = "learnova-judge-demo-token";

export function isDemoBearerToken(token: string): boolean {
  return token === DEMO_BEARER_TOKEN;
}
