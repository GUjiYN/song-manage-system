/**
 * 搜索相关的API服务
 */

import {
  SearchParams,
  SearchResults,
  TrendingSearchItem,
  SearchHistoryItem,
  SearchType
} from '@/types/search';

const API_BASE = '/api/search';

// 通用API响应处理函数
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '请求失败');
  }

  const result = await response.json();

  // 处理标准API响应格式 { success: true, data: ... }
  if (result && typeof result === 'object' && 'success' in result) {
    if (!result.success) {
      throw new Error(result.message || '请求失败');
    }
    return result.data as T;
  }

  // 如果不是标准格式，直接返回
  return result as T;
}

/**
 * 执行搜索
 */
export async function search(params: SearchParams): Promise<SearchResults> {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.append('query', params.query);
  if (params.type && params.type !== 'all') searchParams.append('type', params.type);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url);
  return handleApiResponse<SearchResults>(response);
}

/**
 * 获取热门搜索关键词
 */
export async function getTrendingSearches(limit: number = 10): Promise<TrendingSearchItem[]> {
  const response = await fetch(`${API_BASE}/trending?limit=${limit}`);
  return handleApiResponse<TrendingSearchItem[]>(response);
}

/**
 * 获取搜索建议
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
  if (!query.trim()) return [];

  const searchParams = new URLSearchParams();
  searchParams.append('query', query);
  searchParams.append('limit', limit.toString());

  const response = await fetch(`${API_BASE}/suggestions?${searchParams.toString()}`);
  return handleApiResponse<string[]>(response);
}

// 搜索历史相关工具函数

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * 获取搜索历史
 */
export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!history) return [];

    // 验证是否为有效的JSON
    const parsed = JSON.parse(history);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse search history:', error);
    // 清除可能损坏的数据
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (clearError) {
      console.error('Failed to clear search history:', clearError);
    }
    return [];
  }
}

/**
 * 添加搜索历史
 */
export function addSearchHistory(query: string, type?: SearchType): void {
  try {
    const history = getSearchHistory();

    // 移除重复的搜索项
    const filteredHistory = history.filter(item => item.query !== query);

    // 添加新的搜索项
    const newHistory = [
      {
        id: Date.now().toString(),
        query,
        type,
        timestamp: new Date().toISOString()
      },
      ...filteredHistory
    ].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * 删除搜索历史项
 */
export function removeSearchHistoryItem(id: string): void {
  try {
    const history = getSearchHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Failed to remove search history item:', error);
  }
}

/**
 * 清空搜索历史
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * 搜索历史排序（按时间倒序）
 */
export function sortSearchHistoryByTime(history: SearchHistoryItem[]): SearchHistoryItem[] {
  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}