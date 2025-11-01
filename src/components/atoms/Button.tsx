import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { useTheme, SxProps, Theme } from '@mui/material/styles';

type Intent = 'primary' | 'secondary';

interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
  intent?: Intent;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  intent = 'primary',
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
  };

  const { muiVariant, sx } = styleMap[intent];

  const mergedSx: SxProps<Theme> = {
    ...sx,
    borderRadius: 4,
    textTransform: 'none',
    fontFamily: theme.typography.fontFamily,
  };

  return (
    <MuiButton variant={muiVariant} sx={mergedSx} {...props}>
      {children}
    </MuiButton>
  );
};
