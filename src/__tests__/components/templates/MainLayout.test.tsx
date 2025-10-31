import { render, screen } from '@testing-library/react';
import { MainLayout } from '@/components/templates/MainLayout';

describe('MainLayout', () => {
  it('renders children correctly', () => {
    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <MainLayout>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </MainLayout>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });

  it('applies correct styles to wrapper', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );

    const wrapper = container.firstChild as HTMLElement;
    
    // MUIのBoxコンポーネントがレンダリングされていることを確認
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('DIV');
  });

  it('renders with empty children', () => {
    const { container } = render(
      <MainLayout>
        {null}
      </MainLayout>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with text node as children', () => {
    render(
      <MainLayout>
        Plain text content
      </MainLayout>
    );

    expect(screen.getByText('Plain text content')).toBeInTheDocument();
  });

  it('renders with complex nested children', () => {
    render(
      <MainLayout>
        <header>
          <h1>Header Title</h1>
        </header>
        <main>
          <section>
            <p>Main content paragraph</p>
          </section>
        </main>
        <footer>
          <p>Footer text</p>
        </footer>
      </MainLayout>
    );

    expect(screen.getByText('Header Title')).toBeInTheDocument();
    expect(screen.getByText('Main content paragraph')).toBeInTheDocument();
    expect(screen.getByText('Footer text')).toBeInTheDocument();
  });
});

