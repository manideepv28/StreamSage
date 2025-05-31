import { Video } from '../types/video';

class VideoService {
  private baseUrl = '/api';

  async getAllVideos(): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/videos`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return response.json();
  }

  async getVideoById(id: number): Promise<Video> {
    const response = await fetch(`${this.baseUrl}/videos/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch video');
    }
    return response.json();
  }

  async getVideosByCategory(category: string): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/videos/category/${category}`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos by category');
    }
    return response.json();
  }

  async getVideosByGenre(genre: string): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/videos/genre/${genre}`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos by genre');
    }
    return response.json();
  }

  async getTrendingVideos(): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/videos/trending`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending videos');
    }
    return response.json();
  }

  async getFeaturedVideo(): Promise<Video> {
    const response = await fetch(`${this.baseUrl}/videos/featured`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured video');
    }
    return response.json();
  }

  async searchVideos(query: string): Promise<Video[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search videos');
    }
    return response.json();
  }

  async addToWatchHistory(videoId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });
    if (!response.ok) {
      throw new Error('Failed to add to watch history');
    }
  }

  async updateWatchProgress(videoId: number, progress: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user/history/${videoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress }),
    });
    if (!response.ok) {
      throw new Error('Failed to update watch progress');
    }
  }

  async addToWatchlist(videoId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });
    if (!response.ok) {
      throw new Error('Failed to add to watchlist');
    }
  }

  async removeFromWatchlist(videoId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user/watchlist/${videoId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to remove from watchlist');
    }
  }

  async isInWatchlist(videoId: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/user/watchlist/${videoId}`);
    if (!response.ok) {
      throw new Error('Failed to check watchlist status');
    }
    const result = await response.json();
    return result.isInWatchlist;
  }

  getEmbedUrl(videoUrl: string): string {
    // Convert regular YouTube/Vimeo URLs to embed URLs
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = new URL(videoUrl).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoUrl.includes('vimeo.com/')) {
      const videoId = videoUrl.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return videoUrl; // Assume it's already an embed URL
  }
}

export const videoService = new VideoService();
