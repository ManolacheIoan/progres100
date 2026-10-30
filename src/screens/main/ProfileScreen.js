import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useColors } from '../../context/ThemeContext';
import Card from '../../components/Card';
import storage from '../../services/storageService';
import { getHabitName, getHabitIcon } from '../../utils/habitUtils';
import { getSeverityColor, getSeverityLabel } from '../../components/SeverityBadge';

const AVATAR_KEY = '@progres100:avatar_uri';


function MenuItem({ emoji, label, sublabel, onPress, color, colors }) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.menuIcon, { backgroundColor: (color || colors.primary) + '22' }]}>
        <Text style={s.menuEmoji}>{emoji}</Text>
      </View>
      <View style={s.menuContent}>
        <Text style={[s.menuLabel, { color: color || colors.text }]}>{label}</Text>
        {sublabel ? <Text style={[s.menuSublabel, { color: colors.textMuted }]}>{sublabel}</Text> : null}
      </View>
      <Text style={[s.menuChevron, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, deleteAccount } = useAuth();
  const { habits, stats, activeHabit, loadAll, removeHabit, isPremium } = useApp();
  const colors = useColors();
  const [avatarUri, setAvatarUri] = useState(null);

  useFocusEffect(useCallback(() => {
    loadAll();
    storage.get(AVATAR_KEY).then((uri) => { if (uri) setAvatarUri(uri); });
  }, []));

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisiune necesară', 'Acordă acces la galerie pentru a schimba poza de profil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await storage.set(AVATAR_KEY, uri);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Delogare',
      'Ești sigur că vrei să te deloghezi? Progresul tău este salvat local.',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Delogare',
          style: 'destructive',
          onPress: async () => {
            try { await logout(); } catch { /* ignore */ }
          },
        },
      ]
    );
  };

  const handleDeleteHabit = (habit) => {
    Alert.alert(
      'Șterge obicei',
      `Ești sigur că vrei să ștergi "${getHabitName(habit)}"? Toate datele de progres vor fi șterse.`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Șterge',
          style: 'destructive',
          onPress: () => removeHabit(habit.id),
        },
      ]
    );
  };

  const name = user?.name || (user?.isGuest ? 'Vizitator' : 'Utilizator');
  const email = user?.email || (user?.isGuest ? 'Mod vizitator' : '');

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={[s.title, { color: colors.text }]}>Profil</Text>

        {/* User Info */}
        <Card style={s.userCard}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={s.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={[s.avatar, s.avatarImg, { borderColor: colors.primary }]} />
            ) : (
              <View style={[s.avatar, { backgroundColor: colors.primaryFaded, borderColor: colors.primary }]}>
                <Text style={[s.avatarText, { color: colors.primary }]}>
                  {user?.isGuest ? '👤' : name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[s.avatarEditBadge, { backgroundColor: colors.primary }]}>
              <Text style={s.avatarEditIcon}>✎</Text>
            </View>
          </TouchableOpacity>
          <Text style={[s.userName, { color: colors.text }]}>{name}</Text>
          {email ? <Text style={[s.userEmail, { color: colors.textMuted }]}>{email}</Text> : null}
          {user?.createdAt ? (
            <Text style={[s.userSince, { color: colors.textDisabled }]}>
              Utilizator din {new Date(user.createdAt).toLocaleDateString('ro-RO')}
            </Text>
          ) : null}
          {user?.isGuest && (
            <View style={[s.guestBadge, { backgroundColor: colors.warningFaded, borderColor: colors.warning }]}>
              <Text style={[s.guestBadgeText, { color: colors.warning }]}>
                👀 Mod Vizitator — datele nu sunt sincronizate
              </Text>
            </View>
          )}
        </Card>

        {/* Quick Stats */}
        {stats && activeHabit ? (
          <View style={[s.miniStats, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <View style={s.miniStat}>
              <Text style={[s.miniStatNum, { color: colors.primary }]}>{stats.currentStreak}</Text>
              <Text style={[s.miniStatLabel, { color: colors.textMuted }]}>Streak curent</Text>
            </View>
            <View style={[s.miniStatDivider, { backgroundColor: colors.border }]} />
            <View style={s.miniStat}>
              <Text style={[s.miniStatNum, { color: colors.primary }]}>{stats.bestStreak}</Text>
              <Text style={[s.miniStatLabel, { color: colors.textMuted }]}>Record</Text>
            </View>
            <View style={[s.miniStatDivider, { backgroundColor: colors.border }]} />
            <View style={s.miniStat}>
              <Text style={[s.miniStatNum, { color: colors.primary }]}>{stats.successRate7}%</Text>
              <Text style={[s.miniStatLabel, { color: colors.textMuted }]}>Succes 7 zile</Text>
            </View>
          </View>
        ) : null}

        {/* Habits list */}
        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>OBICEIURILE MELE ({habits.length})</Text>
        {habits.length === 0 ? (
          <Card>
            <Text style={[s.emptyText, { color: colors.textMuted }]}>Nu ai niciun obicei adăugat.</Text>
          </Card>
        ) : (
          habits.map((habit) => {
            const isActive = activeHabit?.id === habit.id;
            const sevColor = getSeverityColor(habit.severity, colors);
            const sevLabel = getSeverityLabel(habit.severity);
            return (
              <View
                key={habit.id}
                style={[s.habitRow, { backgroundColor: colors.card, borderColor: isActive ? colors.primary : colors.border }]}
              >
                <Text style={s.habitRowIcon}>{getHabitIcon(habit)}</Text>
                <View style={s.habitRowContent}>
                  <Text style={[s.habitRowName, { color: colors.text }]}>{getHabitName(habit)}</Text>
                  <View style={s.habitRowSevRow}>
                    <View style={[s.habitRowDot, { backgroundColor: sevColor }]} />
                    <Text style={[s.habitRowSev, { color: colors.textMuted }]}>
                      {sevLabel}{isActive ? ' · activ' : ''}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteHabit(habit)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[s.deleteBtn, { color: colors.danger }]}>🗑️</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={[s.addHabitBtn, { borderColor: colors.primary, backgroundColor: colors.primaryFaded }]}
          onPress={() => !isPremium && habits.length >= 1
            ? navigation.navigate('Subscription')
            : navigation.navigate('AddHabit')
          }
          activeOpacity={0.7}
        >
          <Text style={[s.addHabitText, { color: colors.primary }]}>+ Adaugă obicei nou</Text>
        </TouchableOpacity>

        {/* Menu */}
        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>APLICAȚIE</Text>
        <Card style={s.menuCard}>
          <MenuItem
            emoji="👑"
            label={isPremium ? 'Premium Activ' : 'Upgrade la Premium'}
            sublabel={isPremium ? 'Obiceiuri nelimitate deblocate' : 'Obiceiuri nelimitate & mai multe'}
            color={colors.warning}
            colors={colors}
            onPress={() => navigation.navigate('Subscription')}
          />
          <View style={[s.menuDivider, { backgroundColor: colors.borderLight }]} />
          <MenuItem emoji="🏆" label="Milestone-uri" sublabel="Realizările tale" color={colors.warning} colors={colors} onPress={() => navigation.navigate('Milestones')} />
          <View style={[s.menuDivider, { backgroundColor: colors.borderLight }]} />
          <MenuItem emoji="⚙️" label="Setări" sublabel="Tema, reminder-e" color={colors.primary} colors={colors} onPress={() => navigation.navigate('Settings')} />
        </Card>

        <Text style={[s.sectionLabel, { color: colors.textMuted }]}>CONT</Text>
        <Card style={s.menuCard}>
          <MenuItem emoji="✏️" label="Editează profilul" sublabel="Nume, parolă" color={colors.primary} colors={colors} onPress={() => navigation.navigate('EditProfile')} />
          <View style={[s.menuDivider, { backgroundColor: colors.borderLight }]} />
          <MenuItem emoji="🚪" label="Delogare" color={colors.danger} colors={colors} onPress={handleLogout} />
          <View style={[s.menuDivider, { backgroundColor: colors.borderLight }]} />
          <MenuItem
            emoji="🗑️"
            label="Șterge cont"
            sublabel="Șterge toate datele permanent"
            color={colors.danger}
            colors={colors}
            onPress={() =>
              Alert.alert(
                '⚠️ Șterge cont',
                'Toate datele tale vor fi șterse definitiv. Această acțiune nu poate fi anulată.',
                [
                  { text: 'Anulează', style: 'cancel' },
                  {
                    text: 'Șterge definitiv',
                    style: 'destructive',
                    onPress: async () => {
                      try { await deleteAccount(); } catch { /* ignore */ }
                    },
                  },
                ]
              )
            }
          />
        </Card>

        <Text style={[s.version, { color: colors.textDisabled }]}>Progres 100 • v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 },
  title: { fontSize: 28, fontWeight: '800' },
  userCard: { alignItems: 'center', gap: 6 },
  avatarWrapper: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { borderWidth: 2.5 },
  avatarText: { fontSize: 32, fontWeight: '800' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEditIcon: { color: '#fff', fontSize: 12, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: '800' },
  userEmail: { fontSize: 14 },
  userSince: { fontSize: 12 },
  guestBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  guestBadgeText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  miniStats: {
    flexDirection: 'row', borderRadius: 16, padding: 16, borderWidth: 1,
  },
  miniStat: { flex: 1, alignItems: 'center' },
  miniStatNum: { fontSize: 24, fontWeight: '800' },
  miniStatLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  miniStatDivider: { width: 1, marginHorizontal: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: -4 },
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: 8 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14, borderWidth: 1.5,
  },
  habitRowIcon: { fontSize: 28 },
  habitRowContent: { flex: 1 },
  habitRowName: { fontSize: 16, fontWeight: '700' },
  habitRowSevRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  habitRowDot: { width: 8, height: 8, borderRadius: 4 },
  habitRowSev: { fontSize: 12 },
  deleteBtn: { fontSize: 18 },
  addHabitBtn: {
    borderRadius: 14, borderWidth: 1.5, padding: 14, alignItems: 'center',
  },
  addHabitText: { fontSize: 15, fontWeight: '700' },
  menuCard: { padding: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuEmoji: { fontSize: 18 },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  menuSublabel: { fontSize: 12, marginTop: 1 },
  menuChevron: { fontSize: 22, fontWeight: '300' },
  menuDivider: { height: 1, marginHorizontal: 14 },
  version: { fontSize: 12, textAlign: 'center' },
});
