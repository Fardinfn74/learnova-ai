import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Play,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ThumbsUp,
  User,
  Clock,
  Eye,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { verifyEducationalVideo } from "@/lib/video.functions";
import { awardXp } from "@/lib/learnova.functions";
import { type GuardrailResult } from "@/lib/video-guardrail";
import { toast } from "sonner";
import { Nova } from "@/components/Nova";

export const Route = createFileRoute("/app/videos")({
  component: EduTubeVideoHubPage,
  head: () => ({
    meta: [
      { title: "EduTube Video Hub — LEARNOVA" },
      {
        name: "description",
        content: "Verified educational and learning videos for students, kids, and educators with strict guardrails.",
      },
    ],
  }),
});

export type LearningVideo = {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorRole: string;
  category: "Math & Abacus" | "Science & Physics" | "Programming" | "Languages & Phonics" | "Study Skills";
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  likes: number;
  guardrailScore: number;
  publishedAt: string;
  keyLearnings: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
};

const INITIAL_EDUCATIONAL_VIDEOS: LearningVideo[] = [
  {
    id: "vid-abacus-foundations",
    title: "Master the Soroban Abacus: Fast Mental Addition Secrets",
    description: "Step-by-step masterclass teaching the Japanese soroban abacus. Learn finger movements, heaven/earth bead values, and how to visualize additions without pencil and paper.",
    creatorName: "Master Arif Hossain",
    creatorRole: "Certified Abacus Instructor",
    category: "Math & Abacus",
    videoUrl: "https://www.youtube.com/embed/1kH_XU7e4_0",
    thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
    duration: "14:20",
    views: 4520,
    likes: 382,
    guardrailScore: 98,
    publishedAt: "2 days ago",
    level: "Beginner",
    keyLearnings: [
      "Understanding upper bead (Heaven = 5) and lower beads (Earth = 1)",
      "Moving beads strictly toward the center reading bar",
      "Calculating 1-9 combinations with index & thumb synchronization"
    ],
  },
  {
    id: "vid-python-loops",
    title: "Python for Beginners: Understanding For Loops & Algorithms",
    description: "Clear animated programming lecture explaining how iterations, range() functions, and list loops operate under the hood in computer memory.",
    creatorName: "Tahmid Nafi",
    creatorRole: "Full Stack Engineer & Educator",
    category: "Programming",
    videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    duration: "18:45",
    views: 8940,
    likes: 814,
    guardrailScore: 99,
    publishedAt: "4 days ago",
    level: "Intermediate",
    keyLearnings: [
      "Why loops prevent redundant repetitive code",
      "Trace table debugging using print() and variables",
      "Building a simple quiz evaluator in under 10 lines of code"
    ],
  },
  {
    id: "vid-bangla-phonics",
    title: "Bangla Bornomala Pronunciation & Phonics for Kids (বাংলা স্বরবর্ণ)",
    description: "Gentle and joyful phonetics guide for children and beginners learning Bangla vowels (অ, আ, ই, ঈ) with correct tongue placement and vocabulary examples.",
    creatorName: "Sharmin Sultana",
    creatorRole: "Early Childhood Specialist",
    category: "Languages & Phonics",
    videoUrl: "https://www.youtube.com/embed/9G3XgLqKx7M",
    thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60",
    duration: "09:30",
    views: 12400,
    likes: 1205,
    guardrailScore: 97,
    publishedAt: "1 week ago",
    level: "Beginner",
    keyLearnings: [
      "Correct Bengali vowel phonetics without dialect slurs",
      "Connecting vowel symbols with real everyday objects",
      "Fun call-and-response rhyme technique"
    ],
  },
  {
    id: "vid-physics-gravity",
    title: "Why Objects Fall at the Same Speed: Gravity & Vacuum Chambers",
    description: "Visual physics experiment demonstrating Galileo's and Apollo 15 feather-and-hammer drop inside a vacuum chamber. Understand mass, acceleration, and air resistance.",
    creatorName: "Dr. Ryan Vance",
    creatorRole: "STEM Physics Lecturer",
    category: "Science & Physics",
    videoUrl: "https://www.youtube.com/embed/E43-CfukEgs",
    thumbnailUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=60",
    duration: "11:15",
    views: 18230,
    likes: 1940,
    guardrailScore: 100,
    publishedAt: "3 weeks ago",
    level: "Advanced",
    keyLearnings: [
      "Distinction between inertial mass and gravitational acceleration (9.8 m/s²)",
      "Why terminal velocity occurs in atmospheric conditions",
      "Mathematical derivation of Newton's universal gravitation formula"
    ],
  },
];

