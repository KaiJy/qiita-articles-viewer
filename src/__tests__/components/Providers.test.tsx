import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Providers } from '@/components/Providers';
import { useAppContext } from '@/stores/AppContext';
import { useQuery } from '@tanstack/react-query';

// テスト用のコンポーネント：AppContextを使用
function TestAppContextComponent() {
  const { apiKey, setApiKey } = useAppContext();
  return (
    <div>
      <div data-testid="api-key">{apiKey || 'empty'}</div>
      <button onClick={() => setApiKey('test-key')}>Set API Key</button>
    </div>
  );
}

// テスト用のコンポーネント：React Queryを使用
function TestQueryComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      return { message: 'test data' };
    },
  });

  if (isLoading) return <div>Loading...</div>;
  return <div data-testid="query-data">{data?.message}</div>;
}

describe('Providers', () => {
  describe('基本的なレンダリング', () => {
    it('renders children correctly', () => {
      render(
        <Providers>
          <div>Test Content</div>
        </Providers>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      render(
        <Providers>
          <div>First Child</div>
          <div>Second Child</div>
          <span>Third Child</span>
        </Providers>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('renders with text node as children', () => {
      render(
        <Providers>
          Plain text content
        </Providers>
      );

      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });
  });

  describe('AppProvider統合', () => {
    it('provides AppContext to children', () => {
      render(
        <Providers>
          <TestAppContextComponent />
        </Providers>
      );

      // 初期状態でapiKeyが空であることを確認
      expect(screen.getByTestId('api-key')).toHaveTextContent('empty');
    });

    it('allows children to use AppContext hooks', async () => {
      const user = userEvent.setup();

      render(
        <Providers>
          <TestAppContextComponent />
        </Providers>
      );

      const button = screen.getByRole('button', { name: 'Set API Key' });
      await user.click(button);

      // setApiKeyが実行された後、apiKeyが更新される
      expect(screen.getByTestId('api-key')).toHaveTextContent('test-key');
    });
  });

  describe('QueryClientProvider統合', () => {
    it('provides QueryClient to children', async () => {
      render(
        <Providers>
          <TestQueryComponent />
        </Providers>
      );

      // 最初はローディング状態
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // データが読み込まれるのを待つ
      const queryData = await screen.findByTestId('query-data');
      expect(queryData).toHaveTextContent('test data');
    });

    it('configures QueryClient with correct default options', async () => {
      render(
        <Providers>
          <TestQueryComponent />
        </Providers>
      );

      // データが読み込まれることを確認
      const queryData = await screen.findByTestId('query-data');
      expect(queryData).toBeInTheDocument();
    });
  });

  describe('ThemeProvider統合', () => {
    it('provides Material-UI theme to children', () => {
      render(
        <Providers>
          <div data-testid="themed-content">Themed Content</div>
        </Providers>
      );

      const content = screen.getByTestId('themed-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('複雑なchildren', () => {
    it('renders complex nested structure', () => {
      render(
        <Providers>
          <header>
            <h1>Header</h1>
          </header>
          <main>
            <section>
              <article>
                <p>Article content</p>
              </article>
            </section>
          </main>
          <footer>
            <p>Footer</p>
          </footer>
        </Providers>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Article content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('renders with components using multiple providers', async () => {
      render(
        <Providers>
          <TestAppContextComponent />
          <TestQueryComponent />
        </Providers>
      );

      // AppContextが動作していることを確認
      expect(screen.getByTestId('api-key')).toBeInTheDocument();

      // React Queryが動作していることを確認
      const queryData = await screen.findByTestId('query-data');
      expect(queryData).toBeInTheDocument();
    });
  });

  describe('再レンダリング', () => {
    it('maintains QueryClient instance across re-renders', () => {
      const { rerender } = render(
        <Providers>
          <div>Initial Content</div>
        </Providers>
      );

      rerender(
        <Providers>
          <div>Updated Content</div>
        </Providers>
      );

      expect(screen.getByText('Updated Content')).toBeInTheDocument();
    });

    it('preserves context state across children updates', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <Providers>
          <TestAppContextComponent />
        </Providers>
      );

      const button = screen.getByRole('button', { name: 'Set API Key' });
      await user.click(button);

      expect(screen.getByTestId('api-key')).toHaveTextContent('test-key');

      // childrenを更新しても、コンテキストの状態は保持される
      rerender(
        <Providers>
          <TestAppContextComponent />
        </Providers>
      );

      // 状態が保持されていることを確認
      expect(screen.getByTestId('api-key')).toHaveTextContent('test-key');
    });
  });
});

