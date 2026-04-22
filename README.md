# RituAI — Frontend (React Native / Expo)

A production-grade frontend for **RituAI** — a smart hormonal auditor, AI skin scanner, and personalized health assistant built for women with irregular cycles and PCOS.

## ✨ What's inside

- **Digital Ritual** design system (phase-colored palette, luxury glassmorphism, Fraunces-feel typography)
- **Storytelling parallax welcome** — 5 scene-based scrolling intro with hand-drawn SVG illustrations
- **5-chapter onboarding** — paced like a journal, not a form
- **Spotlight tutorial walkthrough** — Saheli guides you through every feature on first launch
- **Home / Today** — animated phase ring, daily quick-log, Saheli's daily narrative, phase-synced recommendations
- **Cycle calendar** — phase-colored grid with honest uncertainty bands and false-surge crescent markers
- **Scan flow** — preparation → simulated camera → processing sweep → results with facial zone mapping
- **Insights** — skin–cycle heatmap, PCOS risk dial, doctor-report generator
- **Saheli AI chat** — conversational sanctuary with typing indicator and suggested prompts
- **Admin panel** — dashboards, user management, content CMS, AI ops, compliance/audit
- **Disguise mode, tutorial replay, data control** — privacy-first design

## 🏗️ Tech Stack

- **Expo SDK 51** with **Expo Router** (file-based routing)
- **TypeScript**
- **React Native Reanimated 3** — spring physics, parallax, scroll-driven animations
- **React Native Gesture Handler** — tap, press-in/out, long-press
- **React Native SVG** — every illustration is hand-built SVG (no image bundle weight)
- **Expo Linear Gradient + Blur** — glassmorphism surfaces
- **Expo Haptics** — tactile feedback everywhere
- **Zustand** — global state with mock data so the app runs offline-first

## 🏃 Run it

```bash
npm install
npx expo start
```

Then press `i` (iOS simulator), `a` (Android), or `w` (web). If you don't have simulators installed, use **Expo Go** on your phone — scan the QR.

## 🔌 Connect to the FastAPI backend

By default the app uses mock data from the Zustand store. To connect to your FastAPI backend (from the existing `RituAI-main` repo):

```bash
EXPO_PUBLIC_API_BASE=http://192.168.1.x:8000 npx expo start
```

Already wired:
- `POST /users` — called at signup
- `POST /analyze` — powers the LH+BBT verdict and false-surge calendar markers

The `lib/api.ts` file is the single place to extend for future endpoints (`/scans/skin`, `/chat/message`, `/reports/generate`, etc.).

## 🗂️ Project structure

```
app/
├── _layout.tsx              # Root stack + GestureHandlerRootView
├── index.tsx                # Splash + routing gate
├── (auth)/
│   ├── welcome.tsx          # 5-scene parallax intro
│   ├── login.tsx
│   └── signup.tsx
├── (onboarding)/
│   ├── chapter1.tsx         # Meet Saheli
│   ├── chapter2.tsx         # Your body's rhythm
│   ├── chapter3.tsx         # Your daily life
│   ├── chapter4.tsx         # Your signals
│   └── chapter5.tsx         # First ritual + consent
├── (tabs)/
│   ├── _layout.tsx          # Custom floating tab bar
│   ├── today.tsx            # Home / phase ring / daily log
│   ├── cycle.tsx            # Calendar
│   ├── insights.tsx         # Heatmap + risk + report
│   ├── saheli.tsx           # AI chat sanctuary
│   └── profile.tsx          # Settings + privacy
├── scan/
│   └── index.tsx            # Full-screen camera flow
└── admin/
    └── index.tsx            # Admin dashboard (5 tabs)

components/
├── CustomTabBar.tsx
├── PhaseRing.tsx
├── TutorialOverlay.tsx
├── ui/
│   ├── GlassCard.tsx
│   ├── PhaseBackground.tsx
│   ├── PrimaryButton.tsx
│   └── OnboardingHeader.tsx
└── illustrations/
    ├── LotusMandala.tsx
    ├── FloatingPetals.tsx
    └── Scenes.tsx           # 9 hand-drawn SVG illustrations

store/useStore.ts            # Zustand global state + mock data
lib/api.ts                   # FastAPI client (graceful mock fallback)
theme/index.ts               # Design system
```

## 🎭 Demo the admin panel

In the running app, go to **Profile → Demo mode → Toggle admin role**. The Profile screen will now show an "Admin panel" card at the top.

## 🔐 Privacy-first features

- **Local-first data** (mock store keeps everything on device)
- **Disguise mode toggle** in profile
- **Tutorial replay** from profile
- **Data deletion** placeholder wired

## 🧪 Known notes

- The scan flow uses a **simulated camera** (not `expo-camera`) to keep dependencies minimal and the install bulletproof. Swap in `expo-camera` when ready — the results screen takes a fake payload that Claude Vision's real JSON will drop into directly.
- Fonts are system fonts styled with heavy italic + weight contrast to get the Fraunces feel without font loading issues. To bring in real Fraunces/Inter, add `expo-font` and load them in `app/_layout.tsx`.

Made with 🪷 by Team Elle.
