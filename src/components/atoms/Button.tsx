import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material';
import { useTheme, SxProps, Theme } from '@mui/material/styles';

type Intent = 'primary' | 'secondary' | 'error';

interface BaseButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
  intent?: Intent;
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ButtonProps = BaseButtonProps & Record<string, any>;

export const Button: React.FC<ButtonProps> = ({
  children,
  intent = 'primary',
  sx: propsSx,
  ...props
}) => {
  const theme = useTheme();

  // intentごとの基本スタイル（theme.paletteに準拠）
  const styleMap: Record<
    Intent,
    { muiVariant: 'contained' | 'outlined' | 'text'; sx: SxProps<Theme> }
  > = {
    primary: {
      muiVariant: 'contained',
      sx: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    },
    secondary: {
      muiVariant: 'outlined',
      sx: {
        border: `1px solid ${theme.palette.secondary.dark}`,
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.secondary.dark,
        },
      },
    },
    error: {
      muiVariant: 'contained',
      sx: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
        '&:hover': {
          backgroundColor: theme.palette.error.dark,
        },
      },
    },
  };

  const { muiVariant, sx } = styleMap[intent];

  // intentベースのスタイルと共通スタイルをマージ
  const baseSx: SxProps<Theme> = {
    ...sx,
    borderRadius: 4,
    textTransform: 'none',
    ...(theme.typography.fontFamily && {
      fontFamily: theme.typography.fontFamily,
    }),
  };

  // propsから渡されたsxとマージ（propsのsxが優先される）
  const mergedSx = (propsSx ? [baseSx, propsSx] : baseSx) as SxProps<Theme>;

  return (
    <MuiButton variant={muiVariant} sx={mergedSx} {...props}>
      {children}
    </MuiButton>
  );
};
