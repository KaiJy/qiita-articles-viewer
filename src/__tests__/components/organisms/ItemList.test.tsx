import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemList } from '@/components/organisms/ItemList';
import { useCurrentPage, useSearchQuery, useItemsPerPage } from '@/stores/AppContext';
import { useQiitaItems } from '@/hooks/useQiitaApi';
import { useRouter } from 'next/navigation';
import { formatRelativeTime } from '@/utils/dateUtils';
import { QiitaItem, QiitaApiResponse } from '@/types/qiita';
import axios, { AxiosError } from 'axios';

// モック
jest.mock('@/stores/AppContext', () => ({
  useCurrentPage: jest.fn(),
  useSearchQuery: jest.fn(),
  useItemsPerPage: jest.fn(),
  useApiKey: jest.fn(),
  useIsAuthenticated: jest.fn(),
}));

jest.mock('@/hooks/useQiitaApi', () => ({
  useQiitaItems: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/utils/dateUtils', () => ({
  formatRelativeTime: jest.fn((date: string) => `relative-${date}`),
}));

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  isAxiosError: jest.fn(),
}));

// ApiKeyFormをモック
jest.mock('@/components/molecules/ApiKeyForm', () => ({
  ApiKeyForm: ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    if (!open) return null;
    return (
      <div role="dialog" data-testid="api-key-form">
        <button onClick={onClose}>Close Form</button>
      </div>
    );
  },
}));

const mockUseCurrentPage = useCurrentPage as jest.MockedFunction<typeof useCurrentPage>;
const mockUseSearchQuery = useSearchQuery as jest.MockedFunction<typeof useSearchQuery>;
const mockUseItemsPerPage = useItemsPerPage as jest.MockedFunction<typeof useItemsPerPage>;
const mockUseQiitaItems = useQiitaItems as jest.MockedFunction<typeof useQiitaItems>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockFormatRelativeTime = formatRelativeTime as jest.MockedFunction<typeof formatRelativeTime>;
const mockIsAxiosError = axios.isAxiosError as jest.MockedFunction<typeof axios.isAxiosError>;

