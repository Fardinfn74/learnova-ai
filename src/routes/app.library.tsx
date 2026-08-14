import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search, Sparkles, Filter, Bookmark, Play, ArrowRight, X, CheckCircle, Volume2, FileText, Award, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/app/library")({
  component: LibraryPage,
});

type Material = {
  id: string;
  title: string;
  category: "Storybooks" | "Animated Notes" | "Workbooks" | "Abacus & Math" | "Programming";
  ageGroup: "3-6 yrs" | "7-10 yrs" | "11-15 yrs" | "All Ages";
  language: "Bangla" | "English" | "Dual";
  description: string;
  content: string;
  readTime: string;
  reads: number;
  featured?: boolean;
};

const SAMPLE_MATERIALS: Material[] = [
  {
    id: "abacus-1",
    title: "Magic Abacus: Quick Addition & Mental Math",
    category: "Abacus & Math",
    ageGroup: "7-10 yrs",
    language: "Dual",
    featured: true,
    description: "Master fast mental addition using the visual soroban abacus method with step-by-step illustrations.",
    content: `
# 🧮 Magic Abacus: Mental Fast Math!

The Abacus (Soroban) helps children visualize numbers as physical beads. When you move beads, your brain builds strong spatial memory for rapid arithmetic!

---

### 1. The Structure of the Soroban Abacus
* **Upper Deck (Heaven Bead):** Value of **5**.
* **Lower Deck (Earth Beads):** 4 beads, each worth **1**.
* **Beam/Bar:** Active beads touch the central beam!

---

### 2. Quick Addition Rules
1. **Adding 1 to 4:** Push up Earth beads toward the beam with your thumb.
2. **Adding 5:** Pull down the Heaven bead with your index finger.
3. **Adding 9:** Combine Heaven bead (5) + 4 Earth beads (4) = **9**.

---

### 💡 Practice Challenge:
Try solving this mentally:
$3 + 5 - 2 = ?$
* *Step 1:* Push up 3 lower beads.
* *Step 2:* Pull down 1 upper bead (+5 = 8).
* *Step 3:* Push down 2 lower beads (-2 = **6**!).
    `,
    readTime: "5 min read",
    reads: 1420,
  },
  {
    id: "story-1",
    title: "Nova's Journey to Starland (নোভার তারার দেশ ভ্রমণ)",
    category: "Storybooks",
    ageGroup: "3-6 yrs",
    language: "Bangla",
    featured: true,
    description: "An enchanting bedtime science story in Bangla teaching young toddlers about planets, stars, and curiosity.",
    content: `
# 🌟 নোভার তারার দেশ ভ্রমণ

এক সময় এক ছোট্ট বন্ধু ছিল, তার নাম **নোভা**। নোভা প্রতি রাতে আকাশের দিকে তাকিয়ে থাকত এবং ভাবত, "তারাগুলো এত মিটিমিটি করে জ্বলে কেন?"

---

### 🚀 অভিযানের শুরু
একদিন রাতে একটি সুন্দর রূপালী তারা নোভাকে বলল, "এসো নোভা, তোমাকে মহাকাশের গল্প শোনাই!"

* **সূর্য (Sun):** আমাদের সবচেয়ে কাছের তারা, যা আমাদের আলো ও ওম দেয়।
* **চাঁদ (Moon):** রাতের আকাশে মিষ্টি আলো ছড়ায়।
* **গ্রহসমূহ (Planets):** পৃথিবীর মতো আরও ৭টি বন্ধু গ্রহ সূর্যকে ঘিরে ঘুরে বেড়ায়!

---

### 💖 নোভার শিক্ষা
নোভা শিখল যে পৃথিবী একটি সুন্দর গ্রহ, আর শিখতে কোন বয়স লাগে না! প্রশ্ন করাই হলো সবচেয়ে সুন্দর জ্ঞান।
    `,
    readTime: "4 min read",
    reads: 2890,
  },
  {
    id: "prog-1",
    title: "Kids Coding with Scratch & Nova Logic",
    category: "Programming",
    ageGroup: "7-10 yrs",
    language: "English",
    featured: false,
    description: "Learn algorithm basics, loops, and conditional statements through fun blocks and friendly exercises.",
    content: `
# 💻 Kids Coding: Algorithms & Logic

Coding is just giving clear step-by-step commands to a computer, like writing a recipe for a robot!

---

### 🤖 1. What is an Algorithm?
An **Algorithm** is a sequence of steps to solve a problem.

**Making a Sandwich Algorithm:**
1. Get two slices of bread.
2. Spread peanut butter or jam.
3. Put slices together!

If you skip step 1, you get a messy hand! Computers need exact steps too.

---

### 🔁 2. Loops (Repeat Blocks)
Instead of saying: *Walk forward, Walk forward, Walk forward...*
We say: **Repeat 3 times { Walk forward }**.

---

### 🎯 Practice Puzzle
Write down the steps to help Nova collect 3 stars!
    `,
    readTime: "6 min read",
    reads: 980,
  },
  {
    id: "wb-1",
    title: "Pre-School Phonics & Bangla Barnamala Workbook",
    category: "Workbooks",
    ageGroup: "3-6 yrs",
    language: "Dual",
    featured: false,
    description: "Interactive pronunciation workbook with audio phonics, vowel sounds, and fun writing practice.",
    content: `
# 🎨 Pre-School Phonics & বাংলা বর্ণমালা

Learn to connect sounds with letters in both Bangla and English!

---

### 🇧🇩 বাংলা স্বরবর্ণ (Vowels)
* **অ** - অজগর (Ojogor) 🐍
* **আ** - আম (Aam) 🥭
* **ই** - ইঁদুর (Indur) 🐭

---

### 🇬🇧 English Phonics
* **A** /æ/ - Apple 🍎
* **B** /b/ - Ball ⚽
* **C** /k/ - Cat 🐱

---

### ✏️ Practice Activity
Say the sound of each letter out loud three times with Nova!
    `,
    readTime: "8 min read",
    reads: 3120,
  },
  {
    id: "note-1",
    title: "Fun Science Notes: How Plants Make Food (Photosynthesis)",
    category: "Animated Notes",
    ageGroup: "11-15 yrs",
    language: "English",
    featured: false,
    description: "Illustrated visual guide breaking down plant respiration, sunlight, chlorophyll, and oxygen release.",
    content: `
# 🌿 Photosynthesis Made Super Simple!

Plants don't eat burgers or pizza—they make their own food using sunlight! This amazing process is called **Photosynthesis**.

---

### 🧪 The Recipe for Plant Food:
1. **Sunlight ☀️:** Energy source from the sun.
2. **Water 💧:** Absorbed from soil by roots.
3. **Carbon Dioxide 🌬️:** Taken from air through tiny leaf pores (*Stomata*).
4. **Chlorophyll 🍃:** Green pigment inside leaves that captures light.

---

### ⚛️ The Magical Equation
$$Water + Carbon Dioxide + Sunlight \rightarrow Glucose (Sugar) + Oxygen$$

Plants keep the sugar to grow big and release fresh **Oxygen** for us to breathe!
    `,
    readTime: "5 min read",
    reads: 1850,
  },
];

