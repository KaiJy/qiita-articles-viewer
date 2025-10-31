import { renderHook, act } from '@testing-library/react';
import {
  AppProvider,
  useAppContext,
  useApiKey,
  useIsAuthenticated,
  useCurrentPage,
  useItemsPerPage,
  useSearchQuery,
} from '@/stores/AppContext';

describe('AppContext', () => {
  describe('AppProvider and useAppContext', () => {
    it('provides initial state values', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      expect(result.current.apiKey).toBe('');
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.itemsPerPage).toBe(20);
      expect(result.current.searchQuery).toBe('');
    });

    it('provides setter functions', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      expect(typeof result.current.setApiKey).toBe('function');
      expect(typeof result.current.setIsAuthenticated).toBe('function');
      expect(typeof result.current.setCurrentPage).toBe('function');
      expect(typeof result.current.setItemsPerPage).toBe('function');
      expect(typeof result.current.setSearchQuery).toBe('function');
    });

    it('throws error when used outside of AppProvider', () => {
      // コンソールエラーを抑制
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAppContext());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleError.mockRestore();
    });

    it('updates apiKey correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.setApiKey('test-api-key-123');
      });

      expect(result.current.apiKey).toBe('test-api-key-123');
    });

    it('updates isAuthenticated correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.setIsAuthenticated(true);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.setIsAuthenticated(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('updates currentPage correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.setCurrentPage(5);
      });

      expect(result.current.currentPage).toBe(5);
    });

    it('updates itemsPerPage correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.setItemsPerPage(50);
      });

      expect(result.current.itemsPerPage).toBe(50);
    });

    it('updates searchQuery correctly', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.setSearchQuery('react hooks');
      });

      expect(result.current.searchQuery).toBe('react hooks');
    });

    it('updates multiple states independently', () => {
      const { result } = renderHook(() => useAppContext(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current.setApiKey('my-token');
        result.current.setIsAuthenticated(true);
        result.current.setCurrentPage(3);
      });

      expect(result.current.apiKey).toBe('my-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.currentPage).toBe(3);
      expect(result.current.itemsPerPage).toBe(20); // 初期値のまま
      expect(result.current.searchQuery).toBe(''); // 初期値のまま
    });
  });

  describe('useApiKey', () => {
    it('returns apiKey and setter as tuple', () => {
      const { result } = renderHook(() => useApiKey(), {
        wrapper: AppProvider,
      });

      expect(result.current[0]).toBe('');
      expect(typeof result.current[1]).toBe('function');
    });

    it('updates apiKey through setter', () => {
      const { result } = renderHook(() => useApiKey(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current[1]('new-api-key');
      });

      expect(result.current[0]).toBe('new-api-key');
    });

    it('throws error when used outside of AppProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useApiKey());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleError.mockRestore();
    });
  });

  describe('useIsAuthenticated', () => {
    it('returns isAuthenticated and setter as tuple', () => {
      const { result } = renderHook(() => useIsAuthenticated(), {
        wrapper: AppProvider,
      });

      expect(result.current[0]).toBe(false);
      expect(typeof result.current[1]).toBe('function');
    });

    it('updates isAuthenticated through setter', () => {
      const { result } = renderHook(() => useIsAuthenticated(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current[1](true);
      });

      expect(result.current[0]).toBe(true);
    });

    it('throws error when used outside of AppProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useIsAuthenticated());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleError.mockRestore();
    });
  });

  describe('useCurrentPage', () => {
    it('returns currentPage and setter as tuple', () => {
      const { result } = renderHook(() => useCurrentPage(), {
        wrapper: AppProvider,
      });

      expect(result.current[0]).toBe(1);
      expect(typeof result.current[1]).toBe('function');
    });

    it('updates currentPage through setter', () => {
      const { result } = renderHook(() => useCurrentPage(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current[1](10);
      });

      expect(result.current[0]).toBe(10);
    });

    it('throws error when used outside of AppProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useCurrentPage());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleError.mockRestore();
    });
  });

  describe('useItemsPerPage', () => {
    it('returns itemsPerPage and setter as tuple', () => {
      const { result } = renderHook(() => useItemsPerPage(), {
        wrapper: AppProvider,
      });

      expect(result.current[0]).toBe(20);
      expect(typeof result.current[1]).toBe('function');
    });

    it('updates itemsPerPage through setter', () => {
      const { result } = renderHook(() => useItemsPerPage(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current[1](100);
      });

      expect(result.current[0]).toBe(100);
    });

    it('throws error when used outside of AppProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useItemsPerPage());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleError.mockRestore();
    });
  });

  describe('useSearchQuery', () => {
    it('returns searchQuery and setter as tuple', () => {
      const { result } = renderHook(() => useSearchQuery(), {
        wrapper: AppProvider,
      });

      expect(result.current[0]).toBe('');
      expect(typeof result.current[1]).toBe('function');
    });

    it('updates searchQuery through setter', () => {
      const { result } = renderHook(() => useSearchQuery(), {
        wrapper: AppProvider,
      });

      act(() => {
        result.current[1]('typescript');
      });

      expect(result.current[0]).toBe('typescript');
    });

    it('throws error when used outside of AppProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSearchQuery());
      }).toThrow('useAppContext must be used within an AppProvider');

      consoleError.mockRestore();
    });
  });

  describe('integration', () => {
    it('all individual hooks share the same state', () => {
      const { result: apiKeyResult } = renderHook(() => useApiKey(), {
        wrapper: AppProvider,
      });
      const { result: isAuthResult } = renderHook(() => useIsAuthenticated(), {
        wrapper: AppProvider,
      });

      // 別のwrapperインスタンスなので、状態は共有されない
      // 同じProviderインスタンス内で共有されることを確認するには、
      // 複数のhooksを同時に使う必要がある
      const { result: allHooks } = renderHook(
        () => ({
          apiKey: useApiKey(),
          isAuth: useIsAuthenticated(),
          page: useCurrentPage(),
          perPage: useItemsPerPage(),
          query: useSearchQuery(),
        }),
        { wrapper: AppProvider }
      );

      // apiKeyを更新
      act(() => {
        allHooks.current.apiKey[1]('shared-token');
      });

      expect(allHooks.current.apiKey[0]).toBe('shared-token');

      // isAuthenticatedを更新
      act(() => {
        allHooks.current.isAuth[1](true);
      });

      expect(allHooks.current.isAuth[0]).toBe(true);

      // 他の値は初期値のまま
      expect(allHooks.current.page[0]).toBe(1);
      expect(allHooks.current.perPage[0]).toBe(20);
      expect(allHooks.current.query[0]).toBe('');
    });
  });
});

