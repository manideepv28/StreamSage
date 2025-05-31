import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { videoService } from '@/lib/videoService';
import { Video } from '@/types/video';
import { VideoCard } from './VideoCard';

interface SearchBarProps {
  onClose?: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchVideos = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await videoService.searchVideos(query);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchVideos, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div ref={searchRef} className="relative w-64">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search movies, shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 pl-10 pr-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              <div className="grid gap-2">
                {results.slice(0, 6).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                    onClick={handleClose}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{video.title}</p>
                      <p className="text-gray-400 text-sm">
                        {video.year} • {video.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {results.length > 6 && (
                <div className="mt-2 p-2 text-center text-gray-400 text-sm">
                  +{results.length - 6} more results
                </div>
              )}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-400">
              <p>No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
