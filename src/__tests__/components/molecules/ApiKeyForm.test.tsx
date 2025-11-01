import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiKeyForm } from '@/components/molecules/ApiKeyForm'; // ← 実際のパスに合わせて
import { useApiKey, useIsAuthenticated } from '@/stores/AppContext';
import { setApiToken } from '@/services/qiitaApi';

jest.mock('@/stores/AppContext', () => ({
  useApiKey: jest.fn(),
  useIsAuthenticated: jest.fn(),
}));

jest.mock('@/services/qiitaApi', () => ({
  setApiToken: jest.fn(),
}));

describe('ApiKeyForm', () => {
  const mockUseApiKey = useApiKey as jest.MockedFunction<typeof useApiKey>;
  const mockUseIsAuthenticated = useIsAuthenticated as jest.MockedFunction<
    typeof useIsAuthenticated
  >;
  const mockSetApiToken = setApiToken as jest.MockedFunction<
    typeof setApiToken
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setup = (opts?: { initialApiKey?: string }) => {
    const setApiKey = jest.fn();
    const setIsAuth = jest.fn();
    mockUseApiKey.mockReturnValue([opts?.initialApiKey ?? '', setApiKey]);
    mockUseIsAuthenticated.mockReturnValue([false, setIsAuth]);

    const onClose = jest.fn();
    render(<ApiKeyForm open={true} onClose={onClose} />);

    return { setApiKey, setIsAuth, onClose };
  };

  it('renders dialog and labeled password field', () => {
    setup();
    // ダイアログとラベル付き入力が見える
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const input = screen.getByLabelText(
      'Qiita 個人用アクセストークン'
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('password');
    // helperTextの一部でもOK（全部一致でも可）
    expect(
      screen.getByText(/アクセストークンを取得できます/i)
    ).toBeInTheDocument();
  });

  it('shows error when applying with empty input', async () => {
    const user = userEvent.setup();
    const { setApiKey, setIsAuth, onClose } = setup({ initialApiKey: '' });

    // 「適用」をクリック
    await user.click(screen.getByRole('button', { name: '適用' }));

    // エラー表示
    expect(screen.getByText('APIキーを入力してください')).toBeInTheDocument();
    // 何も更新されない
    expect(setApiKey).not.toHaveBeenCalled();
    expect(setIsAuth).not.toHaveBeenCalled();
    expect(mockSetApiToken).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('saves api key and closes when valid input provided', async () => {
    const user = userEvent.setup();
    const { setApiKey, setIsAuth, onClose } = setup({ initialApiKey: '' });

    const input = screen.getByLabelText(
      'Qiita 個人用アクセストークン'
    ) as HTMLInputElement;
    await user.type(input, 'my-secret-token');

    await user.click(screen.getByRole('button', { name: '適用' }));

    expect(setApiKey).toHaveBeenCalledWith('my-secret-token');
    expect(mockSetApiToken).toHaveBeenCalledWith('my-secret-token');
    expect(setIsAuth).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
    // エラーは消えている（表示されていない）
    expect(screen.queryByText('APIキーを入力してください')).toBeNull();
  });

  it('clicking Cancel just calls onClose', async () => {
    const user = userEvent.setup();
    const { setApiKey, setIsAuth, onClose } = setup({ initialApiKey: 'x' });

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onClose).toHaveBeenCalled();
    expect(setApiKey).not.toHaveBeenCalled();
    expect(mockSetApiToken).not.toHaveBeenCalled();
    expect(setIsAuth).not.toHaveBeenCalled();
  });
});
