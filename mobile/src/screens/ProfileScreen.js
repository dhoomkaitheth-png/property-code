import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, leadAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../constants';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', mobile: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        return;
      }
      const userData = JSON.parse(userStr);
      setUser(userData);

      try {
        const response = await authAPI.getProfile();
        const profile = response.data.data;
        setUser(profile);
        setStats({
          total_favorites: profile.total_favorites || 0,
          total_leads: profile.total_leads || 0,
          total_properties: 0,
        });
      } catch (e) {
        // Use cached data
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          setUser(null);
          Alert.alert('Logged out', 'You have been logged out successfully.');
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (editing) {
      setEditing(false);
      return;
    }
    setEditForm({ name: user?.name || '', mobile: user?.mobile || '' });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await authAPI.updateProfile({ name: editForm.name, mobile: editForm.mobile });
      setUser(prev => ({ ...prev, name: editForm.name, mobile: editForm.mobile }));
      await AsyncStorage.setItem('user', JSON.stringify({ ...user, name: editForm.name, mobile: editForm.mobile }));
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.emptyTitle}>Not Logged In</Text>
        <Text style={styles.emptyText}>Login or register to manage your profile</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.loginButtonText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name?.charAt(0)?.toUpperCase() || '👤'}
            </Text>
          </View>
        </View>
        {editing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editForm.name}
              onChangeText={(v) => setEditForm(f => ({ ...f, name: v }))}
              placeholder="Name"
            />
            <TextInput
              style={styles.editInput}
              value={editForm.mobile}
              onChangeText={(v) => setEditForm(f => ({ ...f, mobile: v }))}
              placeholder="Mobile"
              keyboardType="phone-pad"
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.userName}>{user.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userMobile}>📞 {user.mobile}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user.role?.toUpperCase() || 'BUYER'}</Text>
            </View>
          </>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.total_favorites || 0}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.total_leads || 0}</Text>
          <Text style={styles.statLabel}>Inquiries</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.is_verified ? '✓' : '—'}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Favorites')}>
          <Text style={styles.menuIcon}>❤️</Text>
          <Text style={styles.menuText}>My Favorites</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyLeads')}>
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuText}>My Inquiries</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.menuIcon}>💬</Text>
          <Text style={styles.menuText}>Messages</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.menuIcon}>🔔</Text>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyProperties')}>
          <Text style={styles.menuIcon}>🏠</Text>
          <Text style={styles.menuText}>My Properties</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FONTS.xlarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: FONTS.regular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: '600',
  },
  profileHeader: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
  },
  userName: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: FONTS.regular,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  userMobile: {
    fontSize: FONTS.regular,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: COLORS.white,
    fontSize: FONTS.tiny,
    fontWeight: '600',
  },
  editContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  editInput: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: FONTS.regular,
    color: COLORS.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightGrey,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
    marginTop: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    marginTop: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  menuText: {
    flex: 1,
    fontSize: FONTS.regular,
    color: COLORS.text,
  },
  menuArrow: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginTop: 20,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    fontSize: FONTS.medium,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default ProfileScreen;