import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';

const meta = {
  title: 'Atoms/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'テキストフィールドのラベル',
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    helperText: {
      control: 'text',
      description: 'ヘルパーテキスト（説明やエラーメッセージ）',
    },
    type: {
      control: 'select',
      options: ['text', 'date'],
      description: 'テキストフィールドのタイプ',
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'ユーザー名',
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: 'メールアドレス',
    placeholder: 'example@example.com',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'APIキー',
    helperText: '8文字以上の英数字を入力してください',
  },
};

export const DateType: Story = {
  args: {
    label: '日付',
    type: 'date',
    InputLabelProps: {
      shrink: true,
    },
  },
};


