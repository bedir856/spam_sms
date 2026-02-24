import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  ShieldBan,
  ShieldPlus,
  Phone,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMessages } from '@/providers/MessagesProvider';
import { getCategoryLabel } from '@/utils/spamDetector';
import Colors from '@/constants/colors';

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getMessageById, markAsSpam, markAsSafe, markAsRead, deleteMessage } = useMessages();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const message = getMessageById(id ?? '');

  useEffect(() => {
    if (message && !message.isRead) {
      markAsRead(message.id);
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [message, markAsRead, fadeAnim]);

  const handleMarkAsSpam = useCallback(() => {
    if (!message) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    markAsSpam(message.id);
    Alert.alert('Spam İşaretlendi', 'Bu mesaj spam olarak işaretlendi.');
  }, [message, markAsSpam]);

  const handleMarkAsSafe = useCallback(() => {
    if (!message) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    markAsSafe(message.id);
    Alert.alert('Güvenli İşaretlendi', 'Bu mesaj güvenli olarak işaretlendi.');
  }, [message, markAsSafe]);

  const handleDelete = useCallback(() => {
    if (!message) return;
    Alert.alert(
      'Mesajı Sil',
      'Bu mesajı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            deleteMessage(message.id);
            router.back();
          },
        },
      ]
    );
  }, [message, deleteMessage, router]);

  if (!message) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Mesaj Bulunamadı' }} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Mesaj bulunamadı</Text>
        </View>
      </View>
    );
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Stack.Screen options={{ title: message.sender }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusBanner, {
          backgroundColor: message.isSpam ? Colors.dangerSoft : Colors.safeSoft,
          borderColor: message.isSpam ? Colors.dangerMuted : Colors.safe,
        }]}>
          <View style={styles.statusRow}>
            {message.isSpam ? (
              <ShieldAlert size={22} color={Colors.danger} />
            ) : (
              <ShieldCheck size={22} color={Colors.safe} />
            )}
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusTitle, {
                color: message.isSpam ? Colors.danger : Colors.safe,
              }]}>
                {message.isSpam ? 'Spam Tespit Edildi' : 'Güvenli Mesaj'}
              </Text>
              {message.isSpam && (
                <Text style={styles.statusSubtitle}>
                  Tehdit skoru: %{message.spamScore} · {getCategoryLabel(message.category)}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.senderCard}>
          <View style={[styles.senderAvatar, {
            backgroundColor: message.isSpam ? Colors.dangerSoft : Colors.accentSoft,
          }]}>
            <Text style={[styles.senderInitial, {
              color: message.isSpam ? Colors.danger : Colors.accent,
            }]}>
              {message.sender.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{message.sender}</Text>
            <View style={styles.phoneRow}>
              <Phone size={12} color={Colors.textMuted} />
              <Text style={styles.senderNumber}>{message.senderNumber}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(message.timestamp)}</Text>
          </View>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageContent}>{message.content}</Text>
        </View>

        {message.isSpam && message.spamReasons.length > 0 && (
          <View style={styles.reasonsCard}>
            <View style={styles.reasonsHeader}>
              <AlertTriangle size={16} color={Colors.warning} />
              <Text style={styles.reasonsTitle}>Tespit Nedenleri</Text>
            </View>
            {message.spamReasons.map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <View style={styles.reasonDot} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        {!message.isSpam && (
          <View style={styles.safeCard}>
            <CheckCircle size={18} color={Colors.safe} />
            <Text style={styles.safeText}>Bu mesajda tehdit tespit edilmedi</Text>
          </View>
        )}

        <View style={styles.actions}>
          {message.isSpam ? (
            <TouchableOpacity style={styles.safeButton} onPress={handleMarkAsSafe}>
              <ShieldPlus size={18} color={Colors.safe} />
              <Text style={[styles.actionText, { color: Colors.safe }]}>Güvenli İşaretle</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.spamButton} onPress={handleMarkAsSpam}>
              <ShieldBan size={18} color={Colors.danger} />
              <Text style={[styles.actionText, { color: Colors.danger }]}>Spam İşaretle</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={18} color={Colors.danger} />
            <Text style={[styles.actionText, { color: Colors.danger }]}>Mesajı Sil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  statusBanner: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  statusSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  senderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  senderInitial: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  senderNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
  },
  messageCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  reasonsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reasonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.warning,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  safeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.safeSoft,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.safe,
  },
  safeText: {
    fontSize: 14,
    color: Colors.safe,
    fontWeight: '500' as const,
  },
  actions: {
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  spamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dangerMuted,
  },
  safeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.safeSoft,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.safe,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
