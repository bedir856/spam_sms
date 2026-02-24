import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  Shield,
  Plus,
  Trash2,
  Tag,
  Bell,
  Eye,
  Lock,
  Info,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMessages } from '@/providers/MessagesProvider';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  const {
    keywords,
    protectionEnabled,
    toggleProtection,
    addKeyword,
    toggleKeyword,
    removeKeyword,
  } = useMessages();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('Bahis');

  const categories = ['Bahis', 'Casino', 'Piyango', 'Phishing', 'Diğer'];

  const handleToggleProtection = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleProtection();
  }, [toggleProtection]);

  const handleAddKeyword = useCallback(() => {
    if (newKeyword.trim().length === 0) {
      Alert.alert('Hata', 'Lütfen bir anahtar kelime girin.');
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    addKeyword(newKeyword.trim(), newCategory);
    setNewKeyword('');
    setShowAddForm(false);
  }, [newKeyword, newCategory, addKeyword]);

  const handleRemoveKeyword = useCallback((id: string, keyword: string) => {
    Alert.alert(
      'Anahtar Kelime Sil',
      `"${keyword}" anahtar kelimesini silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            removeKeyword(id);
          },
        },
      ]
    );
  }, [removeKeyword]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="settings-screen">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>KORUMA</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.safeSoft }]}>
              <Shield size={18} color={Colors.safe} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Spam Koruması</Text>
              <Text style={styles.settingSubtitle}>Otomatik spam algılama</Text>
            </View>
          </View>
          <Switch
            value={protectionEnabled}
            onValueChange={handleToggleProtection}
            trackColor={{ false: Colors.surfaceHighlight, true: Colors.safe }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.accentSoft }]}>
              <Bell size={18} color={Colors.accent} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Bildirimler</Text>
              <Text style={styles.settingSubtitle}>Spam engellendiğinde bildir</Text>
            </View>
          </View>
          <Switch
            value={true}
            trackColor={{ false: Colors.surfaceHighlight, true: Colors.accent }}
            thumbColor={Colors.white}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.warningSoft }]}>
              <Eye size={18} color={Colors.warning} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Gelişmiş Analiz</Text>
              <Text style={styles.settingSubtitle}>AI ile derin içerik tarama</Text>
            </View>
          </View>
          <Switch
            value={true}
            trackColor={{ false: Colors.surfaceHighlight, true: Colors.warning }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>ANAHTAR KELİMELER</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? (
              <X size={16} color={Colors.accent} />
            ) : (
              <Plus size={16} color={Colors.accent} />
            )}
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="Yeni anahtar kelime..."
              placeholderTextColor={Colors.textMuted}
              value={newKeyword}
              onChangeText={setNewKeyword}
              autoFocus
            />
            <View style={styles.categoryPicker}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    newCategory === cat && styles.categoryChipActive,
                  ]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    newCategory === cat && styles.categoryChipTextActive,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={handleAddKeyword}>
              <Text style={styles.submitText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {keywords.map(kw => (
          <View key={kw.id} style={styles.keywordRow}>
            <View style={styles.keywordLeft}>
              <View style={[styles.settingIcon, { backgroundColor: Colors.surfaceHighlight }]}>
                <Tag size={14} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.keywordText}>{kw.keyword}</Text>
                <Text style={styles.keywordCategory}>{kw.category}</Text>
              </View>
            </View>
            <View style={styles.keywordActions}>
              <Switch
                value={kw.isActive}
                onValueChange={() => toggleKeyword(kw.id)}
                trackColor={{ false: Colors.surfaceHighlight, true: Colors.accent }}
                thumbColor={Colors.white}
                style={styles.smallSwitch}
              />
              <TouchableOpacity
                onPress={() => handleRemoveKeyword(kw.id, kw.keyword)}
                style={styles.deleteBtn}
              >
                <Trash2 size={14} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>HAKKINDA</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.surfaceHighlight }]}>
              <Lock size={18} color={Colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Gizlilik</Text>
              <Text style={styles.settingSubtitle}>Verileriniz cihazda kalır</Text>
            </View>
          </View>
        </View>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.surfaceHighlight }]}>
              <Info size={18} color={Colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Sürüm</Text>
              <Text style={styles.settingSubtitle}>1.0.0</Text>
            </View>
          </View>
        </View>
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
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700' as const,
    letterSpacing: 1,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addForm: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  input: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 8,
    padding: 12,
    color: Colors.text,
    fontSize: 14,
    marginBottom: 10,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
  },
  categoryChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitText: {
    color: Colors.white,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  keywordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keywordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  keywordText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  keywordCategory: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  keywordActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.dangerSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
