export interface Video {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  genre?: string[];
  year: number;
  duration: string;
  rating?: string;
  imdbScore?: string;
  trending?: boolean;
  featured?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  preferences?: {
    genres?: string[];
    categories?: string[];
  };
  createdAt: Date;
}

export interface WatchHistory {
  id: number;
  userId: number;
  videoId: number;
  watchedAt: Date;
  progress: number;
}

export interface Watchlist {
  id: number;
  userId: number;
  videoId: number;
  addedAt: Date;
}
