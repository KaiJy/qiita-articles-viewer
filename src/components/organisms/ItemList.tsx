import React, { useCallback, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Alert,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { Search as SearchIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCurrentPage, useSearchQuery, useItemsPerPage } from '@/stores/AppContext';
import { useQiitaItems } from '@/hooks/useQiitaApi';
import { LoadingSpinner } from '@/components/molecules/LoadingSpinner';
import { ApiKeyForm } from '@/components/molecules/ApiKeyForm';
import { formatRelativeTime } from '@/utils/dateUtils';
import { QiitaTag } from '@/types/qiita';

export const ItemList: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useCurrentPage();
  const [searchQuery, setSearchQuery] = useSearchQuery();
  const [itemsPerPage, setItemsPerPage] = useItemsPerPage();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [apiKeyFormOpen, setApiKeyFormOpen] = useState(false);
  const { data, isLoading, error, refetch } = useQiitaItems();

  const handleSearch = useCallback(() => {
    setSearchQuery(inputValue);
    setPage(1);
  }, [inputValue, setSearchQuery, setPage]);

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
      valueGetter: (value) => formatRelativeTime(value),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner message="記事を読み込み中..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          記事の読み込みに失敗しました
        </Alert>
        <Button onClick={() => refetch()} variant="contained">
          再試行
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Qiita Articles Viewer
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              検索フォーム
            </Typography>
            <TextField
              fullWidth
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

          <IconButton
            onClick={handleSearch}
            color="primary"
            sx={{
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
            }}
          >
            <SearchIcon />
          </IconButton>

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

      </Paper>

      <Paper sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
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