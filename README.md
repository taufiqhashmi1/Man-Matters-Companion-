# Man Matters Companion
### Mosaic Wellness Fellowship Challenge 2027 Prototype

> **Independent Concept Prototype** — Not an official Man Matters service, medical tool, or brand integration.

Man Matters Companion is a browser-based, AI-assisted post-purchase wellness companion concept. It helps customers organize products, follow daily routines, record personal observations, and ask questions grounded strictly in verified product information and their own saved activity.

---

## 🌟 Core Reviewer Journey (Zero Signup)

1. **First-Time Entry**: Open `/` and click **"Explore Preloaded Demo (Alex)"** to reach the dashboard instantly with zero registration or onboarding hurdles.
2. **Dashboard**: View today's morning and evening routine, active products, and 7-day consistency metric derived from authentic underlying logs.
3. **Daily Routine Check-Off**: Click any activity to check it off; notice immediate calculation update that persists across browser refreshes.
4. **Product Cabinet**: View verified packaging instructions, official source labels, pause/resume products, or add new items.
5. **Progress Journal**: Review subjective notes, upload optional progress photos stored securely in IndexedDB, and compare two observations side-by-side.
6. **Context-Aware AI Companion**: Ask questions grounded in your saved products and verified instructions. If the Gemini API key is absent or offline, it gracefully falls back to curated verified facts.
7. **Weekly Insights**: View honest, deterministic 7-day adherence statistics with full transparency on how metrics are computed.

---

## 🏗 Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict types)
- **Styling**: Tailwind CSS with custom editorial wellness design tokens
- **State Management**: Zustand
- **Persistence**: 
  - Structured domain data: Versioned `LocalStorage` (`mm-companion:v1:state`)
  - Image attachments: Browser `IndexedDB` (`mm_companion_photos_db`)
- **AI Integration**:
  - Official `@google/generative-ai` & `@google/genai` SDK
  - Server-only API route (`/api/companion`)
  - Non-medical safety prompt constraints
  - Deterministic knowledge retrieval & local fallback
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
*Note: The app remains 100% functional without an API key by leveraging the curated verified local knowledge base.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛡 Privacy & Non-Medical Guardrails

- **Zero-PII Storage**: All personal routine logs and photos are strictly stored within the reviewer's browser profile.
- **Photo Isolation**: Photos are saved in IndexedDB and never transmitted to AI models.
- **Safety Prompting**: AI companion refuses to diagnose, prescribe, guarantee efficacy, or invent dosage.
- **Explicit Sources**: All product instructions link to verified sources or clearly display *"No verified instructions added"*.

---

## 📜 License
Mosaic Wellness Fellowship Challenge Prototype.
