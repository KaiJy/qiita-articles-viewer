import { render, screen } from '@testing-library/react';
import { TextField } from '@/components/atoms/TextField';
import userEvent from '@testing-library/user-event';

describe('TextField', () => {
  it('should render a text field with given label', () => {
    render(<TextField label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('should accept and display user input', async () => {
    const user = userEvent.setup();
    render(<TextField label="Email" />);
    const input = screen.getByLabelText('Email');

    await user.type(input, 'kaiji@example.com');

    expect(input).toHaveValue('kaiji@example.com');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TextField label="Disabled" disabled />);
    const input = screen.getByLabelText('Disabled');
    expect(input).toBeDisabled();
  });

  it('should apply custom props correctly (e.g. variant)', () => {
    render(<TextField label="Outlined" variant="outlined" />);
    const input = screen.getByLabelText('Outlined');
    expect(input.closest('.MuiTextField-root')).toHaveClass('MuiTextField-root');
  });
});
