import { useState, useEffect } from 'react';
import { RefreshCw, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard } from './VideoCard';
import { Video } from '@/types/video';
import { aiService } from '@/lib/aiService';
import { useWatchHistory, useUserPreferences } from '@/hooks/useLocalStorage';

interface AIRecommendationsProps {
  onPlayVideo: (video: Video) => void;
}

export function AIRecommendations({ onPlayVideo }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchHistory] = useWatchHistory();
  const [preferences] = useUserPreferences();

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const aiRecommendations = await aiService.getRecommendations(watchHistory, preferences);
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [watchHistory, preferences]);

  const handleRefresh = () => {
    loadRecommendations();
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">AI Recommendations</h2>
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 rounded-lg h-64 mb-3"></div>
              <div className="bg-gray-700 h-4 rounded mb-2"></div>
              <div className="bg-gray-700 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-blue-500" />
          <h2 className="text-2xl font-bold">AI Recommendations</h2>
          <span className="text-sm text-gray-400 bg-blue-500/20 px-2 py-1 rounded-full">
            Powered by AI
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendations.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={onPlayVideo}
              className="relative"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bot className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            Building Your Recommendations
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Watch a few videos to help our AI understand your preferences and get personalized recommendations.
          </p>
        </div>
      )}
    </section>
  );
}
