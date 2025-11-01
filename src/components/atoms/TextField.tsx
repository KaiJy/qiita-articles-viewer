// import React from 'react';
// import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

// type TextFieldProps = MuiTextFieldProps & {
//   label: string;
// };

// export const TextField: React.FC<TextFieldProps> = ({ label, ...props }) => {
//   return <MuiTextField label={label} {...props} />;
// };

import React from 'react';
import {
  TextField as MuiTextField,
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

type TextFieldProps = MuiTextFieldProps & {
  label: string;
};

/**
 * チーム共通仕様のTextField。
 * すべてのTextFieldがtheme.palette.primaryカラーを使うように統一。
 */
export const TextField: React.FC<TextFieldProps> = ({ label, ...props }) => {
  const theme = useTheme();

  return (
    <MuiTextField
      label={label}
      color="primary" // ← ここで常にthemeのprimary色を使用
      sx={{
        '& label.Mui-focused': {
          color: theme.palette.primary.main, // フォーカス時のラベル色
        },
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main, // フォーカス時の枠線色
          },
        },
      }}
      {...props}
    />
  );
};