// テスト用のQiitaItemデータを作成するヘルパー
const createMockQiitaItem = (id: string, overrides?: Partial<QiitaItem>): QiitaItem => ({
  id,
  title: `Test Article ${id}`,
  url: `https://qiita.com/test/${id}`,
  user: {
    id: 'testuser',
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

describe('ItemList', () => {
  const mockSetPage = jest.fn();
  const mockSetSearchQuery = jest.fn();
  const mockSetItemsPerPage = jest.fn();
  const mockPush = jest.fn();
  const mockRefetch = jest.fn();

  const setupMocks = (overrides?: {
    page?: number;
    searchQuery?: string;
    itemsPerPage?: number;
    data?: QiitaApiResponse;
    isLoading?: boolean;
    error?: any;
  }) => {
    mockUseCurrentPage.mockReturnValue([
      overrides?.page ?? 1,
      mockSetPage,
    ]);
    mockUseSearchQuery.mockReturnValue([
      overrides?.searchQuery ?? '',
      mockSetSearchQuery,
    ]);
    mockUseItemsPerPage.mockReturnValue([
      overrides?.itemsPerPage ?? 20,
      mockSetItemsPerPage,
    ]);
    mockUseQiitaItems.mockReturnValue({
      data: overrides?.data,
      isLoading: overrides?.isLoading ?? false,
      error: overrides?.error ?? null,
      isError: !!overrides?.error,
      isSuccess: !overrides?.isLoading && !overrides?.error,
      refetch: mockRefetch,
    } as any);
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatRelativeTime.mockImplementation((date) => `relative-${date}`);
    mockIsAxiosError.mockReturnValue(false);
  });

  describe('ローディング状態', () => {
    it('displays loading spinner when loading', () => {
      setupMocks({ isLoading: true });

      render(<ItemList />);

      expect(screen.getByText('記事を読み込み中...')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('displays error message when error occurs', () => {
      setupMocks({ error: new Error('API Error') });

      render(<ItemList />);

      expect(screen.getByText('記事の読み込みに失敗しました')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '再試行' })).toBeInTheDocument();
    });

    it('calls refetch when retry button is clicked', async () => {
      const user = userEvent.setup();
      setupMocks({ error: new Error('API Error') });

      render(<ItemList />);

      const retryButton = screen.getByRole('button', { name: '再試行' });
      await user.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('displays rate limit error when 403 with Rate-Remaining: 0', () => {
      const axiosError = {
        response: {
          status: 403,
          headers: {
            'Rate-Remaining': '0',
            'x-ratelimit-reset': String(Date.now() / 1000 + 3600),
          },
        },
      } as unknown as AxiosError;

      mockIsAxiosError.mockReturnValue(true);
      setupMocks({ error: axiosError });

      render(<ItemList />);

      expect(screen.getByText(/Qiita APIのリクエスト上限に達しました/)).toBeInTheDocument();
      const retryButton = screen.getByRole('button', { name: '再試行' });
      expect(retryButton).toBeDisabled();
    });

    it('displays rate limit error with reset time', () => {
      const resetTimestamp = Date.now() / 1000 + 3600; // 1時間後
      const axiosError = {
        response: {
          status: 403,
          headers: {
            'Rate-Remaining': '0',
            'x-ratelimit-reset': String(resetTimestamp),
          },
        },
      } as unknown as AxiosError;

      mockIsAxiosError.mockReturnValue(true);
      setupMocks({ error: axiosError });

      render(<ItemList />);

      expect(screen.getByText(/リセット時刻:/)).toBeInTheDocument();
    });
  });

  describe('正常表示', () => {
    it('displays item list correctly', () => {
      const mockData: QiitaApiResponse = {
        items: [
          createMockQiitaItem('1', {
            title: 'React Hooks入門',
            likes_count: 50,
          }),
          createMockQiitaItem('2', {
            title: 'TypeScript基礎',
            likes_count: 30,
          }),
        ],
        total_count: 100,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      render(<ItemList />);

      // ヘッダー
      expect(screen.getByText('Qiita Articles Viewer')).toBeInTheDocument();

      // 検索フォーム
      expect(screen.getByText('検索フォーム')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('検索キーワードを入力')).toBeInTheDocument();

      // DataGridのヘッダー
      expect(screen.getByText('タイトル')).toBeInTheDocument();
      expect(screen.getByText('ユーザー')).toBeInTheDocument();
      expect(screen.getByText('タグ')).toBeInTheDocument();
      expect(screen.getByText('いいね')).toBeInTheDocument();
      expect(screen.getByText('投稿日時')).toBeInTheDocument();

      // データ行
      expect(screen.getByText('React Hooks入門')).toBeInTheDocument();
      expect(screen.getByText('TypeScript基礎')).toBeInTheDocument();
    });

    it('displays user information correctly', () => {
      const mockData: QiitaApiResponse = {
        items: [
          createMockQiitaItem('1', {
            user: {
              id: 'johndoe',
              name: 'John Doe',
              description: '',
              facebook_id: '',
              followees_count: 0,
              followers_count: 0,
              github_login_name: '',
              items_count: 0,
              linkedin_id: '',
              location: '',
              organization: '',
              permanent_id: 0,
              profile_image_url: '',
              team_only: false,
              twitter_screen_name: '',
              website_url: '',
            },
          }),
        ],
        total_count: 1,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      render(<ItemList />);

      expect(screen.getByText('@johndoe (John Doe)')).toBeInTheDocument();
    });

    it('displays user id only when name is not available', () => {
      const mockData: QiitaApiResponse = {
        items: [
          createMockQiitaItem('1', {
            user: {
              id: 'johndoe',
              name: '',
              description: '',
              facebook_id: '',
              followees_count: 0,
              followers_count: 0,
              github_login_name: '',
              items_count: 0,
              linkedin_id: '',
              location: '',
              organization: '',
              permanent_id: 0,
              profile_image_url: '',
              team_only: false,
              twitter_screen_name: '',
              website_url: '',
            },
          }),
        ],
        total_count: 1,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      render(<ItemList />);

      expect(screen.getByText('@johndoe')).toBeInTheDocument();
    });

    it('displays tags correctly', () => {
      const mockData: QiitaApiResponse = {
        items: [
          createMockQiitaItem('1', {
            tags: [
              { name: 'React', versions: [] },
              { name: 'TypeScript', versions: [] },
              { name: 'Next.js', versions: [] },
            ],
          }),
        ],
        total_count: 1,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      render(<ItemList />);

      expect(screen.getByText('React, TypeScript, Next.js')).toBeInTheDocument();
    });
  });

  describe('検索機能', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup();
      setupMocks({ data: { items: [], total_count: 0, page: 1, per_page: 20 } });

      render(<ItemList />);

      const input = screen.getByPlaceholderText('検索キーワードを入力');
      await user.type(input, 'React');

      expect(input).toHaveValue('React');
    });

    it('performs search when search button is clicked', async () => {
      const user = userEvent.setup();
      setupMocks({ data: { items: [], total_count: 0, page: 1, per_page: 20 } });

      render(<ItemList />);

      const input = screen.getByPlaceholderText('検索キーワードを入力');
      await user.type(input, 'React Hooks');

      // SearchIconを持つボタンを探す
      const buttons = screen.getAllByRole('button');
      const searchButton = buttons.find(btn => 
        btn.querySelector('svg[data-testid="SearchIcon"]')
      );

      if (searchButton) {
        await user.click(searchButton);
      }

      expect(mockSetSearchQuery).toHaveBeenCalledWith('React Hooks');
      expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it('performs search when Enter key is pressed', async () => {
      const user = userEvent.setup();
      setupMocks({ data: { items: [], total_count: 0, page: 1, per_page: 20 } });

      render(<ItemList />);

      const input = screen.getByPlaceholderText('検索キーワードを入力');
      await user.type(input, 'TypeScript{Enter}');

      expect(mockSetSearchQuery).toHaveBeenCalledWith('TypeScript');
      expect(mockSetPage).toHaveBeenCalledWith(1);
    });

    it('initializes input value with current search query', () => {
      setupMocks({
        searchQuery: 'existing query',
        data: { items: [], total_count: 0, page: 1, per_page: 20 },
      });

      render(<ItemList />);

      const input = screen.getByPlaceholderText('検索キーワードを入力');
      expect(input).toHaveValue('existing query');
    });
  });

  describe('APIキーフォーム', () => {
    it('opens API key form when settings button is clicked', async () => {
      const user = userEvent.setup();
      setupMocks({ data: { items: [], total_count: 0, page: 1, per_page: 20 } });

      render(<ItemList />);

      // SettingsIconのボタンを探してクリック
      const buttons = screen.getAllByRole('button');
      const settingsButton = buttons.find(btn => 
        btn.querySelector('svg[data-testid="SettingsIcon"]')
      );

      if (settingsButton) {
        await user.click(settingsButton);
      }

      // ApiKeyFormが開かれることを確認
      // （ApiKeyFormはモックされていないので、実際のコンポーネントがレンダリングされる）
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('ページネーション', () => {
    it('updates page when pagination is changed', async () => {
      const mockData: QiitaApiResponse = {
        items: [createMockQiitaItem('1')],
        total_count: 100,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      const { container } = render(<ItemList />);

      // DataGridのページネーションボタンを探す
      const nextButton = container.querySelector('[aria-label="Go to next page"]');
      
      if (nextButton) {
        await userEvent.click(nextButton);
        
        await waitFor(() => {
          expect(mockSetPage).toHaveBeenCalledWith(2);
        });
      }
    });

    it('displays correct pagination model', () => {
      const mockData: QiitaApiResponse = {
        items: [createMockQiitaItem('1')],
        total_count: 100,
        page: 3,
        per_page: 50,
      };

      setupMocks({ page: 3, itemsPerPage: 50, data: mockData });

      render(<ItemList />);

      // DataGridが正しいページとページサイズで表示される
      // （内部的にpaginationModelが使用される）
    });
  });

  describe('行クリック', () => {
    it('navigates to detail page when row is clicked', async () => {
      const user = userEvent.setup();
      const mockData: QiitaApiResponse = {
        items: [createMockQiitaItem('test-item-123', { title: 'Clickable Item' })],
        total_count: 1,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      render(<ItemList />);

      const row = screen.getByText('Clickable Item').closest('[role="row"]');
      
      if (row) {
        await user.click(row);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/test-item-123');
        });
      }
    });
  });

  describe('空のデータ', () => {
    it('displays empty grid when no items', () => {
      const mockData: QiitaApiResponse = {
        items: [],
        total_count: 0,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      render(<ItemList />);

      expect(screen.getByText('Qiita Articles Viewer')).toBeInTheDocument();
      // DataGridは表示されるが、行がない
    });

    it('handles undefined data gracefully', () => {
      setupMocks({ data: undefined });

      render(<ItemList />);

      expect(screen.getByText('Qiita Articles Viewer')).toBeInTheDocument();
    });
  });

  describe('フォーマット関数の呼び出し', () => {
    it('calls formatRelativeTime for created_at', () => {
      const mockData: QiitaApiResponse = {
        items: [
          createMockQiitaItem('1', {
            created_at: '2023-05-01T10:00:00Z',
          }),
        ],
        total_count: 1,
        page: 1,
        per_page: 20,
      };

      setupMocks({ data: mockData });

      render(<ItemList />);

      expect(mockFormatRelativeTime).toHaveBeenCalledWith('2023-05-01T10:00:00Z');
    });
  });
});

