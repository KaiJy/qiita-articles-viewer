import React, { useCallback, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Alert,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Search as SearchIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentPage, useSearchQuery, useItemsPerPage } from '@/stores/AppContext';
import { useQiitaItems } from '@/hooks/useQiitaApi';
import { Button } from '@/components/atoms/Button';
import { TextField } from '@/components/atoms/TextField';
import { LoadingSpinner } from '@/components/molecules/LoadingSpinner';
import { ApiKeyForm } from '@/components/molecules/ApiKeyForm';
import { formatRelativeTime } from '@/utils/dateUtils';
import { QiitaTag } from '@/types/qiita';
import axios from 'axios';

export const ItemList: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useCurrentPage();
  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [itemsPerPage, setItemsPerPage] = useItemsPerPage();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [userName, setUserName] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [apiKeyFormOpen, setApiKeyFormOpen] = useState(false);
  const { data, isLoading, error, refetch } = useQiitaItems();

  const handleSearch = useCallback(() => {
    // 検索クエリを構築
    const queryParts: string[] = [];
    
    // キーワード検索
    if (inputValue.trim()) {
      queryParts.push(inputValue.trim());
    }
    
    // ユーザー名で絞り込み
    if (userName.trim()) {
      queryParts.push(`user:${userName.trim()}`);
    }
    
    // 作成日時（以降）で絞り込み
    if (createdFrom) {
      queryParts.push(`created:>=${createdFrom}`);
    }
    
    // 作成日時（以前）で絞り込み
    if (createdTo) {
      queryParts.push(`created:<=${createdTo}`);
    }
    
    const query = queryParts.join(' ');
    setSearchQuery(query);
    setPage(1);
  }, [inputValue, userName, createdFrom, createdTo, setSearchQuery, setPage]);

  const handleRowClick = useCallback((params: GridRowParams) => {
    router.push(`/${params.id}`);
  }, [router]);

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'タイトル',
      flex: 2,
      minWidth: 300,
    },
    {
      field: 'user',
      headerName: 'ユーザー',
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => {
            const id = row.user?.id ?? '';
            const name = row.user?.name;
            return name ? `@${id} (${name})` : `@${id}`;
        }
    },
    {
      field: 'tags',
      headerName: 'タグ',
      flex: 1,
      minWidth: 200,
      valueGetter: (value, row) => row.tags?.map((tag: QiitaTag) => tag.name).join(', ') || '',
    },
    {
      field: 'likes_count',
      headerName: 'いいね',
      width: 100,
      type: 'number',
    },
    {
      field: 'created_at',
      headerName: '投稿日時',
      flex: 1,
      minWidth: 150,
      valueFormatter: (value) => formatRelativeTime(value),
      sortComparator: (v1, v2) => {
        // 日付文字列を直接比較（新しい順がデフォルト）
        return new Date(v1).getTime() - new Date(v2).getTime();
      },
    },
  ];

  if (isLoading) {
    return <LoadingSpinner message="記事を読み込み中..." />;
  }

  if (error) {
    let errorMessage = '記事の読み込みに失敗しました';
    let statusCode: number | undefined;

    if (axios.isAxiosError(error)) {
      statusCode = error.response?.status;
    }

    return (
      <>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {errorMessage}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                考えられる原因：
              </Typography>
              <Typography variant="body2" component="div">
                • APIキーが間違っている、または設定されていない可能性があります
              </Typography>
              <Typography variant="body2" component="div">
                • Qiita APIのリクエスト上限に達した可能性があります
              </Typography>
              {statusCode && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  (ステータスコード: {statusCode})
                </Typography>
              )}
            </Box>
          </Alert>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={() => refetch()}
              intent="primary"
            >
              再試行
            </Button>
            <Button
              onClick={() => setApiKeyFormOpen(true)}
              intent="secondary"
              startIcon={<SettingsIcon />}
            >
              APIキー設定
            </Button>
          </Box>
        </Box>
        <ApiKeyForm open={apiKeyFormOpen} onClose={() => setApiKeyFormOpen(false)} />
      </>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Qiita Articles Viewer
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          検索フォーム
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* キーワード検索 */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            <TextField
              fullWidth
              label="キーワード"
              placeholder="検索キーワードを入力"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              size="small"
            />
          </Box>

          {/* 詳細検索条件 */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="ユーザー名"
              placeholder="例: qiita"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              size="small"
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              label="作成日（以降）"
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            
            <TextField
              label="作成日（以前）"
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                intent="primary"
                onClick={handleSearch}
                startIcon={<SearchIcon />}
                size="medium"
              >
                検索
              </Button>
              
              <Button
                intent="secondary"
                onClick={() => {
                  setInputValue('');
                  setUserName('');
                  setCreatedFrom('');
                  setCreatedTo('');
                  setSearchQuery('');
                  setPage(1);
                }}
                size="medium"
              >
                クリア
              </Button>
              
              <IconButton
                onClick={() => setApiKeyFormOpen(true)}
                color="default"
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.400',
                  borderRadius: 1,
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ height: 'calc(100vh - 340px)', width: '100%' }}>
        <DataGrid
          rows={data?.items || []}
          columns={columns}
          pageSizeOptions={[20, 50, 100]}
          paginationMode="server"
          rowCount={data?.total_count || 0}
          paginationModel={{
            page: page - 1,
            pageSize: itemsPerPage,
          }}
          onPaginationModelChange={(model) => {
            setPage(model.page + 1);
            setItemsPerPage(model.pageSize);
          }}
          onRowClick={handleRowClick}
          loading={isLoading}
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
        />
      </Paper>

      <ApiKeyForm open={apiKeyFormOpen} onClose={() => setApiKeyFormOpen(false)} />
    </Box>
  );
};