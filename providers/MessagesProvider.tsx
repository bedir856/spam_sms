import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Message, SpamKeyword } from '@/types/message';
import { mockMessages, defaultKeywords } from '@/mocks/messages';
import { analyzeMessage } from '@/utils/spamDetector';

const MESSAGES_KEY = 'spam_guard_messages';
const KEYWORDS_KEY = 'spam_guard_keywords';
const PROTECTION_KEY = 'spam_guard_protection';

export const [MessagesProvider, useMessages] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [keywords, setKeywords] = useState<SpamKeyword[]>(defaultKeywords);
  const [protectionEnabled, setProtectionEnabled] = useState<boolean>(true);

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(MESSAGES_KEY);
      return stored ? JSON.parse(stored) as Message[] : mockMessages;
    },
  });

  const keywordsQuery = useQuery({
    queryKey: ['keywords'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(KEYWORDS_KEY);
      return stored ? JSON.parse(stored) as SpamKeyword[] : defaultKeywords;
    },
  });

  const protectionQuery = useQuery({
    queryKey: ['protection'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PROTECTION_KEY);
      return stored ? JSON.parse(stored) as boolean : true;
    },
  });

  useEffect(() => {
    if (messagesQuery.data) setMessages(messagesQuery.data);
  }, [messagesQuery.data]);

  useEffect(() => {
    if (keywordsQuery.data) setKeywords(keywordsQuery.data);
  }, [keywordsQuery.data]);

  useEffect(() => {
    if (protectionQuery.data !== undefined) setProtectionEnabled(protectionQuery.data);
  }, [protectionQuery.data]);

  const syncMessages = useMutation({
    mutationFn: async (updated: Message[]) => {
      await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
      return updated;
    },
  });

  const syncKeywords = useMutation({
    mutationFn: async (updated: SpamKeyword[]) => {
      await AsyncStorage.setItem(KEYWORDS_KEY, JSON.stringify(updated));
      return updated;
    },
  });

  const toggleProtection = useCallback(() => {
    const next = !protectionEnabled;
    setProtectionEnabled(next);
    AsyncStorage.setItem(PROTECTION_KEY, JSON.stringify(next));
    queryClient.invalidateQueries({ queryKey: ['protection'] });
  }, [protectionEnabled, queryClient]);

  const markAsSpam = useCallback((id: string) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, isSpam: true, spamScore: 100, spamReasons: ['Manuel olarak spam işaretlendi'] } : m
    );
    setMessages(updated);
    syncMessages.mutate(updated);
  }, [messages, syncMessages]);

  const markAsSafe = useCallback((id: string) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, isSpam: false, spamScore: 0, spamReasons: [], category: 'safe' as const } : m
    );
    setMessages(updated);
    syncMessages.mutate(updated);
  }, [messages, syncMessages]);

  const markAsRead = useCallback((id: string) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, isRead: true } : m
    );
    setMessages(updated);
    syncMessages.mutate(updated);
  }, [messages, syncMessages]);

  const deleteMessage = useCallback((id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    syncMessages.mutate(updated);
  }, [messages, syncMessages]);

  const addKeyword = useCallback((keyword: string, category: string) => {
    const newKw: SpamKeyword = {
      id: Date.now().toString(),
      keyword,
      category,
      isActive: true,
    };
    const updated = [...keywords, newKw];
    setKeywords(updated);
    syncKeywords.mutate(updated);

    const reanalyzed = messages.map(m => {
      const analysis = analyzeMessage(m.content, updated);
      return { ...m, isSpam: analysis.isSpam, spamScore: analysis.score, spamReasons: analysis.reasons, category: analysis.category };
    });
    setMessages(reanalyzed);
    syncMessages.mutate(reanalyzed);
  }, [keywords, messages, syncKeywords, syncMessages]);

  const toggleKeyword = useCallback((id: string) => {
    const updated = keywords.map(k =>
      k.id === id ? { ...k, isActive: !k.isActive } : k
    );
    setKeywords(updated);
    syncKeywords.mutate(updated);
  }, [keywords, syncKeywords]);

  const removeKeyword = useCallback((id: string) => {
    const updated = keywords.filter(k => k.id !== id);
    setKeywords(updated);
    syncKeywords.mutate(updated);
  }, [keywords, syncKeywords]);

  const inboxMessages = useMemo(() =>
    messages.filter(m => !m.isSpam).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [messages]
  );

  const spamMessages = useMemo(() =>
    messages.filter(m => m.isSpam).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [messages]
  );

  const stats = useMemo(() => {
    const totalBlocked = messages.filter(m => m.isSpam).length;
    const totalSafe = messages.filter(m => !m.isSpam).length;
    const today = new Date().toDateString();
    const blockedToday = messages.filter(m => m.isSpam && new Date(m.timestamp).toDateString() === today).length;

    const categoryMap: Record<string, number> = {};
    messages.filter(m => m.isSpam).forEach(m => {
      categoryMap[m.category] = (categoryMap[m.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const weeklyData = days.map(day => ({ day, blocked: Math.floor(Math.random() * 8) + 1 }));

    return { totalBlocked, totalSafe, blockedToday, topCategories, weeklyData };
  }, [messages]);

  const getMessageById = useCallback((id: string) => {
    return messages.find(m => m.id === id);
  }, [messages]);

  return {
    messages,
    inboxMessages,
    spamMessages,
    keywords,
    stats,
    protectionEnabled,
    isLoading: messagesQuery.isLoading,
    markAsSpam,
    markAsSafe,
    markAsRead,
    deleteMessage,
    addKeyword,
    toggleKeyword,
    removeKeyword,
    toggleProtection,
    getMessageById,
  };
});