const STORAGE_KEY = "learnova_edutube_videos_v1";

function loadStoredVideos(): LearningVideo[] {
  if (typeof window === "undefined") return INITIAL_EDUCATIONAL_VIDEOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_EDUCATIONAL_VIDEOS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    // fallback
  }
  return INITIAL_EDUCATIONAL_VIDEOS;
}

export function EduTubeVideoHubPage() {
  const [videos, setVideos] = useState<LearningVideo[]>(() => loadStoredVideos());
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(() => INITIAL_EDUCATIONAL_VIDEOS[0]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  // Creator form state
  const [newTitle, setNewTitle] = useState("");
  const [newCreatorName, setNewCreatorName] = useState("");
  const [newCreatorRole, setNewCreatorRole] = useState("Educator / Teacher");
  const [newCategory, setNewCategory] = useState<LearningVideo["category"]>("Math & Abacus");
  const [newLevel, setNewLevel] = useState<LearningVideo["level"]>("Beginner");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newKeyLearnings, setNewKeyLearnings] = useState("");

  // Guardrail Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [guardrailResult, setGuardrailResult] = useState<GuardrailResult | null>(null);

  // Nova Companion Q&A state
  const [userQuestion, setUserQuestion] = useState("");
  const [novaAnswers, setNovaAnswers] = useState<Array<{ q: string; a: string }>>([]);
  const [isAskingNova, setIsAskingNova] = useState(false);

  // Awards server fn
  const award = useServerFn(awardXp);
  const verifyFn = useServerFn(verifyEducationalVideo);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    } catch {
      // storage unavailable
    }
  }, [videos]);

  const categories = ["All", "Math & Abacus", "Science & Physics", "Programming", "Languages & Phonics", "Study Skills"];

  const handleWatchReward = async (video: LearningVideo) => {
    try {
      await award({ data: { amount: 15, reason: `Watched educational video: ${video.title.slice(0, 40)}` } });
      toast.success("Learner XP Awarded! +15 XP 🎓");
    } catch {
      // ignore
    }
  };

  const handleTestPreset = (type: "valid" | "cringe" | "nsfw") => {
    setGuardrailResult(null);
    if (type === "valid") {
      setNewTitle("Step-by-Step Calculus: Limits & Derivatives Explained Simply");
      setNewCreatorName("Prof. Tanvir Ahmed");
      setNewCreatorRole("Mathematics Professor");
      setNewCategory("Math & Abacus");
      setNewLevel("Intermediate");
      setNewVideoUrl("https://www.youtube.com/embed/5yvhms4_eS0");
      setNewDescription("A complete lesson breaking down geometric intuition of derivatives, epsilon-delta definitions, and practical physics examples for college students.");
      setNewKeyLearnings("1. Rate of change definition\n2. Power rule proof\n3. Real-world velocity modeling");
    } else if (type === "cringe") {
      setNewTitle("SKIBIDI SIGMA TIKTOK DANCE CHALLENGE 3AM GONE WRONG!");
      setNewCreatorName("Prankster123");
      setNewCreatorRole("Influencer");
      setNewCategory("Study Skills");
      setNewLevel("Beginner");
      setNewVideoUrl("https://www.youtube.com/embed/example");
      setNewDescription("Watch me do funny cringe brainrot dances in a grocery store for views and clout! Not learning anything just lol funny meme.");
      setNewKeyLearnings("Funny dance moves\nLaughing at strangers");
    } else {
      setNewTitle("18+ NSFW Secret Adult Dating Tricks & OnlyFans Hacks");
      setNewCreatorName("Anonymous");
      setNewCreatorRole("Content Creator");
      setNewCategory("Study Skills");
      setNewLevel("Advanced");
      setNewVideoUrl("https://www.youtube.com/embed/example2");
      setNewDescription("Explicit NSFW dating hacks and adult content guidelines.");
      setNewKeyLearnings("Adult tricks\nLewd content");
    }
  };

  const handleRunGuardrailCheck = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error("Please enter a video title and educational description first.");
      return;
    }

    setIsVerifying(true);
    setGuardrailResult(null);

    try {
      const res = await verifyFn({
        data: {
          title: newTitle,
          description: newDescription,
          category: newCategory,
          targetAudience: newLevel,
          sampleTranscriptOrOutline: newKeyLearnings,
        },
      });
      setGuardrailResult(res);
      if (res.isApproved) {
        toast.success("✅ Guardrail Check Passed! Video approved for publication.");
      } else {
        toast.error("❌ Guardrail Rejected: Content is not educational or violates safety rules.");
      }
    } catch (err: any) {
      toast.error("Inspection error: " + (err.message || "Failed to verify"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePublishVideo = () => {
    if (!guardrailResult || !guardrailResult.isApproved) {
      toast.error("You must pass the strict educational guardrail check before publishing!");
      return;
    }

    let embedUrl = newVideoUrl.trim();
    if (embedUrl.includes("watch?v=")) {
      const id = embedUrl.split("watch?v=")[1]?.split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (embedUrl.includes("youtu.be/")) {
      const id = embedUrl.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    }
    if (!embedUrl) {
      embedUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // fallback safe embed
    }

    const created: LearningVideo = {
      id: "vid-" + Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      creatorName: newCreatorName.trim() || "Educator",
      creatorRole: newCreatorRole.trim() || "Instructor",
      category: newCategory,
      videoUrl: embedUrl,
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
      duration: "10:00",
      views: 1,
      likes: 1,
      guardrailScore: guardrailResult.score,
      publishedAt: "Just now",
      level: newLevel,
      keyLearnings: newKeyLearnings
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    };

    setVideos((prev) => [created, ...prev]);
    setSelectedVideo(created);
    setIsCreatorModalOpen(false);

    // reset
    setNewTitle("");
    setNewDescription("");
    setNewVideoUrl("");
    setNewKeyLearnings("");
    setGuardrailResult(null);

    toast.success("🎉 Video Successfully Published to LEARNOVA EduTube!");
  };

  const handleAskNova = () => {
    if (!userQuestion.trim() || !selectedVideo) return;
    setIsAskingNova(true);
    const q = userQuestion.trim();
    setUserQuestion("");

    setTimeout(() => {
      let simulatedReply = `Here is a clear explanation regarding "${selectedVideo.title}": Focus on the fundamentals covered in this lesson. Breaking it down into mini-steps will help reinforce your understanding!`;
      if (q.toLowerCase().includes("abacus")) {
        simulatedReply = "Remember: The upper bead equals 5, and the 4 lower beads equal 1 each. Move beads with your thumb and index fingers toward the center beam.";
      } else if (q.toLowerCase().includes("python") || q.toLowerCase().includes("loop")) {
        simulatedReply = "A loop repeats an action over a sequence. For example, `for i in range(5)` will loop 5 times with `i` taking values from 0 up to 4.";
      }
      setNovaAnswers((prev) => [...prev, { q, a: simulatedReply }]);
      setIsAskingNova(false);
    }, 700);
  };

  const filteredVideos = videos.filter((v) => {
    const matchesCat = activeCategory === "All" || v.category === activeCategory;
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-6 md:p-10 text-primary-foreground shadow-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Strict Educational Guardrail Protected
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            LEARNOVA <span className="underline decoration-amber-300">EduTube</span> Hub
          </h1>
          <p className="text-primary-foreground/90 text-sm md:text-base leading-relaxed">
            A safe, verified learning video platform where teachers, professors, and creators share curriculum lectures. Zero cringe, zero NSFW, zero memes — 100% verified educational pedagogy checked by AI.
          </p>
        </div>

        <button
          onClick={() => setIsCreatorModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-white text-primary font-black hover:bg-white/90 shadow-2xl transition flex items-center gap-2 text-sm shrink-0 hover:scale-105 active:scale-95"
        >
          <Upload className="h-4 w-4" />
          <span>Publish Video (Teacher Studio)</span>
        </button>
      </div>

      {/* Featured Player & Learning Theater */}
      {selectedVideo && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video Screen */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden glass border border-border shadow-2xl bg-black">
              {selectedVideo.videoUrl.includes("youtube.com") || selectedVideo.videoUrl.includes("youtu.be") ? (
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-white">
                  <Play className="h-16 w-16 opacity-70" />
                </div>
              )}
            </div>

            {/* Video Meta Info */}
            <div className="glass rounded-3xl p-6 space-y-4 border border-border/60">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {selectedVideo.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                    {selectedVideo.level}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    EduGuardrail: {selectedVideo.guardrailScore}/100
                  </span>
                </div>

                <button
                  onClick={() => handleWatchReward(selectedVideo)}
                  className="px-4 py-1.5 rounded-full gradient-hero text-primary-foreground text-xs font-bold shadow-glow hover:scale-105 transition flex items-center gap-1.5"
                >
                  <Award className="h-3.5 w-3.5" />
                  Claim +15 XP for Learning
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
                {selectedVideo.title}
              </h2>

              <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full gradient-hero grid place-items-center text-white font-bold">
                    {selectedVideo.creatorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{selectedVideo.creatorName}</div>
                    <div className="text-[11px] text-muted-foreground">{selectedVideo.creatorRole}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {selectedVideo.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {selectedVideo.duration}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                {selectedVideo.description}
              </p>

              {/* Key Takeaways & Curriculum Points */}
              {selectedVideo.keyLearnings && selectedVideo.keyLearnings.length > 0 && (
                <div className="mt-4 p-4 rounded-2xl bg-card/60 border border-border/40 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Key Learning Takeaways
                  </h4>
                  <ul className="space-y-1 text-xs text-foreground/90">
                    {selectedVideo.keyLearnings.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* AI Learning Companion & Interactive Tutor Box */}
          <div className="space-y-4">
            <div className="glass rounded-3xl p-6 border border-border/60 flex flex-col h-full space-y-4">
              <div className="flex items-center gap-3">
                <Nova size={44} float={false} glow={false} />
                <div>
                  <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5">
                    Nova Video Tutor
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Ask questions about this specific lecture
                  </p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 min-h-[220px] max-h-[360px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-muted/20 border border-border/40 text-xs">
                {novaAnswers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground space-y-2">
                    <Sparkles className="h-6 w-6 mx-auto text-primary/60" />
                    <p>Have a doubt while watching?</p>
                    <p className="text-[11px] opacity-75">Ask Nova to clarify formulas, concepts, or steps!</p>
                  </div>
                ) : (
                  novaAnswers.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="bg-primary/10 text-primary p-2.5 rounded-xl font-medium ml-4">
                        🧑‍🎓 {item.q}
                      </div>
                      <div className="bg-card text-foreground p-2.5 rounded-xl font-normal border border-border/40 mr-4 shadow-sm">
                        🤖 {item.a}
                      </div>
                    </div>
                  ))
                )}
                {isAskingNova && (
                  <div className="text-center py-2 text-xs text-muted-foreground animate-pulse">
                    Nova is thinking...
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask Nova a question about this video..."
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskNova()}
                  className="flex-1 rounded-xl border border-border bg-card/80 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleAskNova}
                  disabled={!userQuestion.trim() || isAskingNova}
                  className="p-2 rounded-xl gradient-hero text-primary-foreground font-bold hover:scale-105 transition disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Safety Guarantee */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>
                  <strong>Safe Learning Zone:</strong> Videos on LEARNOVA are verified to have zero cringe, brainrot, or harmful content.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass rounded-2xl p-4 md:p-6 space-y-4 ring-gradient">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search lectures, abacus, calculus, coding..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card/80 pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0",
                  activeCategory === cat
                    ? "gradient-hero text-primary-foreground shadow-glow"
                    : "glass hover:bg-muted text-muted-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Feed Catalog */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVideos.map((video) => {
          const isSelected = selectedVideo?.id === video.id;
          return (
            <div
              key={video.id}
              onClick={() => {
                setSelectedVideo(video);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={cn(
                "group glass rounded-3xl p-4 cursor-pointer hover:scale-[1.02] hover:shadow-glow transition-all flex flex-col justify-between border space-y-3 relative overflow-hidden",
                isSelected ? "border-primary ring-2 ring-primary/40 shadow-glow" : "border-border/60"
              )}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/40">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white font-bold">
                  {video.duration}
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </div>
              </div>

              {/* Title & Info */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="text-primary font-semibold">{video.category}</span>
                  <span>{video.level}</span>
                </div>
                <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-medium truncate max-w-[120px]">{video.creatorName}</span>
                <span>{video.publishedAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl p-8 space-y-3">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold">No educational videos found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or publish a new educational lecture!
          </p>
        </div>
      )}

      {/* Teacher / Creator Publish Modal with Strict Guardrail */}
      {isCreatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl grid place-items-center p-4 overflow-y-auto">
          <div className="glass rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative border border-border shadow-2xl my-8">
            <button
              onClick={() => setIsCreatorModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full glass hover:bg-muted transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="space-y-2 pr-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                Teacher & Educator Verification Studio
              </div>
              <h2 className="text-2xl md:text-3xl font-black gradient-text">
                Publish Educational Video
              </h2>
              <p className="text-xs text-muted-foreground">
                All submissions undergo an automated AI & pedagogical guardrail check. Cringe videos, memes, NSFW, gaming pranks, or low-quality vlogs will be automatically rejected.
              </p>
            </div>

            {/* Quick Presets for Evaluators / Judges */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>⚡ Quick Test Demos for Testing Guardrails:</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleTestPreset("valid")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 transition flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Valid Calculus Lesson
                </button>
                <button
                  type="button"
                  onClick={() => handleTestPreset("cringe")}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 transition flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" /> Cringe Brainrot Video (To Reject)
                </button>
                <button
                  type="button"
                  onClick={() => handleTestPreset("nsfw")}
                  className="px-3 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold border border-destructive/30 transition flex items-center gap-1"
                >
                  <ShieldAlert className="h-3 w-3" /> NSFW/Harmful Video (To Reject)
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Video Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Understanding Cellular Respiration & ATP Production"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/80 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Teacher / Creator Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Fatima Rahman"
                    value={newCreatorName}
                    onChange={(e) => setNewCreatorName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card/80 px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Role / Credential</label>
                  <input
                    type="text"
                    placeholder="e.g., Biology Educator, MSc"
                    value={newCreatorRole}
                    onChange={(e) => setNewCreatorRole(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card/80 px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Subject Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Math & Abacus">Math & Abacus</option>
                    <option value="Science & Physics">Science & Physics</option>
                    <option value="Programming">Programming</option>
                    <option value="Languages & Phonics">Languages & Phonics</option>
                    <option value="Study Skills">Study Skills</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Target Student Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Video URL (YouTube or Direct Embed)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/80 px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Educational Description & Objectives *</label>
                <textarea
                  rows={3}
                  placeholder="Explain what the learner will gain from watching this video, specific curriculum standards, or lesson outline..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/80 p-3 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Key Learnings / Outline (1 per line)</label>
                <textarea
                  rows={2}
                  placeholder="1. Introduction to topic&#10;2. Step-by-step formula derivation&#10;3. Practice problem solving"
                  value={newKeyLearnings}
                  onChange={(e) => setNewKeyLearnings(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/80 p-3 text-xs outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                />
              </div>
            </div>

            {/* Guardrail Status Display */}
            {guardrailResult && (
              <div
                className={cn(
                  "p-4 rounded-2xl border text-xs space-y-2 transition",
                  guardrailResult.isApproved
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                    : "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-400"
                )}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <div className="flex items-center gap-1.5">
                    {guardrailResult.isApproved ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="h-5 w-5 text-destructive" />
                    )}
                    <span>{guardrailResult.isApproved ? "Approved by Guardrail" : "Rejected by Guardrail"}</span>
                  </div>
                  <span className="font-mono">Quality Score: {guardrailResult.score}/100</span>
                </div>

                <p className="leading-relaxed">{guardrailResult.reason}</p>
                <p className="text-[11px] opacity-90 italic">
                  Feedback: {guardrailResult.pedagogyFeedback}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/40">
              <button
                type="button"
                onClick={handleRunGuardrailCheck}
                disabled={isVerifying || !newTitle.trim() || !newDescription.trim()}
                className="px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/10 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                {isVerifying ? "Inspecting Video Content..." : "1. Run Guardrail Inspection"}
              </button>

              <button
                type="button"
                onClick={handlePublishVideo}
                disabled={!guardrailResult || !guardrailResult.isApproved}
                className="gradient-hero text-primary-foreground font-black px-6 py-2.5 rounded-xl shadow-glow hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100 text-xs flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                2. Publish Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
