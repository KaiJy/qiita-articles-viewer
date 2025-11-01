import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQiitaItems, useQiitaItem } from '@/hooks/useQiitaApi';
import { qiitaApi } from '@/services/qiitaApi';
import { useAppContext } from '@/stores/AppContext';
import { QiitaItem, QiitaApiResponse } from '@/types/qiita';

// モック
jest.mock('@/services/qiitaApi', () => ({
  qiitaApi: {
    getItems: jest.fn(),
    getItem: jest.fn(),
  },
}));

jest.mock('@/stores/AppContext', () => ({
  useAppContext: jest.fn(),
}));

const mockQiitaApi = qiitaApi as jest.Mocked<typeof qiitaApi>;
const mockUseAppContext = useAppContext as jest.MockedFunction<
  typeof useAppContext
>;

// テスト用のQiitaItemデータを作成するヘルパー
const createMockQiitaItem = (
  id: string,
  overrides?: Partial<QiitaItem>
): QiitaItem => ({
  id,
  title: `Test Article ${id}`,
  url: `https://qiita.com/test/${id}`,
  user: {
    id: 'test-user',
    name: 'Test User',
    description: 'Test Description',
    facebook_id: '',
    followees_count: 10,
    followers_count: 20,
    github_login_name: 'testuser',
    items_count: 5,
    linkedin_id: '',
    location: 'Tokyo',
    organization: 'Test Org',
    permanent_id: 12345,
    profile_image_url: 'https://example.com/avatar.png',
    team_only: false,
    twitter_screen_name: 'testuser',
    website_url: 'https://example.com',
  },
  tags: [
    {
      name: 'JavaScript',
      versions: [],
    },
  ],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z',
  body: 'Test body content',
  rendered_body: '<p>Test body content</p>',
  private: false,
  reactions_count: 10,
  comments_count: 5,
  likes_count: 15,
  stocks_count: 8,
  page_views_count: 100,
  team_membership: null,
  coediting: false,
  group: null,
  ...overrides,
});

// テスト用のQueryClientを作成する関数
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // テスト時はリトライしない
      },
    },
  });

