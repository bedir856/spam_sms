import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useMessages } from '@/providers/MessagesProvider';
import { MessageCard } from '@/components/MessageCard';
import { Message } from '@/types/message';
import { ShieldBan, Filter } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { getCategoryLabel } from '@/utils/spamDetector';

type FilterType = 'all' | 'betting' | 'casino' | 'lottery' | 'phishing';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'betting', label: 'Bahis' },
  { key: 'casino', label: 'Casino' },
  { key: 'lottery', label: 'Piyango' },
  { key: 'phishing', label: 'Oltalama' },
];

export default function SpamScreen() {
  const { spamMessages } = useMessages();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredMessages = React.useMemo(() => {
    if (activeFilter === 'all') return spamMessages;
    return spamMessages.filter(m => m.category === activeFilter);
  }, [spamMessages, activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageCard message={item} showSpamBadge />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const ListHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.dangerBadge}>
          <ShieldBan size={16} color={Colors.danger} />
          <Text style={styles.dangerText}>{spamMessages.length} engellendi</Text>
        </View>
        <Filter size={16} color={Colors.textMuted} />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [spamMessages.length, activeFilter]);

  const ListEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <ShieldBan size={48} color={Colors.safe} />
      </View>
      <Text style={styles.emptyTitle}>Spam yok!</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'all'
          ? 'Engellenen mesaj bulunmuyor'
          : `${getCategoryLabel(activeFilter)} kategorisinde mesaj yok`}
      </Text>
    </View>
  ), [activeFilter]);

  return (
    <View style={styles.container} testID="spam-screen">
      <FlatList
        data={filteredMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dangerText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600' as const,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  filterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  filterTextActive: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.safeSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
