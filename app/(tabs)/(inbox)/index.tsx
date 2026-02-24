import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useMessages } from '@/providers/MessagesProvider';
import { MessageCard } from '@/components/MessageCard';
import { Message } from '@/types/message';
import { ShieldCheck, Inbox } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function InboxScreen() {
  const { inboxMessages, protectionEnabled, isLoading } = useMessages();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageCard message={item} />
  ), []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const ListHeader = useCallback(() => (
    <View style={styles.header}>
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, { backgroundColor: protectionEnabled ? Colors.safe : Colors.textMuted }]} />
        <Text style={styles.statusText}>
          {protectionEnabled ? 'Koruma aktif' : 'Koruma pasif'}
        </Text>
        <ShieldCheck size={14} color={protectionEnabled ? Colors.safe : Colors.textMuted} />
      </View>
      <Text style={styles.countText}>{inboxMessages.length} güvenli mesaj</Text>
    </View>
  ), [protectionEnabled, inboxMessages.length]);

  const ListEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Inbox size={48} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>Gelen kutusu boş</Text>
      <Text style={styles.emptySubtitle}>Güvenli mesajlarınız burada görünecek</Text>
    </View>
  ), []);

  return (
    <View style={styles.container} testID="inbox-screen">
      <FlatList
        data={inboxMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
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
    paddingBottom: 16,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  countText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
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
    backgroundColor: Colors.surfaceLight,
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