describe('useQiitaApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useQiitaItems', () => {
    const setupMocks = (contextOverrides?: {
      currentPage?: number;
      itemsPerPage?: number;
      isAuthenticated?: boolean;
      searchQuery?: string;
    }) => {
      mockUseAppContext.mockReturnValue({
        currentPage: contextOverrides?.currentPage ?? 1,
        itemsPerPage: contextOverrides?.itemsPerPage ?? 20,
        isAuthenticated: contextOverrides?.isAuthenticated ?? false,
        searchQuery: contextOverrides?.searchQuery ?? '',
        apiKey: '',
        setApiKey: jest.fn(),
        setIsAuthenticated: jest.fn(),
        setCurrentPage: jest.fn(),
        setItemsPerPage: jest.fn(),
        setSearchQuery: jest.fn(),
      });
    };

    it('fetches items with default parameters', async () => {
      setupMocks();
      const queryClient = createTestQueryClient();
      const mockResponse: QiitaApiResponse = {
        items: [createMockQiitaItem('1'), createMockQiitaItem('2')],
        total_count: 100,
        page: 1,
        per_page: 20,
      };

      mockQiitaApi.getItems.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useQiitaItems(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      // 初期状態はloading
      expect(result.current.isLoading).toBe(true);

      // データの取得を待つ
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // qiitaApi.getItemsが正しいパラメータで呼ばれたか
      expect(mockQiitaApi.getItems).toHaveBeenCalledWith(1, 20, '');
      expect(mockQiitaApi.getItems).toHaveBeenCalledTimes(1);

      // 取得したデータが正しいか
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.items).toHaveLength(2);
    });

    it('fetches items with custom page and perPage', async () => {
      setupMocks({ currentPage: 3, itemsPerPage: 50 });
      const queryClient = createTestQueryClient();
      const mockResponse: QiitaApiResponse = {
        items: [createMockQiitaItem('3')],
        total_count: 150,
        page: 3,
        per_page: 50,
      };

      mockQiitaApi.getItems.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useQiitaItems(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockQiitaApi.getItems).toHaveBeenCalledWith(3, 50, '');
      expect(result.current.data).toEqual(mockResponse);
    });

    it('fetches items with search query', async () => {
      setupMocks({ searchQuery: 'react hooks' });
      const queryClient = createTestQueryClient();
      const mockResponse: QiitaApiResponse = {
        items: [createMockQiitaItem('search-1')],
        total_count: 10,
        page: 1,
        per_page: 20,
      };

      mockQiitaApi.getItems.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useQiitaItems(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockQiitaApi.getItems).toHaveBeenCalledWith(1, 20, 'react hooks');
      expect(result.current.data).toEqual(mockResponse);
    });

    it('handles error state correctly', async () => {
      setupMocks();
      const queryClient = createTestQueryClient();
      const mockError = new Error('API Error');

      mockQiitaApi.getItems.mockRejectedValue(mockError);

      const { result } = renderHook(() => useQiitaItems(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('uses correct query key with all parameters', async () => {
      setupMocks({
        currentPage: 2,
        itemsPerPage: 30,
        isAuthenticated: true,
        searchQuery: 'typescript',
      });
      const queryClient = createTestQueryClient();
      const mockResponse: QiitaApiResponse = {
        items: [],
        total_count: 0,
        page: 2,
        per_page: 30,
      };

      mockQiitaApi.getItems.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useQiitaItems(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // queryKeyが正しいことを確認（内部的に使用される）
      const queryKey = ['qiita-items', 2, 30, 'typescript'];
      const cachedData = queryClient.getQueryData(queryKey);
      expect(cachedData).toEqual(mockResponse);
    });

    it('refetches when parameters change', async () => {
      setupMocks({ currentPage: 1 });
      const queryClient = createTestQueryClient();
      const mockResponse1: QiitaApiResponse = {
        items: [createMockQiitaItem('1')],
        total_count: 100,
        page: 1,
        per_page: 20,
      };
      const mockResponse2: QiitaApiResponse = {
        items: [createMockQiitaItem('2')],
        total_count: 100,
        page: 2,
        per_page: 20,
      };

      mockQiitaApi.getItems.mockResolvedValueOnce(mockResponse1);

      const { result, rerender } = renderHook(() => useQiitaItems(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse1);

      // パラメータを変更
      setupMocks({ currentPage: 2 });
      mockQiitaApi.getItems.mockResolvedValueOnce(mockResponse2);

      rerender();

      await waitFor(() => {
        return result.current.data?.page === 2;
      });

      expect(mockQiitaApi.getItems).toHaveBeenCalledTimes(2);
      expect(mockQiitaApi.getItems).toHaveBeenLastCalledWith(2, 20, '');
    });
  });

  describe('useQiitaItem', () => {
    it('fetches item by id', async () => {
      const queryClient = createTestQueryClient();
      const mockItem = createMockQiitaItem('test-item-123');

      mockQiitaApi.getItem.mockResolvedValue(mockItem);

      const { result } = renderHook(() => useQiitaItem('test-item-123'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockQiitaApi.getItem).toHaveBeenCalledWith('test-item-123');
      expect(mockQiitaApi.getItem).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockItem);
    });

    it('does not fetch when itemId is empty', async () => {
      const queryClient = createTestQueryClient();

      const { result } = renderHook(() => useQiitaItem(''), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      // enabledがfalseなので、fetchは実行されない
      expect(result.current.status).toBe('pending');
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockQiitaApi.getItem).not.toHaveBeenCalled();
    });

    it('handles error state correctly', async () => {
      const queryClient = createTestQueryClient();
      const mockError = new Error('Item not found');

      mockQiitaApi.getItem.mockRejectedValue(mockError);

      const { result } = renderHook(() => useQiitaItem('non-existent-item'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('uses correct query key', async () => {
      const queryClient = createTestQueryClient();
      const mockItem = createMockQiitaItem('key-test-item');

      mockQiitaApi.getItem.mockResolvedValue(mockItem);

      const { result } = renderHook(() => useQiitaItem('key-test-item'), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // queryKeyが正しいことを確認
      const queryKey = ['qiita-item', 'key-test-item'];
      const cachedData = queryClient.getQueryData(queryKey);
      expect(cachedData).toEqual(mockItem);
    });

    it('refetches when itemId changes', async () => {
      const queryClient = createTestQueryClient();
      const mockItem1 = createMockQiitaItem('item-1', { title: 'Item 1' });
      const mockItem2 = createMockQiitaItem('item-2', { title: 'Item 2' });

      mockQiitaApi.getItem.mockResolvedValueOnce(mockItem1);

      const { result, rerender } = renderHook(
        ({ itemId }: { itemId: string }) => useQiitaItem(itemId),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
          initialProps: { itemId: 'item-1' },
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockItem1);
      expect(mockQiitaApi.getItem).toHaveBeenCalledWith('item-1');

      // itemIdを変更
      mockQiitaApi.getItem.mockResolvedValueOnce(mockItem2);
      rerender({ itemId: 'item-2' });

      // 新しいクエリが実行されることを確認
      await waitFor(() => {
        return mockQiitaApi.getItem.mock.calls.length === 2;
      });

      expect(mockQiitaApi.getItem).toHaveBeenLastCalledWith('item-2');

      // データが更新されるのを待つ
      await waitFor(() => expect(result.current.data?.id).toBe('item-2'));
    });

    it('transitions from disabled to enabled when itemId becomes available', async () => {
      const queryClient = createTestQueryClient();
      const mockItem = createMockQiitaItem('delayed-item');

      mockQiitaApi.getItem.mockResolvedValue(mockItem);

      const { result, rerender } = renderHook(
        ({ itemId }: { itemId: string }) => useQiitaItem(itemId),
        {
          wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          ),
          initialProps: { itemId: '' },
        }
      );

      // 初期状態：itemIdが空なので無効
      expect(result.current.status).toBe('pending');
      expect(result.current.fetchStatus).toBe('idle');
      expect(mockQiitaApi.getItem).not.toHaveBeenCalled();

      // itemIdが設定される
      rerender({ itemId: 'delayed-item' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockQiitaApi.getItem).toHaveBeenCalledWith('delayed-item');
      expect(result.current.data).toEqual(mockItem);
    });
  });
});
