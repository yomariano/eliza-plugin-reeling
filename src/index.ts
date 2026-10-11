import type { Action, IAgentRuntime, Memory, State, HandlerCallback, Plugin, Provider } from "@elizaos/core";
import axios from "axios";

function getClient(runtime: IAgentRuntime) {
  const apiKey = runtime.getSetting("REELING_API_KEY") || process.env.REELING_API_KEY;
  if (!apiKey) {
    throw new Error("REELING_API_KEY is required in agent settings or environment variables.");
  }
  const apiUrl = (runtime.getSetting("REELING_API_URL") || process.env.REELING_API_URL || "https://api.reeling.app").replace(/\/+$/, "");

  return axios.create({
    baseURL: apiUrl,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "Authorization": `Bearer ${apiKey}`,
    },
    timeout: 90000,
  });
}

/**
 * Provider: Supplies currently connected channels to Eliza's context
 */
export const reelingChannelsProvider: Provider = {
  get: async (runtime: IAgentRuntime, _message: Memory, _state?: State) => {
    try {
      const client = getClient(runtime);
      const res = await client.get("/api/v1/channels");
      const channels = res.data?.channels || [];
      if (!channels.length) return "Reeling: No social channels connected.";

      const channelList = channels
        .map((c: any) => `- ${c.platform.toUpperCase()}: ${c.name || c.username || c.id}`)
        .join("\n");
      return `Reeling Connected Social Channels:\n${channelList}`;
    } catch {
      return "Reeling: Channel status currently unavailable.";
    }
  },
};

/**
 * Action: Generate and stitch an AI short video clip or storyboard
 */
export const generateVideoAction: Action = {
  name: "GENERATE_REEL_VIDEO",
  similes: ["CREATE_SHORT_VIDEO", "MAKE_AI_REEL", "PRODUCE_VIDEO_STORYBOARD"],
  description: "Generates an AI video or storyboard using MiniMax H3 via Reeling and saves it to Cloudflare R2 storage.",
  validate: async (runtime: IAgentRuntime, _message: Memory) => {
    return Boolean(runtime.getSetting("REELING_API_KEY") || process.env.REELING_API_KEY);
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    try {
      const client = getClient(runtime);
      const promptText = message.content.text || "Cinematic short video";

      const res = await client.post("/api/v1/ai/generate-video", {
        prompt: promptText,
        aspectRatio: "9:16",
      });

      const videoUrl = res.data?.videoUrl;
      if (callback) {
        callback({
          text: `🎬 Video generated successfully!\nDirect link: ${videoUrl}`,
          content: { videoUrl, success: true },
        });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({
          text: `Failed to generate video: ${error.response?.data?.error || error.message}`,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Make a quick 9:16 video of a neon cybernetic city for our TikTok" },
      },
      {
        user: "{{agentName}}",
        content: { text: "Generating the video clip now with Reeling...", action: "GENERATE_REEL_VIDEO" },
      },
    ],
  ],
};

/**
 * Action: Publish or schedule video across multi-channel social networks
 */
export const publishPostAction: Action = {
  name: "PUBLISH_SOCIAL_POST",
  similes: ["POST_TO_TIKTOK", "PUBLISH_REEL", "SCHEDULE_VIDEO", "POST_TO_SHORTS"],
  description: "Publishes or schedules a video simultaneously across TikTok, YouTube Shorts, Instagram Reels, Bluesky, Threads, and X.",
  validate: async (runtime: IAgentRuntime, _message: Memory) => {
    return Boolean(runtime.getSetting("REELING_API_KEY") || process.env.REELING_API_KEY);
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    try {
      const client = getClient(runtime);
      const content = message.content;

      const payload = {
        title: content.title || "Autonomous Agent Update",
        caption: content.text || content.caption || "",
        video_url: content.videoUrl,
        platforms: content.platforms || ["youtube", "tiktok", "instagram"],
        scheduled_for: content.scheduledFor || null,
      };

      const res = await client.post("/api/v1/publish", payload);

      if (callback) {
        callback({
          text: `🚀 Post submitted! Post ID: ${res.data?.post_id} (Status: ${res.data?.status})`,
          content: res.data,
        });
      }
      return true;
    } catch (error: any) {
      if (callback) {
        callback({
          text: `Failed to publish post: ${error.response?.data?.error || error.message}`,
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Publish our latest announcement reel to TikTok and YouTube Shorts",
          videoUrl: "https://r2.reeling.app/clips/video.mp4",
        },
      },
      {
        user: "{{agentName}}",
        content: { text: "Publishing the video to TikTok and Shorts via Reeling...", action: "PUBLISH_SOCIAL_POST" },
      },
    ],
  ],
};

/**
 * Official Reeling Plugin definition for ElizaOS
 */
export const reelingPlugin: Plugin = {
  name: "reeling",
  description: "Official multi-platform vertical video publishing, AI generation, and analytics integration for ElizaOS agents.",
  actions: [generateVideoAction, publishPostAction],
  providers: [reelingChannelsProvider],
  evaluators: [],
};

export default reelingPlugin;
