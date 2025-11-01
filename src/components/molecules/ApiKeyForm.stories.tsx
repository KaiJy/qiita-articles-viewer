import type { Meta, StoryObj } from '@storybook/react';
import { ApiKeyForm } from './ApiKeyForm';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';

const meta = {
  title: 'Molecules/ApiKeyForm',
  component: ApiKeyForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'ダイアログの開閉状態',
    },
  },
} satisfies Meta<typeof ApiKeyForm>;

export default meta;
type Story = StoryObj<typeof meta>;
// Canvas（個別ストーリー表示）でのみインタラクティブに動作
export const Interactive = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button intent="primary" onClick={() => setOpen(true)}>
          APIキーフォームを開く
        </Button>
        <ApiKeyForm open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '「APIキーフォームを開く」ボタンをクリックすると、フォームが開きます。',
      },
    },
  },
};
