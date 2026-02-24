export interface Message {
  id: string;
  sender: string;
  senderNumber: string;
  content: string;
  timestamp: string;
  isSpam: boolean;
  spamScore: number;
  spamReasons: string[];
  isRead: boolean;
  category: 'betting' | 'casino' | 'lottery' | 'phishing' | 'safe';
}

export interface SpamKeyword {
  id: string;
  keyword: string;
  category: string;
  isActive: boolean;
}

export interface FilterStats {
  totalBlocked: number;
  totalSafe: number;
  blockedToday: number;
  topCategories: { category: string; count: number }[];
  weeklyData: { day: string; blocked: number }[];
}
