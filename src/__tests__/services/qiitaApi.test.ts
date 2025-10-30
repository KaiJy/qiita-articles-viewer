const mockCreate = jest.fn();
jest.mock('axios', () => ({
  __esModule: true,
  default: { create: mockCreate },
  create: mockCreate,
}));

import axios from 'axios';

describe('@/services/qiitaApi.ts', () => {
  let mockGet: jest.Mock;
  let mockApi: {
    get: jest.Mock;
    defaults: { headers: { common: Record<string, string> } };
  };

  let setApiToken: (token: string) => void;
  let qiitaApi: any;

  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    // axios.create() が返す偽物のAPIインスタンスを作る
    mockGet = jest.fn();
    mockApi = {
      get: mockGet,
      defaults: { headers: { common: {} } },
    };

    // axios.create が常に上の mockApi を返すよう設定
    (mockCreate as jest.Mock).mockReturnValue(mockApi);

    // ここで初めて被テストモジュールを import
    // → import 時に axios.create() が呼ばれるため、この順序が重要
    const mod = await import('@/services/qiitaApi');
    setApiToken = mod.setApiToken;
    qiitaApi = mod.qiitaApi;
  });

  // --- setApiToken関連 ---
  test('setApiToken: adds Authorization header when token is provided', () => {
    // トークンを設定したとき、Authorizationヘッダが付与されるか確認
    setApiToken('TEST_TOKEN');
    expect(mockApi.defaults.headers.common.Authorization).toBe('Bearer TEST_TOKEN');
  });

  test('setApiToken: removes Authorization header when token is empty or falsy', () => {
    // トークンを一度設定したあと、空文字で削除されるか確認
    setApiToken('X');
    expect(mockApi.defaults.headers.common.Authorization).toBe('Bearer X');

    setApiToken('');
    expect(mockApi.defaults.headers.common.Authorization).toBeUndefined();
  });

  // --- getItems関連 ---
  test('getItems: sends correct path and query, and converts total-count header to number', async () => {
    // 正しいパス・クエリが送信され、total-countが数値化されることを確認
    const sampleItems = [{ id: 'abc', title: 't', url: 'https://qiita.com/abc' }];
    mockGet.mockResolvedValueOnce({
      data: sampleItems,
      headers: { 'total-count': '123' },
    });

    const res = await qiitaApi.getItems(2, 50, 'tag:react');

    // GETパラメータが正しいか
    expect(mockGet).toHaveBeenCalledWith('/items', {
      params: { page: 2, per_page: 50, query: 'tag:react' },
    });

    // total-countが数値として返ってくるか
    expect(res).toEqual({
      items: sampleItems,
      total_count: 123,
      page: 2,
      per_page: 50,
    });
  });

  test('getItems: omits query param when empty string is passed', async () => {
    // queryが空文字のとき、params.queryがundefinedになることを確認
    mockGet.mockResolvedValueOnce({
      data: [],
      headers: { 'total-count': '0' },
    });

    await qiitaApi.getItems(1, 20, '');

    const [, calledConfig] = mockGet.mock.calls[0];
    expect(calledConfig.params.query).toBeUndefined();
  });

  test('getItems: uses default total_count=100 when total-count header is missing', async () => {
    // total-countヘッダが存在しない場合、デフォルト値100を返すことを確認
    mockGet.mockResolvedValueOnce({ data: [], headers: {} });
    const res = await qiitaApi.getItems(1, 20);
    expect(res.total_count).toBe(100);
  });

  // --- getItem関連 ---
  test('getItem: calls correct path and returns response data directly', async () => {
    // 正しいパスでGETされ、dataがそのまま返ることを確認
    const item = { id: 'zzz', title: 'Hello', url: 'https://qiita.com/zzz' };
    mockGet.mockResolvedValueOnce({ data: item });

    const res = await qiitaApi.getItem('zzz');

    expect(mockGet).toHaveBeenCalledWith('/items/zzz');
    expect(res).toEqual(item);
  });
});
