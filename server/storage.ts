import { users, videos, watchHistory, watchlist, type User, type InsertUser, type Video, type InsertVideo, type WatchHistory, type InsertWatchHistory, type Watchlist, type InsertWatchlist } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: any): Promise<User | undefined>;

  // Video operations
  getAllVideos(): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  getVideosByCategory(category: string): Promise<Video[]>;
  getVideosByGenre(genre: string): Promise<Video[]>;
  getTrendingVideos(): Promise<Video[]>;
  getFeaturedVideo(): Promise<Video | undefined>;
  searchVideos(query: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;

  // Watch history operations
  getWatchHistory(userId: number): Promise<WatchHistory[]>;
  addToWatchHistory(entry: InsertWatchHistory): Promise<WatchHistory>;
  updateWatchProgress(userId: number, videoId: number, progress: number): Promise<WatchHistory | undefined>;

  // Watchlist operations
  getWatchlist(userId: number): Promise<Watchlist[]>;
  addToWatchlist(entry: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, videoId: number): Promise<boolean>;
  isInWatchlist(userId: number, videoId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<number, Video>;
  private watchHistoryEntries: Map<number, WatchHistory>;
  private watchlistEntries: Map<number, Watchlist>;
  private currentUserId: number;
  private currentVideoId: number;
  private currentWatchHistoryId: number;
  private currentWatchlistId: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.watchHistoryEntries = new Map();
    this.watchlistEntries = new Map();
    this.currentUserId = 1;
    this.currentVideoId = 1;
    this.currentWatchHistoryId = 1;
    this.currentWatchlistId = 1;

    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Sample videos
    const sampleVideos: Video[] = [
      {
        id: 1,
        title: "Inception",
        description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        thumbnailUrl: "https://images.unsplash.com/photo-1478720568477-b692582de08c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        videoUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
        category: "movies",
        genre: ["sci-fi", "action", "thriller"],
        year: 2010,
        duration: "2h 28m",
        rating: "PG-13",
        imdbScore: "8.8",
        trending: true,
        featured: true
      },
      {
        id: 2,
        title: "Breaking Bad",
        description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
        thumbnailUrl: "https://images.unsplash.com/photo-1489599833308-aad1d8b0e7ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        videoUrl: "https://www.youtube.com/embed/HhesaQXLuRY",
        category: "series",
        genre: ["drama", "crime"],
        year: 2008,
        duration: "5 Seasons",
        rating: "TV-MA",
        imdbScore: "9.5",
        trending: true,
        featured: false
      },
      {
        id: 3,
        title: "Our Planet",
        description: "Documentary series focusing on the breadth of the diversity of habitats around the world.",
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        videoUrl: "https://www.youtube.com/embed/aETNYyrqNYE",
        category: "documentaries",
        genre: ["nature", "documentary"],
        year: 2019,
        duration: "8 Episodes",
        rating: "TV-G",
        imdbScore: "9.3",
        trending: false,
        featured: false
      },
      {
        id: 4,
        title: "Dune",
        description: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset.",
        thumbnailUrl: "https://images.unsplash.com/photo-1518298804355-6a9d6d8c51e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        videoUrl: "https://www.youtube.com/embed/n9xhJrPXop4",
        category: "movies",
        genre: ["sci-fi", "adventure"],
        year: 2021,
        duration: "2h 35m",
        rating: "PG-13",
        imdbScore: "8.1",
        trending: true,
        featured: false
      },
      {
        id: 5,
        title: "Stranger Things",
        description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.",
        thumbnailUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        videoUrl: "https://www.youtube.com/embed/b9EkMc79ZSU",
        category: "series",
        genre: ["sci-fi", "horror", "drama"],
        year: 2016,
        duration: "4 Seasons",
        rating: "TV-14",
        imdbScore: "8.7",
        trending: true,
        featured: false
      },
      {
        id: 6,
        title: "The Social Dilemma",
        description: "Explores the dangerous human impact of social networking, with tech experts sounding the alarm on their own creations.",
        thumbnailUrl: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
        videoUrl: "https://www.youtube.com/embed/uaaC57tcci0",
        category: "documentaries",
        genre: ["documentary", "tech"],
        year: 2020,
        duration: "1h 34m",
        rating: "PG-13",
        imdbScore: "7.6",
        trending: false,
        featured: false
      }
    ];

    sampleVideos.forEach(video => {
      this.videos.set(video.id, video);
      this.currentVideoId = Math.max(this.currentVideoId, video.id + 1);
    });

    // Sample user
    const sampleUser: User = {
      id: 1,
      username: "demo_user",
      email: "demo@streamvision.com",
      preferences: {
        genres: ["sci-fi", "action", "thriller"],
        categories: ["movies", "series"]
      },
      createdAt: new Date()
    };

    this.users.set(1, sampleUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      user.preferences = preferences;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => video.category === category);
  }

  async getVideosByGenre(genre: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => 
      video.genre?.includes(genre)
    );
  }

  async getTrendingVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(video => video.trending);
  }

  async getFeaturedVideo(): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(video => video.featured);
  }

  async searchVideos(query: string): Promise<Video[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.videos.values()).filter(video =>
      video.title.toLowerCase().includes(lowercaseQuery) ||
      video.description?.toLowerCase().includes(lowercaseQuery) ||
      video.genre?.some(g => g.toLowerCase().includes(lowercaseQuery))
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.currentVideoId++;
    const video: Video = { ...insertVideo, id };
    this.videos.set(id, video);
    return video;
  }

  async getWatchHistory(userId: number): Promise<WatchHistory[]> {
    return Array.from(this.watchHistoryEntries.values()).filter(entry => entry.userId === userId);
  }

  async addToWatchHistory(insertEntry: InsertWatchHistory): Promise<WatchHistory> {
    const id = this.currentWatchHistoryId++;
    const entry: WatchHistory = { ...insertEntry, id, watchedAt: new Date() };
    this.watchHistoryEntries.set(id, entry);
    return entry;
  }

  async updateWatchProgress(userId: number, videoId: number, progress: number): Promise<WatchHistory | undefined> {
    const entry = Array.from(this.watchHistoryEntries.values()).find(
      e => e.userId === userId && e.videoId === videoId
    );
    if (entry) {
      entry.progress = progress;
      this.watchHistoryEntries.set(entry.id, entry);
      return entry;
    }
    return undefined;
  }

  async getWatchlist(userId: number): Promise<Watchlist[]> {
    return Array.from(this.watchlistEntries.values()).filter(entry => entry.userId === userId);
  }

  async addToWatchlist(insertEntry: InsertWatchlist): Promise<Watchlist> {
    const id = this.currentWatchlistId++;
    const entry: Watchlist = { ...insertEntry, id, addedAt: new Date() };
    this.watchlistEntries.set(id, entry);
    return entry;
  }

  async removeFromWatchlist(userId: number, videoId: number): Promise<boolean> {
    const entry = Array.from(this.watchlistEntries.entries()).find(
      ([_, e]) => e.userId === userId && e.videoId === videoId
    );
    if (entry) {
      this.watchlistEntries.delete(entry[0]);
      return true;
    }
    return false;
  }

  async isInWatchlist(userId: number, videoId: number): Promise<boolean> {
    return Array.from(this.watchlistEntries.values()).some(
      entry => entry.userId === userId && entry.videoId === videoId
    );
  }
}

export const storage = new MemStorage();
