import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Play, CheckCircle, Trophy, Sparkles, Clock, BookOpen, Star, Award, ArrowRight, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { awardXp } from "@/lib/learnova.functions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/app/courses")({
  component: CoursesPage,
});

type CourseModule = {
  id: string;
  title: string;
  duration: string;
  content: string;
  question: string;
  options: string[];
  correctIndex: number;
};

type Course = {
  id: string;
  title: string;
  category: string;
  ageGroup: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  xpReward: number;
  modules: CourseModule[];
  badge: string;
};

const COURSES: Course[] = [
  {
    id: "abacus-mastery",
    title: "Fun Abacus & Mental Math Masterclass",
    category: "Math & Abacus",
    ageGroup: "5–12 yrs",
    level: "Beginner",
    xpReward: 150,
    badge: "🧮 Abacus Genius",
    description: "Learn Soroban abacus finger techniques, fast addition, subtraction, and mental visualization tricks.",
    modules: [
      {
        id: "m1",
        title: "Module 1: Meet the Soroban Abacus",
        duration: "10 mins",
        content: `
### Welcome to Soroban Abacus! 🧮

The Soroban is a traditional Japanese abacus used to calculate at lightning speed.

* **Top Bead (Heaven):** Worth **5**
* **Bottom Beads (Earth):** 4 beads worth **1** each.

**Rule:** Active beads must be moved towards the **Central Beam**.
        `,
        question: "What is the value of 1 upper (heaven) bead when touching the central beam?",
        options: ["1", "5", "10", "0"],
        correctIndex: 1,
      },
      {
        id: "m2",
        title: "Module 2: The Magic 5 & 10 Complements",
        duration: "15 mins",
        content: `
### Complement Formula Tricks ⚡

When you run out of beads on a rod, use **Complements**!

* **5 Complement of 1:** $5 - 4 = 1$
* **10 Complement of 7:** $10 - 3 = 7$

Visualizing these pairs makes mental math automatic!
        `,
        question: "What is the 10-complement of 6?",
        options: ["2", "3", "4", "5"],
        correctIndex: 2,
      },
    ],
  },
  {
    id: "pre-school-phonics",
    title: "Pre-School Phonics & Bangla Barnamala",
    category: "Early Childhood",
    ageGroup: "3–6 yrs",
    level: "Beginner",
    xpReward: 100,
    badge: "🎨 Alphabet Star",
    description: "Interactive pronunciation, Bangla vowels (স্বরবর্ণ), consonants, and English phonics for young kids.",
    modules: [
      {
        id: "m1",
        title: "Module 1: Bangla Swarabarna (বাংলা স্বরবর্ণ)",
        duration: "8 mins",
        content: `
### বাংলা স্বরবর্ণ পরিচিতি 🇧🇩

বাংলা ভাষায় ১১টি স্বরবর্ণ রয়েছে!

1. **অ** - অজগর আসছে তেড়ে!
2. **আ** - আমটি আমি খাব পেড়ে!
3. **ই** - ইঁদুর ছানা ভয়ে মরে!
        `,
        question: "'আমটি আমি খাব পেড়ে' কোন স্বরবর্ণ দিয়ে শুরু হয়?",
        options: ["অ", "আ", "ই", "ঈ"],
        correctIndex: 1,
      },
      {
        id: "m2",
        title: "Module 2: English Phonics Sounds A to D",
        duration: "10 mins",
        content: `
### English Phonics 🇬🇧

* **A /æ/:** Apple 🍎
* **B /b/:** Ball ⚽
* **C /k/:** Cat 🐱
* **D /d/:** Dog 🐶
        `,
        question: "What is the phonetic sound of letter 'B'?",
        options: ["/k/", "/b/", "/æ/", "/d/"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "kids-coding-nova",
    title: "Kids Coding & AI Logic with Nova",
    category: "Programming",
    ageGroup: "7–15 yrs",
    level: "Intermediate",
    xpReward: 200,
    badge: "💻 Code Wizard",
    description: "Learn computational thinking, variables, loops, and conditions using friendly block-based concepts.",
    modules: [
      {
        id: "m1",
        title: "Module 1: What is Code & Loops?",
        duration: "12 mins",
        content: `
### What is a Loop in Programming? 🔁

A **Loop** allows code to repeat actions without writing the same code over and over!

Example in pseudocode:
\`\`\`
repeat 4 times:
  move_forward()
  turn_right()
\`\`\`
This draws a perfect square! 🔲
        `,
        question: "How many times does the loop execute in the code snippet above?",
        options: ["2", "4", "8", "Forever"],
        correctIndex: 1,
      },
    ],
  },
];

export function CoursesPage() {
  const award = useServerFn(awardXp);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [currentModuleIdx, setCurrentModuleIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [completedModules, setCompletedModules] = useState<Record<string, boolean>>({});

  const handleStartCourse = (course: Course) => {
    setActiveCourse(course);
    setCurrentModuleIdx(0);
    setSelectedOption(null);
  };

  const handleAnswerSubmit = async () => {
    if (!activeCourse || selectedOption === null) return;
    const currentMod = activeCourse.modules[currentModuleIdx];
    if (selectedOption === currentMod.correctIndex) {
      toast.success("Correct Answer! +25 XP 🎉");
      setCompletedModules((prev) => ({ ...prev, [`${activeCourse.id}-${currentMod.id}`]: true }));
      try {
        await award({ data: { amount: 25, reason: `Completed module in ${activeCourse.title}` } });
      } catch (e) {
        // ignore errors
      }

      if (currentModuleIdx + 1 < activeCourse.modules.length) {
        setCurrentModuleIdx((prev) => prev + 1);
        setSelectedOption(null);
      } else {
        toast.success(`Congratulations! Course Completed! Unlocked ${activeCourse.badge}!`);
      }
    } else {
      toast.error("Oops! Try again.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Course Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-10 text-primary-foreground shadow-glow">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
            <GraduationCap className="h-3.5 w-3.5" /> Interactive Courses for Kids & Students
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Learn Abacus, Phonics & Coding
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
            Gamified step-by-step courses engineered for kids (ages 3–15) and learners. Complete modules, answer quiz checks, and collect XP badges!
          </p>
        </div>
      </div>

      {/* Courses Catalog */}
      <div className="grid md:grid-cols-3 gap-6">
        {COURSES.map((course) => {
          return (
            <div
              key={course.id}
              className="glass rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:shadow-glow hover:scale-[1.02] transition border border-border/50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-muted-foreground">{course.ageGroup}</span>
                </div>

                <h3 className="font-bold text-xl">{course.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Trophy className="h-3.5 w-3.5" /> +{course.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> {course.modules.length} Modules
                  </span>
                  <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold">
                    {course.level}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleStartCourse(course)}
                className="w-full gradient-hero text-primary-foreground font-semibold py-3 rounded-2xl shadow-glow hover:scale-105 transition flex items-center justify-center gap-2 text-sm"
              >
                <Play className="h-4 w-4 fill-current" /> Start Course
              </button>
            </div>
          );
        })}
      </div>

      {/* Course Player Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl grid place-items-center p-4 overflow-y-auto">
          <div className="glass rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 relative border border-border shadow-2xl my-8">
            <button
              onClick={() => setActiveCourse(null)}
              className="absolute top-6 right-6 p-2 rounded-full glass hover:bg-muted transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 pr-10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-full">
                  {activeCourse.category}
                </span>
                <span>Module {currentModuleIdx + 1} of {activeCourse.modules.length}</span>
              </div>
              <h2 className="text-2xl font-bold gradient-text">{activeCourse.title}</h2>
            </div>

            {/* Module Content */}
            <div className="glass rounded-2xl p-6 bg-card/60 space-y-4">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {activeCourse.modules[currentModuleIdx].title}
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
                <ReactMarkdown>{activeCourse.modules[currentModuleIdx].content}</ReactMarkdown>
              </div>
            </div>

            {/* Quiz Checkpoint */}
            <div className="glass rounded-2xl p-6 space-y-4 border border-primary/20">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Module Checkpoint Quiz
              </h4>
              <p className="text-sm font-semibold">
                {activeCourse.modules[currentModuleIdx].question}
              </p>

              <div className="grid gap-2">
                {activeCourse.modules[currentModuleIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(i)}
                    className={cn(
                      "text-left p-3 rounded-xl border text-sm font-medium transition flex items-center justify-between",
                      selectedOption === i
                        ? "border-primary bg-primary/20 font-bold"
                        : "border-border/60 hover:bg-muted"
                    )}
                  >
                    <span>{opt}</span>
                    {selectedOption === i && <CheckCircle className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedOption === null}
                  className="gradient-hero text-primary-foreground font-semibold px-6 py-2.5 rounded-xl shadow-glow hover:scale-105 transition disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  Verify Answer & Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
