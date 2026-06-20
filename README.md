# VeloFeed — Intelligent Real-Time Media & Asset Tracking Platform

VeloFeed is a cutting-edge, cross-platform mobile application engineered using **React Native**, **Expo (Router v3)**, and TypeScript. It transforms high-velocity data layers from live global wire desks into a personalized, highly interactive, and visually stunning user experience. 

Featuring an ambient dynamic UI, an automated conversational Text-to-Speech (TTS) radar audio briefing queue, custom frosted-glass asset correlation filter matrices, and an optimized single-request network architecture, VeloFeed bridges the gap between raw global telemetry feeds and mobile consumers.

---

## ⚡ Core Engine Architecture & Features

### 1. Optimized Free-Tier Sync Engine
* **Single-Request Parallel Batching:** To protect API quotas and avoid `429 Too Many Requests` or `401 Unauthorized` rate limits, the data aggregation layer condenses multiple separate category hooks (`politics`, `sports`, `technology`, `entertainment`, `business`, `health`) into a single comma-separated multi-query URI payload string.
* **Universal Free-Tier Fail-Safe:** Switched to the public `/news` pipeline distribution layout from `NewsData.io` ensuring stable endpoints without requiring paid enterprise tiers.
* **Self-Healing State Fallbacks:** Engineered with complete network exception validation catches. If connection drops or tokens fail, the UI elegantly avoids layout breaking, routing data down to safe states.

### 2. Conversational Voice Assistant (Audio Radar Briefing)
* **Fixed Position Floating Action Button (FAB):** Seamlessly pinned to the bottom-right viewport grid axis, acting as a global master stream trigger toggle.
* **Continuous Non-Blocking Sequential Queue:** Utilizes recursive `expo-speech` native driver loop callbacks (`onDone`) to cycle through the top spotlight articles smoothly.
* **Zero Robotic Metadata Parsing:** Custom regex processing drops cold metadata markers like "update number" or "category tag." It strictly broadcasts clean, natural speech flows ("Reading today's top headlines...", "Next headline...", "Briefing sequence complete.").

### 3. High-Fidelity Ambient UI/UX
* **Dynamic Aura Vectors:** Animated, infinitely looping background gradient blobs tracking across parallel translation planes to ensure visual texture without blocking native thread performance.
* **Frosted Glass (Glassmorphism) Micro-Interactions:** Custom styled information panels balancing dynamic opacity settings depending on active system parameters (Dark/Light mode native shifts).
* **Pull-to-Refresh & Infinite Continuous Scroll:** Fully native `RefreshControl` bridges data reload requests directly to live servers on user pull-down, resetting view index frames instantly.

---

## 📂 Project Directory Structure

```text
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab bar layout mapping & ambient style context
│   │   ├── index.tsx            # Home screen feed (Spotlight slider, native lists, Audio FAB)
│   │   └── explore.tsx          # Asset Correlation filter matrix & Flash live market rows
│   ├── _layout.tsx              # Main entry point (Global states, dark mode, providers)
│   ├── _newsApi.ts              # Clean single-request API driver implementation
│   └── _types.ts                # TypeScript strict interface contracts (Article, Category)
├── assets/
│   └── images/
│       ├── icon.png             # Compiled global application icon asset (108x108 px)
│       ├── splash-icon.png      # Engine launch branding asset
│       └── favicon.png          # Static web canvas index reference marker
├── app.json                     # Native Expo configuration (Adaptive icons, permissions, plugins)
├── eas.json                     # EAS Cloud build instruction configurations (APK profiles)
└── package.json                 # Dependency array management mappings
