import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { AIRecommendations } from '@/components/AIRecommendations';
import { CategoryFilter } from '@/components/CategoryFilter';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Video } from '@/types/video';
import { videoService } from '@/lib/videoService';

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadMoreCount, setLoadMoreCount] = useState(12);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allVideos, trending] = await Promise.all([
          videoService.getAllVideos(),
          videoService.getTrendingVideos()
        ]);
        
        setVideos(allVideos);
        setTrendingVideos(trending);
        setFilteredVideos(allVideos);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(
        video => video.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredVideos(filtered);
    }
    setLoadMoreCount(12); // Reset load more count when category changes
  }, [selectedCategory, videos]);

  const handlePlayVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsVideoPlayerOpen(false);
    setCurrentVideo(null);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleLoadMore = () => {
    setLoadMoreCount(prev => prev + 12);
  };

  const categories = Array.from(new Set(videos.map(video => video.category)));
  const displayedVideos = filteredVideos.slice(0, loadMoreCount);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="pt-16">
          {/* Hero Section Skeleton */}
          <div className="h-screen bg-gray-900 animate-pulse"></div>
          
          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div>
              <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700 rounded-lg h-64 mb-3"></div>
                    <div className="bg-gray-700 h-4 rounded mb-2"></div>
                    <div className="bg-gray-700 h-3 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="pt-16">
        <HeroSection />
      </div>

      {/* Main Content */}
      <main className="relative z-10 -mt-32 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          
          {/* AI Recommendations */}
          <AIRecommendations onPlayVideo={handlePlayVideo} />

          {/* Trending Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
            {trendingVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trendingVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={handlePlayVideo}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No trending content available at the moment.</p>
              </div>
            )}
          </section>

          {/* Category Filters */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {/* All Content */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {selectedCategory === 'All' ? 'All Content' : selectedCategory}
            </h2>
            
            {displayedVideos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                  {displayedVideos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={handlePlayVideo}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {loadMoreCount < filteredVideos.length && (
                  <div className="text-center">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  No content available in the {selectedCategory} category.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Video Player Modal */}
      {currentVideo && (
        <VideoPlayer
          video={currentVideo}
          isOpen={isVideoPlayerOpen}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}
