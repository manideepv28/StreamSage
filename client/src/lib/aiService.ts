import { Video } from '../types/video';

class AIService {
  private baseUrl = '/api';

  async getRecommendations(watchHistory: any[], preferences: any): Promise<Video[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          watchHistory,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      // Return empty array on error
      return [];
    }
  }
}

export const aiService = new AIService();
