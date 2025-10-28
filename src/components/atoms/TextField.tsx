import React from 'react';
import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

type TextFieldProps = MuiTextFieldProps & {
  label: string;
};

export const TextField: React.FC<TextFieldProps> = ({ label, ...props }) => {
  return <MuiTextField label={label} {...props} />;
};
