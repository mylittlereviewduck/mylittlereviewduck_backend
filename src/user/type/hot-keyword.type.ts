export type HotKeyword = {
  rank: number;
  keyword: string;
  status: HotKeywordType;
};

export type HotKeywordType = 'up' | 'down' | 'equal';
