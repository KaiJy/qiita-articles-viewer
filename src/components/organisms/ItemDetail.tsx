'use client';

import React, { useCallback } from 'react';
import {
  Box,
  Paper,
  Button,
  Alert,
  Typography,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useQiitaItem } from '@/hooks/useQiitaApi';
import { LoadingSpinner } from '@/components/molecules/LoadingSpinner';
import { formatDate } from '@/utils/dateUtils';

interface ItemDetailProps {
  itemId: string;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({ itemId }) => {
  const router = useRouter();
  const { data: item, isLoading, error } = useQiitaItem(itemId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return <LoadingSpinner message="記事の詳細を読み込み中..." />;
  }

  if (error || !item) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          記事の詳細を読み込めませんでした
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          戻る
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Qiita Articles Viewer
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          variant="outlined"
          size="small"
        >
          戻る
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            タイトル
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {item.title}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            投稿者
          </Typography>
          <Typography variant="body1">
            {item.user.name ? `@${item.user.id} (${item.user.name})` : `@${item.user.id}`}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            投稿日時
          </Typography>
          <Typography variant="body1">
            {formatDate(item.created_at)}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            更新日時
          </Typography>
          <Typography variant="body1">
            {formatDate(item.updated_at)}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            タグ
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {item.tags.map((tag) => (
              <Box
                key={tag.name}
                sx={{
                  px: 2,
                  py: 0.5,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  fontSize: '0.875rem',
                }}
              >
                {tag.name}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            統計情報
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="body2">
              👍 {item.likes_count} いいね
            </Typography>
            <Typography variant="body2">
              💬 {item.comments_count} コメント
            </Typography>
            <Typography variant="body2">
              📊 {item.stocks_count} ストック
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            記事内容（プレビュー）
          </Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              maxHeight: '400px',
              overflow: 'auto',
              bgcolor: '#fafafa',
            }}
            dangerouslySetInnerHTML={{ __html: item.rendered_body }}
          />
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            元記事を見る
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};