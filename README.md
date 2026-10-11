# @elizaos/plugin-reeling 🎬🤖

Official **ElizaOS** (ai16z) plugin for [reeling.app](https://reeling.app). 

Give your autonomous AI agents the ability to generate short-form vertical videos with MiniMax H3 AI models, create cinematic storyboards, and publish or schedule them directly across **TikTok, Instagram Reels, YouTube Shorts, Bluesky, Threads, and X**.

---

## ⚡ Features

* **Multi-Platform Publishing**: Autonomously schedule and publish short-form video content to connected accounts.
* **AI Video Generation**: Generate 9:16 vertical video clips from text prompts using MiniMax models via Reeling.
* **Context Provider**: Exposes your agent's live connected channels to Eliza's memory context.
* **Unified Analytics**: Check post performance, views, and engagement metrics directly.

---

## 📦 Installation

```bash
npm install github:yomariano/eliza-plugin-reeling
# or when published:
# npm install @elizaos/plugin-reeling
```

---

## 🔑 Configuration

Add the following environment variables to your Eliza agent's `.env` or character settings:

```env
REELING_API_KEY="rl_your_live_api_key_here"
REELING_API_URL="https://api.reeling.app"
```

---

## 🚀 Usage in Agent Character

Import and register the plugin in your Eliza agent character file (e.g., `character.json` or code):

```typescript
import { reelingPlugin } from "@elizaos/plugin-reeling";

export const character = {
  name: "VideoCreatorAgent",
  plugins: [reelingPlugin],
  // ... rest of character definition
};
```

---

## 🛠️ Actions Provided

| Action | Description |
|---|---|
| `GENERATE_REEL_VIDEO` | Generates a 9:16 vertical video clip via Reeling AI and saves to Cloudflare R2 storage. |
| `PUBLISH_SOCIAL_POST` | Publishes or schedules videos simultaneously across TikTok, YouTube Shorts, Instagram Reels, Bluesky, Threads, and X. |

---

## 📄 License
MIT © [reeling.app](https://reeling.app)
