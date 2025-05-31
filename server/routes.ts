import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWatchHistorySchema, insertWatchlistSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all videos
  app.get("/api/videos", async (_req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideoById(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Get videos by category
  app.get("/api/videos/category/:category", async (req, res) => {
    try {
      const videos = await storage.getVideosByCategory(req.params.category);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos by category" });
    }
  });

  // Get videos by genre
  app.get("/api/videos/genre/:genre", async (req, res) => {
    try {
      const videos = await storage.getVideosByGenre(req.params.genre);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos by genre" });
    }
  });

  // Get trending videos
  app.get("/api/videos/trending", async (_req, res) => {
    try {
      const videos = await storage.getTrendingVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending videos" });
    }
  });

  // Get featured video
  app.get("/api/videos/featured", async (_req, res) => {
    try {
      const video = await storage.getFeaturedVideo();
      if (!video) {
        return res.status(404).json({ message: "No featured video found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured video" });
    }
  });

  // Search videos
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      const videos = await storage.searchVideos(query);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to search videos" });
    }
  });

  // Get user (demo user)
  app.get("/api/user", async (_req, res) => {
    try {
      const user = await storage.getUser(1); // Demo user
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user preferences
  app.put("/api/user/preferences", async (req, res) => {
    try {
      const preferences = req.body;
      const user = await storage.updateUserPreferences(1, preferences);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Get watch history
  app.get("/api/user/history", async (_req, res) => {
    try {
      const history = await storage.getWatchHistory(1);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watch history" });
    }
  });

  // Add to watch history
  app.post("/api/user/history", async (req, res) => {
    try {
      const parsed = insertWatchHistorySchema.parse({ ...req.body, userId: 1 });
      const entry = await storage.addToWatchHistory(parsed);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Update watch progress
  app.put("/api/user/history/:videoId", async (req, res) => {
    try {
      const videoId = parseInt(req.params.videoId);
      const { progress } = req.body;
      const entry = await storage.updateWatchProgress(1, videoId, progress);
      if (!entry) {
        return res.status(404).json({ message: "Watch history entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update watch progress" });
    }
  });

  // Get watchlist
  app.get("/api/user/watchlist", async (_req, res) => {
    try {
      const watchlist = await storage.getWatchlist(1);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  // Add to watchlist
  app.post("/api/user/watchlist", async (req, res) => {
    try {
      const parsed = insertWatchlistSchema.parse({ ...req.body, userId: 1 });
      const entry = await storage.addToWatchlist(parsed);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Remove from watchlist
  app.delete("/api/user/watchlist/:videoId", async (req, res) => {
    try {
      const videoId = parseInt(req.params.videoId);
      const removed = await storage.removeFromWatchlist(1, videoId);
      if (!removed) {
        return res.status(404).json({ message: "Video not in watchlist" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Check if video is in watchlist
  app.get("/api/user/watchlist/:videoId", async (req, res) => {
    try {
      const videoId = parseInt(req.params.videoId);
      const isInWatchlist = await storage.isInWatchlist(1, videoId);
      res.json({ isInWatchlist });
    } catch (error) {
      res.status(500).json({ message: "Failed to check watchlist status" });
    }
  });

  // AI Recommendations
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { watchHistory, preferences } = req.body;
      
      // Get all videos to recommend from
      const allVideos = await storage.getAllVideos();
      
      // Create prompt for AI recommendations
      const prompt = `Based on the user's viewing history and preferences, recommend movies and TV shows.
      
      User's watch history (video titles): ${watchHistory.map((h: any) => h.title).join(', ')}
      User's preferred genres: ${preferences?.genres?.join(', ') || 'No specific preferences'}
      User's preferred categories: ${preferences?.categories?.join(', ') || 'No specific preferences'}
      
      Available videos to recommend from:
      ${allVideos.map(v => `${v.title} (${v.year}) - ${v.genre?.join(', ')}`).join('\n')}
      
      Please return a JSON object with recommendations array containing video IDs in order of recommendation strength.
      Response format: { "recommendations": [1, 4, 2] }`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI recommendation system for a streaming platform. Analyze user preferences and viewing history to suggest relevant content. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      const recommendedVideoIds = result.recommendations || [];
      
      // Get the actual video objects for recommended IDs
      const recommendedVideos = [];
      for (const id of recommendedVideoIds) {
        const video = await storage.getVideoById(id);
        if (video) {
          recommendedVideos.push(video);
        }
      }
      
      res.json(recommendedVideos);
    } catch (error) {
      console.error('AI Recommendation error:', error);
      // Fallback to simple recommendation based on trending
      const trendingVideos = await storage.getTrendingVideos();
      res.json(trendingVideos.slice(0, 6));
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
