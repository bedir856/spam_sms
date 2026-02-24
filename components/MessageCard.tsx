import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { ShieldAlert, ShieldCheck, ChevronRight, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Message } from '@/types/message';
import Colors from '@/constants/colors';
import { getCategoryLabel } from '@/utils/spamDetector';

interface MessageCardProps {
  message: Message;
  showSpamBadge?: boolean;
}

function MessageCardInner({ message, showSpamBadge = false }: MessageCardProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    }
  }, []);

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/message/${message.id}` as never);
  }, [message.id, router]);

  const categoryColor = message.isSpam ? Colors.danger : Colors.safe;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, !message.isRead && styles.unread]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        testID={`message-card-${message.id}`}
      >
        <View style={[styles.avatar, { backgroundColor: message.isSpam ? Colors.dangerSoft : Colors.safeSoft }]}>
          {message.isSpam ? (
            <ShieldAlert size={20} color={Colors.danger} />
          ) : (
            <ShieldCheck size={20} color={Colors.safe} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.sender, !message.isRead && styles.senderUnread]} numberOfLines={1}>
              {message.sender}
            </Text>
            <View style={styles.timeRow}>
              <Clock size={11} color={Colors.textMuted} />
              <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
            </View>
          </View>

          <Text style={styles.preview} numberOfLines={2}>
            {message.content}
          </Text>

          {showSpamBadge && message.isSpam && (
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: Colors.dangerSoft }]}>
                <Text style={[styles.badgeText, { color: Colors.danger }]}>
                  {getCategoryLabel(message.category)}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: Colors.warningSoft }]}>
                <Text style={[styles.badgeText, { color: Colors.warning }]}>
                  %{message.spamScore}
                </Text>
              </View>
            </View>
          )}
        </View>

        <ChevronRight size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export const MessageCard = React.memo(MessageCardInner);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unread: {
    borderColor: Colors.surfaceHighlight,
    backgroundColor: Colors.surfaceLight,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  senderUnread: {
    fontWeight: '700' as const,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  preview: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
