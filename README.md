# Cerberus — Frontend Application

Frontend web application for **Cerberus** — an intelligent token-optimization decision layer and multi-tier LLM routing platform. Built with a restrained editorial dark void design system, interactive 3D pipeline visualization, and real-time observability.

---

## 🖥️ Core Frontend Surfaces

The application consists of three primary surfaces:

### 1. Editorial Landing Page (`/`)
* **Interactive 3D Pipeline Hero**: Real-time [Spline](https://spline.design/) 3D scene representing the 4 core pipeline stages (*Query Ingestion*, *Semantic Cache*, *Context Classifier*, and *Model Router*).
* **Editorial Dark Void Palette**: Strict aesthetic (`#0A0A0A` void, `#F5F4EF` fog, `#D4A854` gold accent) designed for technical clarity without gratuitous decorative noise.
* **Architecture & Interactive Breakdown**:
  * Step-by-step visual pipeline (`Semantic Cache` → `Model Router` → `Context Classifier`).
  * Side-by-side Cache Hit vs. Router Miss comparison cards with `<CacheTag />` status indicators.
  * Hub-and-spoke service isolation explanation.

### 2. Dedicated Chat Surface (`/chat`)
* **Two-Pane Layout**: Slim NavRail (`w-48`) with navigation, conversation history drawer, and link to the telemetry dashboard.
* **Content-First Thread**: Zero assistant message bubbles — assistant responses render as plain high-contrast typography (`max-w-[75%]`) with cache-tier badges.
* **Authentic Pipeline Feedback**: Real-time simulated streaming and `<CacheTag />` status badges (`RAM Exact Hit`, `DB Semantic Hit`, `LLM Generation Miss`).
* **Pre-seeded Prompts**: Clickable suggested prompts demonstrating sub-millisecond RAM retrieval, vector cache hits, and model router dispatch.

### 3. Telemetry & Observability Dashboard (`/dashboard`)
* **Efficiency Bento Grid**: Real-time metrics tracking Cache Hit Rate (68.4%), Cumulative Tokens Saved (140k+), Cost Reduction (73.8%), and Mean Turn Latency (184ms).
* **Model Cascade Distribution**: Visual distribution breakdown across Small (Groq), Medium (Flash), and Large (Frontier) model tiers.
* **Request Audit Stream**: Filterable log table (`All`, `RAM`, `DB`, `LLM`) with an expandable JSON payload trace inspector.

---

## 🛠️ Tech Stack

* **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Dev Server**: [Vite 7](https://vite.dev/)
* **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
* **3D Runtime**: [@splinetool/react-spline](https://spline.design/)
* **Icons**: [lucide-react](https://lucide.dev/)
* **Routing**: [React Router 7](https://reactrouter.com/)

---

## 🎨 Design Tokens

| Token | Class | Hex Value | Purpose |
|---|---|---|---|
| **Void** | `bg-void` | `#0A0A0A` | Main page background |
| **Surface** | `bg-surface` | `#111111` | Card containers, user message bubbles |
| **Fog** | `text-fog` | `#F5F4EF` | Primary high-contrast text |
| **Mist** | `text-mist` | `#8A8A85` | Secondary metadata, labels, placeholders |
| **Line** | `border-line` | `rgba(245, 244, 239, 0.12)` | Hairline structural borders |
| **Gold** | `text-gold` / `bg-gold` | `#D4A854` | Primary brand accent & active state CTA |

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── chat/           # NavRail, Composer, ChatThread, Message, ChatHeader, EmptyState
│   ├── landing/        # HeroScene (Spline), LandingNav, HowItWorks, Architecture, Example
│   └── ui/             # CacheTag, status badges, UI primitives
├── context/
│   └── ThemeContext.tsx # Global theme provider (Void dark default)
├── pages/
│   ├── LandingPage.tsx   # Single-scroll editorial landing page (/)
│   ├── ChatPage.tsx      # Dedicated chat surface (/chat)
│   └── DashboardPage.tsx # Observability & telemetry dashboard (/dashboard)
├── services/
│   └── pipelineEngine.ts # Client-side inference simulation & cache-seed logic
├── types/
│   └── telemetry.ts      # TypeScript interfaces & pipeline contracts
├── App.tsx               # Root route declarations
├── main.tsx              # Application entrypoint
└── index.css             # Tailwind base styles & typography imports
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `18.x` or higher
* **npm**: `9.x` or higher

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start local dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. Typecheck and build for production:
   ```bash
   npm run build
   ```
