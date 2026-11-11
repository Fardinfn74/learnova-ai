export interface SampleVideo {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade_band: string;
  language: string;
  duration_seconds: number;
  view_count: number;
  thumbnail_url: string;
  video_url: string;
  creator: {
    display_name: string;
    bio: string;
  };
  concepts: string[];
}

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    id: "sample-abacus-101",
    title: "Mastering Mental Math with the Soroban Abacus",
    description: "Learn how the Japanese Soroban Abacus represents base-10 numbers, complementary pairs to 5 and 10, and rapid mental arithmetic without calculators.",
    subject: "mathematics",
    grade_band: "primary",
    language: "english",
    duration_seconds: 540,
    view_count: 1420,
    thumbnail_url: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // embed safe fallback
    creator: {
      display_name: "Prof. Anisur Rahman",
      bio: "Senior Mathematics Educator & Olympiad Trainer with 15+ years experience.",
    },
    concepts: [
      "Heaven and Earth beads orientation",
      "Complementary additions (5 and 10 pairs)",
      "Anzan (Mental Bead Visualization)",
    ],
  },
  {
    id: "sample-python-loops",
    title: "Python for Beginners: Demystifying For Loops & Iteration",
    description: "A clean, visual breakdown of sequences, range(), accumulator patterns, and time complexity pitfalls in Python 3.",
    subject: "ict_programming",
    grade_band: "secondary",
    language: "mixed",
    duration_seconds: 720,
    view_count: 2890,
    thumbnail_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    video_url: "https://www.youtube.com/embed/kqtD5dpn9C8",
    creator: {
      display_name: "Ahnaf Tahmid Nafi",
      bio: "Software Architect & Computer Science Mentor.",
    },
    concepts: [
      "Iterable vs Iterator protocols",
      "Memory efficiency with range() generators",
      "Avoiding infinite loops and edge-case indexing",
    ],
  },
  {
    id: "sample-bangla-phonics",
    title: "বাংলা বর্ণমালা ও ধ্বনিতত্ত্ব: নির্ভুল উচ্চারণ ও প্রয়োগ",
    description: "বাংলা স্বরবর্ণ ও ব্যঞ্জনবর্ণের সঠিক উচ্চারণ স্থান (কণ্ঠ্য, তালব্য, মূর্ধন্য, দন্ত্য ও ওষ্ঠ্য) এবং ব্যাকরণগত তাৎপর্য।",
    subject: "bangla",
    grade_band: "early_learning",
    language: "bangla",
    duration_seconds: 480,
    view_count: 3100,
    thumbnail_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    creator: {
      display_name: "Nusrat Jahan",
      bio: "Bangla Linguistics Specialist & Primary Pedagogy Expert.",
    },
    concepts: [
      "উচ্চারণ স্থান (Place of Articulation)",
      "যুক্তবর্ণের গঠন ও বিশিষ্ট প্রয়োগ",
      "ধ্বনি পরিবর্তন ও ধ্বনিসাম্য",
    ],
  },
  {
    id: "sample-physics-vacuum",
    title: "Gravity in a Vacuum: Why a Feather and Bowling Ball Fall Together",
    description: "Deriving Galileo's equivalence principle, inspecting Newtonian gravity vs air resistance, and reviewing Apollo 15 lunar hammer-feather drop.",
    subject: "physics",
    grade_band: "higher_secondary",
    language: "english",
    duration_seconds: 610,
    view_count: 5120,
    thumbnail_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    video_url: "https://www.youtube.com/embed/E43-CfukEgs",
    creator: {
      display_name: "Dr. Farhan Masud",
      bio: "Theoretical Physics Lecturer & Science Communicator.",
    },
    concepts: [
      "Free fall dynamics without aerodynamic drag",
      "Inertial mass vs gravitational mass",
      "Terminal velocity and fluid drag force (Stokes' Law)",
    ],
  },
];
