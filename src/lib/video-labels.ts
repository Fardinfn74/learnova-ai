// Shared (client + server) labels for Learn Tube. Keep in sync with the CHECK constraints in the SQL migration.
export const SUBJECTS = ["mathematics", "science", "physics", "chemistry", "biology", "ict_programming", "bangla", "english", "social_science", "religion_ethics", "arts_skills", "test_prep", "early_learning", "career_skills"] as const;
export const GRADES = ["early_years", "primary", "secondary", "higher_secondary", "university", "adult"] as const;
export const LANGS = ["bangla", "english", "mixed"] as const;
export const REPORT_REASONS = ["not_educational", "inappropriate", "unsafe", "copyright", "misinformation", "spam", "other"] as const;

export const SUBJECT_LABEL: Record<string, string> = {
  mathematics: "Mathematics", science: "General Science", physics: "Physics", chemistry: "Chemistry", biology: "Biology",
  ict_programming: "ICT & Programming", bangla: "Bangla", english: "English", social_science: "Social Science",
  religion_ethics: "Religion & Ethics", arts_skills: "Arts & Skills", test_prep: "Exam Preparation",
  early_learning: "Early Learning (3–6)", career_skills: "Career Skills",
};
export const GRADE_LABEL: Record<string, string> = {
  early_years: "Early years (3–6)", primary: "Primary (Class 1–5)", secondary: "Secondary (Class 6–10)",
  higher_secondary: "Higher secondary (11–12)", university: "University", adult: "Adult learners",
};
export const LANG_LABEL: Record<string, string> = { bangla: "বাংলা", english: "English", mixed: "Bangla + English" };
export const REPORT_LABEL: Record<string, string> = {
  not_educational: "Not educational", inappropriate: "Inappropriate for children", unsafe: "Unsafe or dangerous",
  copyright: "Copyright problem", misinformation: "Wrong or misleading", spam: "Spam or advert", other: "Something else",
};
export const STATUS_LABEL: Record<string, { text: string; tone: string }> = {
  draft: { text: "Draft", tone: "bg-muted text-muted-foreground" },
  uploaded: { text: "Queued for checks", tone: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  processing: { text: "Being checked", tone: "bg-blue-500/15 text-blue-600 dark:text-blue-300" },
  needs_review: { text: "With our review team", tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  published: { text: "Live", tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  rejected: { text: "Not approved", tone: "bg-destructive/15 text-destructive" },
  removed: { text: "Removed", tone: "bg-destructive/15 text-destructive" },
};

export function fmtDuration(sec?: number | null): string {
  if (!sec) return "";
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}
export const fmtTaka = (minor: number) => `৳${(minor / 100).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
