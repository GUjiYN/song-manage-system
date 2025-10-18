/**
 * 搜索页面
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Music,
  User,
  Disc,
  BarChart3,
  Clock,
  TrendingUp,
  X,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/main-layout';
import {
  search,
  getTrendingSearches,
  getSearchSuggestions,
  getSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
  sortSearchHistoryByTime
} from '@/services/client/search';
import { SearchResults, SearchType, SearchHistoryItem, TrendingSearchItem } from '@/types/search';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trending, setTrending] = useState<TrendingSearchItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 初始化热门搜索和搜索历史
  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载热门搜索
        const trendingData = await getTrendingSearches();
        setTrending(trendingData);

        // 加载搜索历史
        const history = getSearchHistory();
        setSearchHistory(sortSearchHistoryByTime(history));
      } catch (err) {
        console.error('Failed to load search data:', err);
      }
    };

    loadData();
  }, []);

  // 如果URL有查询参数，自动执行搜索
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // 处理搜索
  const handleSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      const searchResults = await search({
        query: query.trim(),
        type: searchType,
        page,
        limit: 20
      });

      setResults(searchResults);

      // 添加到搜索历史
      addSearchHistory(query.trim(), searchType);

      // 更新URL
      const params = new URLSearchParams();
      params.set('query', query.trim());
      if (searchType !== 'all') {
        params.set('type', searchType);
      }
      router.push(`/search?${params.toString()}`);

      // 隐藏建议
      setShowSuggestions(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('搜索失败'));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化（获取搜索建议）
  const handleInputChange = async (value: string) => {
    setSearchQuery(value);

    if (value.trim().length > 0) {
      try {
        const suggestionsData = await getSearchSuggestions(value.trim());
        setSuggestions(suggestionsData);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to get suggestions:', err);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 加载更多
  const loadMore = () => {
    if (results && results.hasMore) {
      handleSearch(searchQuery, currentPage + 1);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
    setResults(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setCurrentPage(1);
    router.push('/search');
  };

  // 搜索类型标签
  const searchTypes = [
    { value: 'all', label: '全部', icon: BarChart3 },
    { value: 'playlists', label: '歌单', icon: Music },
    { value: 'songs', label: '歌曲', icon: Music },
    { value: 'artists', label: '歌手', icon: User },
    { value: 'albums', label: '专辑', icon: Disc },
  ];

  const formatDuration = (value?: string | null) => {
    if (!value) {
      return '--:--';
    }

    const trimmed = value.trim();
    if (/^\d{1,2}:[0-5]\d$/.test(trimmed)) {
      return trimmed;
    }

    const numeric = Number(trimmed);
    if (Number.isFinite(numeric) && numeric >= 0) {
      const minutes = Math.floor(numeric / 60);
      const seconds = Math.floor(numeric % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return trimmed;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 搜索头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">搜索</h1>

          {/* 搜索输入框 */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="搜索歌单、歌曲、歌手、专辑..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10 pr-10 h-12 text-lg"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* 搜索建议 */}
            {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                {/* 搜索建议 */}
                {suggestions.length > 0 && (
                  <div className="p-2 border-b border-gray-100">
                    <div className="text-xs text-gray-500 px-2 py-1">搜索建议</div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors flex items-center"
                        onClick={() => {
                          handleSearch(suggestion);
                        }}
                      >
                        <Search className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="text-sm">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 搜索历史 */}
                {searchHistory.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="text-xs text-gray-500">搜索历史</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearchHistory}
                        className="text-xs text-gray-400 hover:text-gray-600 h-6 px-2"
                      >
                        清除
                      </Button>
                    </div>
                    {searchHistory.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors flex items-center justify-between group"
                        onClick={() => handleSearch(item.query)}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <Clock className="w-4 h-4 mr-3 text-gray-400" />
                          <span className="text-sm truncate">{item.query}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSearchHistoryItem(item.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 搜索类型选择 */}
          <Tabs value={searchType} onValueChange={(value) => setSearchType(value as SearchType)}>
            <TabsList className="grid w-full grid-cols-5 mt-4">
              {searchTypes.map((type) => (
                <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
                  <type.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 热门搜索 */}
        {!searchQuery && !results && trending.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">热门搜索</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trending.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSearch(item.query)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                >
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 搜索结果 */}
        {results && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                搜索结果 <span className="text-gray-500 ml-2">({results.totalCount})</span>
              </h2>
              <Badge variant="secondary">
                {searchTypes.find(t => t.value === searchType)?.label}
              </Badge>
            </div>

            {/* 结果列表 */}
            <div className="space-y-4">
              {/* 歌单结果 */}
              {searchType === 'all' || searchType === 'playlists' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Music className="w-5 h-5 mr-2 text-blue-500" />
                    歌单
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.playlists.map((playlist) => (
                      <Card
                        key={playlist.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/playlists/${playlist.id}`)}
                      >
                        <div className="flex">
                          {playlist.coverUrl ? (
                            <img
                              src={playlist.coverUrl}
                              alt={playlist.name}
                              className="w-16 h-16 object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                              <Music className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="p-4 flex-1">
                            <h4 className="font-medium text-gray-900 truncate">{playlist.name}</h4>
                            <p className="text-sm text-gray-600 truncate">
                              {playlist.description || '暂无描述'}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span>{playlist.creator?.name}</span>
                              <span className="mx-2">•</span>
                              <span>{playlist._count?.songs || 0}首歌</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* 歌曲结果 */}
              {searchType === 'all' || searchType === 'songs' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Music className="w-5 h-5 mr-2 text-green-500" />
                    歌曲
                  </h3>
                  <div className="space-y-2">
                    {results.songs.map((song) => (
                      <Card
                        key={song.id}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          // TODO: 添加歌曲详情页面
                          console.log('Song clicked:', song);
                        }}
                      >
                        <div className="flex items-center">
                          {song.coverUrl ? (
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Music className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4 flex-1">
                            <h4 className="font-medium text-gray-900">{song.title}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <span>{song.artist?.name || `歌手 ${song.artistId}`}</span>
                              <span className="mx-2">•</span>
                              <span>{song.album?.name || `专辑 ${song.albumId}`}</span>
                              {song.duration && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{formatDuration(song.duration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* 歌手结果 */}
              {searchType === 'all' || searchType === 'artists' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-purple-500" />
                    歌手
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.artists.map((artist) => (
                      <Card
                        key={artist.id}
                        className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          // TODO: 添加歌手详情页面
                          console.log('Artist clicked:', artist);
                        }}
                      >
                        {artist.avatar ? (
                          <img
                            src={artist.avatar}
                            alt={artist.name}
                            className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <h4 className="font-medium text-gray-900">{artist.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {artist._count?.songs || 0}首歌 • {artist._count?.albums || 0}张专辑
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* 专辑结果 */}
              {searchType === 'all' || searchType === 'albums' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Disc className="w-5 h-5 mr-2 text-orange-500" />
                    专辑
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.albums.map((album) => (
                      <Card
                        key={album.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                          // TODO: 添加专辑详情页面
                          console.log('Album clicked:', album);
                        }}
                      >
                        {album.coverUrl ? (
                          <img
                            src={album.coverUrl}
                            alt={album.name}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                            <Disc className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 truncate">{album.name}</h4>
                          <p className="text-sm text-gray-600">
                            {album.artist?.name || `歌手 ${album.artistId}`}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <span>{album._count?.songs || 0}首歌</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 加载更多按钮 */}
            {results.hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? '加载中...' : '加载更多'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !results && searchQuery && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到相关结果</h3>
            <p className="text-gray-600 mb-6">
              试试调整搜索词或搜索条件
            </p>
            <Button variant="outline" onClick={clearSearch}>
              重新搜索
            </Button>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">搜索失败</h3>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <Button onClick={() => handleSearch(searchQuery)}>
              重试
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
