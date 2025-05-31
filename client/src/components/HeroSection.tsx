import { useState, useEffect } from 'react';
import { Play, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { videoService } from '@/lib/videoService';
import { Video } from '@/types/video';
import { VideoPlayer } from './VideoPlayer';
import { useWatchlist } from '@/hooks/useLocalStorage';

export function HeroSection() {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [watchlist, setWatchlist] = useWatchlist();

  useEffect(() => {
    const loadFeaturedVideo = async () => {
      try {
        const video = await videoService.getFeaturedVideo();
        setFeaturedVideo(video);
      } catch (error) {
        console.error('Failed to load featured video:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedVideo();
  }, []);

  const handlePlay = async () => {
    if (featuredVideo) {
      setIsPlaying(true);
      try {
        await videoService.addToWatchHistory(featuredVideo.id);
      } catch (error) {
        console.error('Failed to add to watch history:', error);
      }
    }
  };

  const handleAddToList = async () => {
    if (!featuredVideo) return;

    try {
      if (watchlist.includes(featuredVideo.id)) {
        await videoService.removeFromWatchlist(featuredVideo.id);
        setWatchlist(watchlist.filter(id => id !== featuredVideo.id));
      } else {
        await videoService.addToWatchlist(featuredVideo.id);
        setWatchlist([...watchlist, featuredVideo.id]);
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  if (isLoading) {
    return (
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gray-900 animate-pulse"></div>
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-4">
              <div className="h-12 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="flex space-x-4 mt-8">
                <div className="h-12 w-32 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-12 w-32 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredVideo) {
    return (
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gray-900"></div>
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Featured Content Available</h2>
            <p className="text-gray-400">Please check back later for featured content.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${featuredVideo.thumbnailUrl})` }}
        ></div>
        
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {featuredVideo.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                {featuredVideo.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6">
                {featuredVideo.rating && (
                  <span className="bg-red-600 px-3 py-1 rounded text-sm font-semibold">
                    {featuredVideo.rating}
                  </span>
                )}
                <span className="text-gray-300">{featuredVideo.year}</span>
                <span className="text-gray-300">{featuredVideo.duration}</span>
                {featuredVideo.imdbScore && (
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span>{featuredVideo.imdbScore}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={handlePlay}
                  className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 rounded-lg flex items-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Play</span>
                </Button>
                <Button
                  onClick={handleAddToList}
                  variant="secondary"
                  className="bg-gray-700/80 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>
                    {watchlist.includes(featuredVideo.id) ? 'Remove from List' : 'My List'}
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  className="bg-gray-700/80 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-lg"
                >
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isPlaying && featuredVideo && (
        <VideoPlayer
          video={featuredVideo}
          isOpen={isPlaying}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </>
  );
}
