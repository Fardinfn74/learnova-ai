# LEARNOVA AI 🚀

LEARNOVA is an adaptive, multimodal AI tutor designed to make learning personalized, accessible, and engaging. Unlike traditional search engines or generic chatbots, Nova acts as a patient tutor—breaking down complex concepts step-by-step, generating tailored quizzes, and summarizing study materials.

Built natively for English, Bangla, and Banglish, LEARNOVA adapts to your proficiency level and learning style to ensure concepts truly click.

![Nova Mascot](src/assets/nova-mascot.png)

## ✨ Features

- **Conversational AI Tutor**: Chat with Nova to learn any topic. Nova uses Socratic questioning instead of just giving away answers.
- **Voice Interactions**: Speak naturally to Nova in English or Bangla, and she will reply back in the same language with a clear, engaging voice.
- **Adaptive Quizzes**: Automatically generate quizzes based on your current knowledge and skill level.
- **Smart Summarizer**: Upload study materials and let Nova summarize them into digestible notes.
- **Gamified Learning**: Earn XP, level up, maintain streaks, and unlock badges for your achievements.
- **Multilingual Support**: Fully supports English, Bangla (বাংলা), and Banglish natively.

## 🏗️ Technical Stack

- **Frontend**: React 19, TanStack Start, Tailwind CSS v4, Radix UI
- **Backend**: TanStack Start Server Functions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI Engine**: Google Gemini 2.5 Flash via AI SDK
- **Voice**: Web Speech API (Speech Recognition + Text-to-Speech)
- **Deployment**: Vercel ready (with Cloudflare Workers support)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase Project
- A Google Gemini API Key

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/learnova-ai.git
   cd learnova-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Copy the example environment file and fill in your keys:
   ```bash
   cp .env.example .env
   ```
   You will need:
   - `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (from Supabase dashboard)
   - `GEMINI_API_KEY` (Google AI Studio) — comma-separate multiple keys for rotation
   - `GROQ_API_KEY` (Groq console) — optional but recommended; comma-separate multiple keys
   - `AI_PREFER_GROQ=true` (default) routes chat/quiz/voice to Groq first, then Gemini on failure
   - Ensure the VITE_ prefixed keys match the Supabase keys for client-side access.

4. **Database Setup:**
   Run the Supabase SQL commands provided in your Supabase SQL editor to create the `profiles`, `quizzes`, `notes`, and `badges` tables, along with RLS policies.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:8080`.


## 🏆 Hackathon Submission

This project was built for the upcoming hackathon.

**What's inside?**
- A highly polished user interface with modern glassmorphism and aurora backgrounds.
- Deep integration of Gemini 2.5 Flash with custom system prompts that enforce safety and language mirroring.
- A gamified progression system powered by Supabase.

Good luck and happy learning!
