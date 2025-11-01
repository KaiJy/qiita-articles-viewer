import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Alert,
} from '@mui/material';
import { useApiKey, useIsAuthenticated } from '@/stores/AppContext';
import { Button } from '@/components/atoms/Button';
import { TextField } from '@/components/atoms/TextField';
import { setApiToken } from '@/services/qiitaApi';

interface ApiKeyFormProps {
  open: boolean;
  onClose: () => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useApiKey();
  const [, setIsAuthenticated] = useIsAuthenticated();
  const [inputValue, setInputValue] = useState(apiKey);
  const [error, setError] = useState('');

  const handleSave = useCallback(() => {
    if (!inputValue.trim()) {
      setError('APIキーを入力してください');
      return;
    }

    setApiKey(inputValue);
    setApiToken(inputValue);
    setIsAuthenticated(true);
    setError('');
    onClose();
  }, [inputValue, setApiKey, setIsAuthenticated, onClose]);

  const handleClear = useCallback(() => {
    setApiKey('');
    setApiToken('');
    setInputValue('');
    setIsAuthenticated(false);
    setError('');
  }, [setApiKey, setIsAuthenticated]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>APIキー入力フォーム</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Qiita 個人用アクセストークン"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            fullWidth
            type="password"
            placeholder="個人用アクセストークンを入力してください"
            helperText="Qiitaの [設定] > [アプリケーション] からアクセストークンを取得できます"
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} intent="secondary">
          キャンセル
        </Button>
        <Button onClick={handleSave} intent="primary">
          適用
        </Button>
      </DialogActions>
    </Dialog>
  );
};
