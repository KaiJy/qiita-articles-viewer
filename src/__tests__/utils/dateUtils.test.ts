import { formatDate, formatRelativeTime } from '@/utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats date string in Japanese format', () => {
      const dateString = '2023-05-15T10:30:00Z';
      const result = formatDate(dateString);
      
      // 日本語ロケールでフォーマットされた日付文字列が返される
      expect(result).toMatch(/2023年/);
      expect(result).toMatch(/5月/);
      expect(result).toMatch(/15日/);
    });

    it('includes time in the formatted string', () => {
      const dateString = '2023-05-15T10:30:00Z';
      const result = formatDate(dateString);
      
      // 時刻情報も含まれている（タイムゾーンによって異なる可能性がある）
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('handles different date formats', () => {
      const dateString1 = '2023-01-01T12:00:00Z';
      const dateString2 = '2023-12-31T12:00:00Z';
      
      const result1 = formatDate(dateString1);
      const result2 = formatDate(dateString2);
      
      expect(result1).toMatch(/2023年/);
      expect(result1).toMatch(/1月/);
      
      expect(result2).toMatch(/2023年/);
      expect(result2).toMatch(/12月/);
    });

    it('handles ISO date strings', () => {
      const dateString = '2024-03-20T06:00:00.000Z';
      const result = formatDate(dateString);
      
      expect(result).toMatch(/2024年/);
      expect(result).toMatch(/3月/);
      // タイムゾーンによって日付が変わる可能性があるため、年月のみチェック
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // 現在時刻を固定: 2023-06-15 12:00:00
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-06-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns "たった今" for time less than 60 seconds ago', () => {
      const dateString = '2023-06-15T11:59:30Z'; // 30秒前
      const result = formatRelativeTime(dateString);
      
      expect(result).toBe('たった今');
    });

    it('returns "たった今" for time exactly 59 seconds ago', () => {
      const dateString = '2023-06-15T11:59:01Z'; // 59秒前
      const result = formatRelativeTime(dateString);
      
      expect(result).toBe('たった今');
    });

    it('returns "X分前" for time less than 60 minutes ago', () => {
      const dateString1 = '2023-06-15T11:59:00Z'; // 1分前
      const dateString2 = '2023-06-15T11:30:00Z'; // 30分前
      const dateString3 = '2023-06-15T11:01:00Z'; // 59分前
      
      expect(formatRelativeTime(dateString1)).toBe('1分前');
      expect(formatRelativeTime(dateString2)).toBe('30分前');
      expect(formatRelativeTime(dateString3)).toBe('59分前');
    });

    it('returns "X時間前" for time less than 24 hours ago', () => {
      const dateString1 = '2023-06-15T11:00:00Z'; // 1時間前
      const dateString2 = '2023-06-15T06:00:00Z'; // 6時間前
      const dateString3 = '2023-06-14T13:00:00Z'; // 23時間前
      
      expect(formatRelativeTime(dateString1)).toBe('1時間前');
      expect(formatRelativeTime(dateString2)).toBe('6時間前');
      expect(formatRelativeTime(dateString3)).toBe('23時間前');
    });

    it('returns "X日前" for time less than 30 days ago', () => {
      const dateString1 = '2023-06-14T12:00:00Z'; // 1日前
      const dateString2 = '2023-06-08T12:00:00Z'; // 7日前
      const dateString3 = '2023-05-17T12:00:00Z'; // 29日前
      
      expect(formatRelativeTime(dateString1)).toBe('1日前');
      expect(formatRelativeTime(dateString2)).toBe('7日前');
      expect(formatRelativeTime(dateString3)).toBe('29日前');
    });

    it('returns formatted date for time more than 30 days ago', () => {
      const dateString = '2023-05-01T10:30:00Z'; // 30日以上前
      const result = formatRelativeTime(dateString);
      
      // formatDateの結果が返される
      expect(result).toMatch(/2023年/);
      expect(result).toMatch(/5月/);
      expect(result).toMatch(/1日/);
    });

    it('handles edge case at exactly 60 seconds', () => {
      const dateString = '2023-06-15T11:59:00Z'; // ちょうど60秒前
      const result = formatRelativeTime(dateString);
      
      expect(result).toBe('1分前');
    });

    it('handles edge case at exactly 1 hour', () => {
      const dateString = '2023-06-15T11:00:00Z'; // ちょうど1時間前
      const result = formatRelativeTime(dateString);
      
      expect(result).toBe('1時間前');
    });

    it('handles edge case at exactly 24 hours', () => {
      const dateString = '2023-06-14T12:00:00Z'; // ちょうど24時間前
      const result = formatRelativeTime(dateString);
      
      expect(result).toBe('1日前');
    });

    it('handles edge case at 29 days (just under 30 days)', () => {
      const dateString = '2023-05-17T12:00:01Z'; // 29日前より少し前
      const result = formatRelativeTime(dateString);
      
      // 30日未満なので「○日前」と表示される
      expect(result).toMatch(/日前/);
    });

    it('handles edge case at exactly 30 days', () => {
      const dateString = '2023-05-16T12:00:00Z'; // ちょうど30日前
      const result = formatRelativeTime(dateString);
      
      // 2592000秒 = 30日なので、30日以上経過している場合はformatDateが呼ばれる
      expect(result).toMatch(/2023年/);
      expect(result).toMatch(/5月/);
    });

    it('handles very old dates', () => {
      const dateString = '2020-01-01T00:00:00Z'; // 数年前
      const result = formatRelativeTime(dateString);
      
      // 30日以上前なので、formatDateの結果が返される
      expect(result).toMatch(/2020年/);
      expect(result).toMatch(/1月/);
    });

    it('handles future dates correctly', () => {
      const dateString = '2023-06-15T13:00:00Z'; // 1時間後
      const result = formatRelativeTime(dateString);
      
      // 負の差分の場合、「たった今」が返される（diffInSeconds < 60の条件に該当）
      expect(result).toBe('たった今');
    });
  });

  describe('integration', () => {
    it('formatRelativeTime uses formatDate for old dates', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-06-15T12:00:00Z'));

      const oldDate = '2023-01-01T10:30:00Z';
      const relativeResult = formatRelativeTime(oldDate);
      const directResult = formatDate(oldDate);

      // 30日以上前の日付の場合、formatRelativeTimeとformatDateの結果が同じになる
      expect(relativeResult).toBe(directResult);

      jest.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('handles invalid date strings in formatDate', () => {
      const invalidDate = 'invalid-date-string';
      const result = formatDate(invalidDate);
      
      // 無効な日付でもエラーにならず、何らかの文字列が返される
      expect(typeof result).toBe('string');
    });

    it('handles invalid date strings in formatRelativeTime', () => {
      const invalidDate = 'invalid-date-string';
      const result = formatRelativeTime(invalidDate);
      
      // 無効な日付でもエラーにならず、何らかの文字列が返される
      expect(typeof result).toBe('string');
    });
  });
});

