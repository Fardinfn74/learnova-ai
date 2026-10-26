const DEMO_KEY = "learnova_judge_demo_expiry";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function isDemoActive(): boolean {
  if (typeof window === "undefined") return false;
  const expiry = localStorage.getItem(DEMO_KEY);
  if (!expiry) return false;
  const expiryTime = parseInt(expiry, 10);
  if (isNaN(expiryTime)) return false;
  if (Date.now() > expiryTime) {
    localStorage.removeItem(DEMO_KEY);
    return false;
  }
  return true;
}

export function startDemoTrial(): number {
  if (typeof window === "undefined") return Date.now() + THREE_DAYS_MS;
  const expiryTime = Date.now() + THREE_DAYS_MS;
  localStorage.setItem(DEMO_KEY, expiryTime.toString());
  return expiryTime;
}

export function clearDemoTrial(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_KEY);
}

export function getDemoDaysRemaining(): { days: number; hours: number } {
  if (typeof window === "undefined") return { days: 0, hours: 0 };
  const expiry = localStorage.getItem(DEMO_KEY);
  if (!expiry) return { days: 0, hours: 0 };
  const expiryTime = parseInt(expiry, 10);
  const diff = expiryTime - Date.now();
  if (diff <= 0) return { days: 0, hours: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
}

export const DEMO_USER_PROFILE = {
  id: "judge-demo-user-id",
  display_name: "Honorable Judge (Demo Mode)",
  avatar_url: "/nova-mascot.png",
  xp: 1250,
  level: 5,
  current_streak: 3,
  preferred_language: "English",
  is_demo: true,
};
