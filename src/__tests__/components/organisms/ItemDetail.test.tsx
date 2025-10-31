import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemDetail } from '@/components/organisms/ItemDetail';
import { useQiitaItem } from '@/hooks/useQiitaApi';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/dateUtils';
import { QiitaItem } from '@/types/qiita';

// モック
jest.mock('@/hooks/useQiitaApi', () => ({
  useQiitaItem: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/utils/dateUtils', () => ({
  formatDate: jest.fn((date: string) => `formatted-${date}`),
}));

const mockUseQiitaItem = useQiitaItem as jest.MockedFunction<typeof useQiitaItem>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockFormatDate = formatDate as jest.MockedFunction<typeof formatDate>;

// テスト用のQiitaItemデータを作成するヘルパー
const createMockQiitaItem = (overrides?: Partial<QiitaItem>): QiitaItem => ({
  id: 'test-item-id',
  title: 'テスト記事のタイトル',
  url: 'https://qiita.com/test/test-item-id',
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
    {
      name: 'React',
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

describe('ItemDetail', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      back: mockBack,
      forward: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any);
  });

  describe('ローディング状態', () => {
    it('displays loading spinner when loading', () => {
      mockUseQiitaItem.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
      } as any);

      render(<ItemDetail itemId="test-id" />);

      expect(screen.getByText('記事の詳細を読み込み中...')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('displays error message when error occurs', () => {
      mockUseQiitaItem.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('API Error'),
        isError: true,
        isSuccess: false,
      } as any);

      render(<ItemDetail itemId="test-id" />);

      expect(screen.getByText('記事の詳細を読み込めませんでした')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument();
    });

    it('displays error message when item is null', () => {
      mockUseQiitaItem.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="test-id" />);

      expect(screen.getByText('記事の詳細を読み込めませんでした')).toBeInTheDocument();
    });

    it('calls router.back when back button is clicked in error state', async () => {
      const user = userEvent.setup();
      mockUseQiitaItem.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('API Error'),
        isError: true,
        isSuccess: false,
      } as any);

      render(<ItemDetail itemId="test-id" />);

      const backButton = screen.getByRole('button', { name: '戻る' });
      await user.click(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('正常表示', () => {
    it('displays item details correctly', () => {
      const mockItem = createMockQiitaItem();
      mockUseQiitaItem.mockReturnValue({
        data: mockItem,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="test-item-id" />);

      // ヘッダー
      expect(screen.getByText('Qiita Articles Viewer')).toBeInTheDocument();

      // タイトル
      expect(screen.getByText('テスト記事のタイトル')).toBeInTheDocument();

      // 投稿者
      expect(screen.getByText('@testuser (Test User)')).toBeInTheDocument();

      // 日時（formatDateが呼ばれる）
      expect(mockFormatDate).toHaveBeenCalledWith('2023-01-01T00:00:00Z');
      expect(mockFormatDate).toHaveBeenCalledWith('2023-01-02T00:00:00Z');

      // タグ
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();

      // 統計情報
      expect(screen.getByText('👍 15 いいね')).toBeInTheDocument();
      expect(screen.getByText('💬 5 コメント')).toBeInTheDocument();
      expect(screen.getByText('📊 8 ストック')).toBeInTheDocument();

      // 元記事へのリンク
      const linkButton = screen.getByRole('link', { name: '元記事を見る' });
      expect(linkButton).toHaveAttribute('href', 'https://qiita.com/test/test-item-id');
      expect(linkButton).toHaveAttribute('target', '_blank');
      expect(linkButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('displays user id only when user name is not available', () => {
      const mockItem = createMockQiitaItem({
        user: {
          id: 'testuser',
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
      });

      mockUseQiitaItem.mockReturnValue({
        data: mockItem,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="test-item-id" />);

      expect(screen.getByText('@testuser')).toBeInTheDocument();
      expect(screen.queryByText('()')).not.toBeInTheDocument();
    });

    it('displays rendered body as HTML', () => {
      const mockItem = createMockQiitaItem({
        rendered_body: '<p>テスト本文</p><h2>見出し</h2>',
      });

      mockUseQiitaItem.mockReturnValue({
        data: mockItem,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="test-item-id" />);

      // dangerouslySetInnerHTMLでレンダリングされた内容を確認
      const contentBox = screen.getByText('記事内容（プレビュー）').parentElement?.querySelector('div[class*="MuiBox"]');
      expect(contentBox).toBeInTheDocument();
    });

    it('calls router.back when back button is clicked', async () => {
      const user = userEvent.setup();
      const mockItem = createMockQiitaItem();
      mockUseQiitaItem.mockReturnValue({
        data: mockItem,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="test-item-id" />);

      // 戻るボタン（ArrowBackアイコン付きの方）をクリック
      const backButtons = screen.getAllByRole('button', { name: '戻る' });
      await user.click(backButtons[0]);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('displays multiple tags correctly', () => {
      const mockItem = createMockQiitaItem({
        tags: [
          { name: 'TypeScript', versions: [] },
          { name: 'Next.js', versions: [] },
          { name: 'React', versions: [] },
        ],
      });

      mockUseQiitaItem.mockReturnValue({
        data: mockItem,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="test-item-id" />);

      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('displays zero counts correctly', () => {
      const mockItem = createMockQiitaItem({
        likes_count: 0,
        comments_count: 0,
        stocks_count: 0,
      });

      mockUseQiitaItem.mockReturnValue({
        data: mockItem,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="test-item-id" />);

      expect(screen.getByText('👍 0 いいね')).toBeInTheDocument();
      expect(screen.getByText('💬 0 コメント')).toBeInTheDocument();
      expect(screen.getByText('📊 0 ストック')).toBeInTheDocument();
    });
  });

  describe('useQiitaItem hookの呼び出し', () => {
    it('calls useQiitaItem with correct itemId', () => {
      const mockItem = createMockQiitaItem();
      mockUseQiitaItem.mockReturnValue({
        data: mockItem,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      render(<ItemDetail itemId="specific-item-123" />);

      expect(mockUseQiitaItem).toHaveBeenCalledWith('specific-item-123');
    });

    it('re-renders when itemId changes', () => {
      const mockItem1 = createMockQiitaItem({ id: 'item-1', title: 'Title 1' });
      const mockItem2 = createMockQiitaItem({ id: 'item-2', title: 'Title 2' });

      mockUseQiitaItem.mockReturnValue({
        data: mockItem1,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      const { rerender } = render(<ItemDetail itemId="item-1" />);

      expect(screen.getByText('Title 1')).toBeInTheDocument();

      mockUseQiitaItem.mockReturnValue({
        data: mockItem2,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);

      rerender(<ItemDetail itemId="item-2" />);

      expect(mockUseQiitaItem).toHaveBeenLastCalledWith('item-2');
    });
  });
});