export function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeAge, setActiveAge] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const categories = ["All", "Storybooks", "Animated Notes", "Workbooks", "Abacus & Math", "Programming"];
  const ageGroups = ["All", "3-6 yrs", "7-10 yrs", "11-15 yrs"];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter((b) => b !== id));
      toast.info("Removed from bookmarks");
    } else {
      setBookmarks([...bookmarks, id]);
      toast.success("Saved to bookmarks!");
    }
  };

  const filteredMaterials = SAMPLE_MATERIALS.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesAge = activeAge === "All" || item.ageGroup === activeAge;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesAge && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-10 text-primary-foreground shadow-glow">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Interactive Kids & Student Library
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Discover Stories, Notes & Workbooks
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
            Curated age-appropriate learning resources in Bangla and English. Explore abacus guides, animated science notes, pre-school workbooks, and programming guides.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass rounded-2xl p-4 md:p-6 space-y-4 ring-gradient">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stories, abacus, math, coding..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card/80 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {/* Age Group Filter */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Age:
            </span>
            {ageGroups.map((age) => (
              <button
                key={age}
                onClick={() => setActiveAge(age)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition shrink-0 border",
                  activeAge === age
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "border-border/60 hover:bg-muted text-muted-foreground"
                )}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-border/40">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5",
                activeCategory === cat
                  ? "gradient-hero text-primary-foreground shadow-glow"
                  : "glass text-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Material Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => {
          const isBookmarked = bookmarks.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => setSelectedMaterial(item)}
              className="group glass rounded-3xl p-6 cursor-pointer hover:scale-[1.02] hover:shadow-glow transition-all flex flex-col justify-between border border-border/50 relative overflow-hidden"
            >
              {item.featured && (
                <span className="absolute top-4 right-4 bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="h-3 w-3" /> Featured
                </span>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span>•</span>
                  <span>{item.ageGroup}</span>
                  <span>•</span>
                  <span>{item.language}</span>
                </div>

                <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-primary" /> {item.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" /> {item.reads}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleBookmark(item.id, e)}
                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition"
                  >
                    <Bookmark
                      className={cn("h-4 w-4", isBookmarked && "fill-primary text-primary")}
                    />
                  </button>
                  <span className="font-semibold text-primary group-hover:translate-x-1 transition flex items-center gap-1">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl p-8 space-y-3">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold">No materials found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or selecting a different age group or category.
          </p>
        </div>
      )}

      {/* Reader Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl grid place-items-center p-4 overflow-y-auto">
          <div className="glass rounded-3xl max-w-3xl w-full p-6 md:p-10 space-y-6 relative border border-border shadow-2xl my-8">
            <button
              onClick={() => setSelectedMaterial(null)}
              className="absolute top-6 right-6 p-2 rounded-full glass hover:bg-muted transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 pr-10">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-full">
                  {selectedMaterial.category}
                </span>
                <span>{selectedMaterial.ageGroup}</span>
                <span>•</span>
                <span>{selectedMaterial.readTime}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold gradient-text">
                {selectedMaterial.title}
              </h2>
            </div>

            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none glass rounded-2xl p-6 bg-card/50 leading-relaxed max-h-[60vh] overflow-y-auto">
              <ReactMarkdown>{selectedMaterial.content}</ReactMarkdown>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/40">
              <button
                onClick={() => toast.success("Nova audio voiceover starting soon!")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition"
              >
                <Volume2 className="h-4 w-4" /> Listen with Nova Audio
              </button>

              <button
                onClick={() => setSelectedMaterial(null)}
                className="gradient-hero text-primary-foreground font-semibold px-6 py-2.5 rounded-xl shadow-glow hover:scale-105 transition text-sm"
              >
                Done Reading ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
