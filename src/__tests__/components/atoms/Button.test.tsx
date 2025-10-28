import { render, screen } from '@testing-library/react';
import { Button } from '@/components/atoms/Button';


describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  it('should apply variant prop', () => {
    render(<Button variant="contained">Test Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('MuiButton-contained');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Test Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
