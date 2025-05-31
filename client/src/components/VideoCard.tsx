import { useState } from 'react';
import { Play, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/types/video';
import { videoService } from '@/lib/videoService';
import { useWatchlist } from '@/hooks/useLocalStorage';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  className?: string;
}

export function VideoCard({ video, onPlay, className = '' }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [watchlist, setWatchlist] = useWatchlist();
  const [isUpdatingWatchlist, setIsUpdatingWatchlist] = useState(false);

  const isInWatchlist = watchlist.includes(video.id);

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUpdatingWatchlist(true);

    try {
      if (isInWatchlist) {
        await videoService.removeFromWatchlist(video.id);
        setWatchlist(watchlist.filter(id => id !== video.id));
      } else {
        await videoService.addToWatchlist(video.id);
        setWatchlist([...watchlist, video.id]);
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    } finally {
      setIsUpdatingWatchlist(false);
    }
  };

  const handlePlay = async () => {
    try {
      await videoService.addToWatchHistory(video.id);
      onPlay(video);
    } catch (error) {
      console.error('Failed to add to watch history:', error);
      onPlay(video);
    }
  };

  return (
    <div
      className={`group cursor-pointer transform hover:scale-105 transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-64 object-cover group-hover:brightness-75 transition-all duration-300"
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Watchlist button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleWatchlistToggle}
            disabled={isUpdatingWatchlist}
            className="bg-black/60 hover:bg-black/80 text-white border-none p-2"
          >
            {isUpdatingWatchlist ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isInWatchlist ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Trending badge */}
        {video.trending && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Trending
            </span>
          </div>
        )}
      </div>

      {/* Video info */}
      <div className="mt-3">
        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-400 text-sm">
            {video.year} • {video.duration}
          </span>
          {video.imdbScore && (
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-white text-sm font-medium">{video.imdbScore}</span>
            </div>
          )}
        </div>
        {video.genre && video.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {video.genre.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
