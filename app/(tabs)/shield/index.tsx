import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { ShieldAlert, ShieldCheck, TrendingUp, Zap } from 'lucide-react-native';
import { useMessages } from '@/providers/MessagesProvider';
import { StatCard } from '@/components/StatCard';
import { BarChart } from '@/components/BarChart';
import { getCategoryLabel } from '@/utils/spamDetector';
import Colors from '@/constants/colors';

export default function ShieldScreen() {
  const { stats, protectionEnabled, spamMessages, inboxMessages } = useMessages();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (protectionEnabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [protectionEnabled, pulseAnim]);

  useEffect(() => {
    const total = spamMessages.length + inboxMessages.length;
    const rate = total > 0 ? spamMessages.length / total : 0;
    Animated.timing(progressAnim, {
      toValue: rate,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [spamMessages.length, inboxMessages.length, progressAnim]);

  const blockRate = spamMessages.length + inboxMessages.length > 0
    ? Math.round((spamMessages.length / (spamMessages.length + inboxMessages.length)) * 100)
    : 0;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="shield-screen">
      <View style={styles.heroSection}>
        <Animated.View
          style={[
            styles.shieldCircle,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: protectionEnabled ? Colors.safeSoft : Colors.dangerSoft,
            },
          ]}
        >
          <View style={[styles.shieldInner, {
            backgroundColor: protectionEnabled ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 71, 87, 0.15)',
          }]}>
            {protectionEnabled ? (
              <ShieldCheck size={48} color={Colors.safe} />
            ) : (
              <ShieldAlert size={48} color={Colors.danger} />
            )}
          </View>
        </Animated.View>

        <Text style={styles.heroTitle}>
          {protectionEnabled ? 'Koruma Aktif' : 'Koruma Pasif'}
        </Text>
        <Text style={styles.heroSubtitle}>
          {protectionEnabled
            ? 'Mesajlarınız yapay zeka ile taranıyor'
            : 'Spam koruması devre dışı'}
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionTitle}>Engelleme Oranı</Text>
          <Text style={[styles.percentText, { color: blockRate > 50 ? Colors.danger : Colors.safe }]}>
            %{blockRate}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: blockRate > 50 ? Colors.danger : blockRate > 30 ? Colors.warning : Colors.safe,
              },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {spamMessages.length + inboxMessages.length} mesajdan {spamMessages.length} tanesi engellendi
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard
          title="Engellenen"
          value={stats.totalBlocked}
          subtitle="toplam"
          icon={<ShieldAlert size={18} color={Colors.danger} />}
          color={Colors.danger}
          bgColor={Colors.dangerSoft}
        />
        <View style={{ width: 10 }} />
        <StatCard
          title="Güvenli"
          value={stats.totalSafe}
          subtitle="toplam"
          icon={<ShieldCheck size={18} color={Colors.safe} />}
          color={Colors.safe}
          bgColor={Colors.safeSoft}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={16} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Haftalık Aktivite</Text>
        </View>
        <View style={styles.chartCard}>
          <BarChart data={stats.weeklyData} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={16} color={Colors.warning} />
          <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
        </View>
        {stats.topCategories.map(cat => (
          <View key={cat.category} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, {
                backgroundColor: cat.category === 'betting' ? Colors.danger
                  : cat.category === 'casino' ? Colors.warning
                  : cat.category === 'phishing' ? '#E056A0'
                  : Colors.accent,
              }]} />
              <Text style={styles.categoryName}>{getCategoryLabel(cat.category)}</Text>
            </View>
            <View style={styles.categoryCount}>
              <Text style={styles.categoryCountText}>{cat.count}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  shieldCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  shieldInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressSection: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  percentText: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  categoryCount: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
});
