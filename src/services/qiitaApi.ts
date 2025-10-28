import axios from 'axios';
import { QiitaItem, QiitaApiResponse } from '@/types/qiita';

const BASE_URL = 'https://qiita.com/api/v2';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// APIキーを設定する関数
export const setApiToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const qiitaApi = {
  // 記事一覧取得
  getItems: async (page = 1, perPage = 20, query = ''): Promise<QiitaApiResponse> => {
    const response = await api.get<QiitaItem[]>('/items', {
      params: {
        page,
        per_page: perPage,
        query: query || undefined,
      },
    });
    return {
      items: response.data,
      total_count: parseInt(response.headers['total-count'] || '100'),
      page,
      per_page: perPage,
    };
  },

  // 記事詳細取得
  getItem: async (itemId: string): Promise<QiitaItem> => {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  },

};

export default qiitaApi;
