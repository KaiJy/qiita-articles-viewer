import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '@/components/molecules/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="カスタムメッセージ" />);
    expect(screen.getByText('カスタムメッセージ')).toBeInTheDocument();
  });
});
