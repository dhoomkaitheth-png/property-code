import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { adminAPI, locationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SHADOWS } from '../constants';

const AdminScreen = ({ navigation }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(!isAuthenticated);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard data
  const [stats, setStats] = useState(null);
  const [importLogs, setImportLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getImportLogs(),
      ]);
      setStats(statsRes.data.data);
      setImportLogs(logsRes.data.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoginLoading(true);
    const result = await login(username, password);
    setLoginLoading(false);

    if (result.success) {
      setShowLogin(false);
      setUsername('');
      setPassword('');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleImport = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      });

      setLoading(true);
      let response;
      switch (type) {
        case 'districts':
          response = await adminAPI.importDistricts(formData);
          break;
        case 'tehsils':
          response = await adminAPI.importTehsils(formData);
          break;
        case 'villages':
          response = await adminAPI.importVillages(formData);
          break;
      }
      Alert.alert('Import Complete', response.data.message);
      loadDashboard();
    } catch (error) {
      Alert.alert('Import Failed', error.response?.data?.error || 'Failed to import');
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (showLogin) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.loginIcon}>🔐</Text>
          <Text style={styles.loginTitle}>Admin Login</Text>
          <Text style={styles.loginSubtitle}>Uttarakhand Real Estate</Text>

          <TextInput
            style={styles.loginInput}
            placeholder="Username"
            placeholderTextColor={COLORS.textLight}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.loginInput}
            placeholder="Password"
            placeholderTextColor={COLORS.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.loginButton, loginLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.loginHint}>Default: admin / admin123</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['dashboard', 'import', 'villages'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'dashboard' && (
            <View>
              <Text style={styles.welcomeText}>Welcome, {user?.full_name || user?.username}</Text>
              <View style={styles.statsGrid}>
                {[ 
                  { label: 'Districts', value: stats?.total_districts, icon: '🏛️' },
                  { label: 'Tehsils', value: stats?.total_tehsils, icon: '📋' },
                  { label: 'Villages', value: stats?.total_villages, icon: '🏘️' },
                  { label: 'Properties', value: stats?.total_properties, icon: '🏠' },
                  { label: 'New This Week', value: stats?.new_properties_week, icon: '🆕' },
                  { label: 'Imports/Month', value: stats?.imports_month, icon: '📥' },
                ].map((item, index) => (
                  <View key={index} style={styles.statCard}>
                    <Text style={styles.statIcon}>{item.icon}</Text>
                    <Text style={styles.statValue}>{item.value || 0}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* Recent Import Logs */}
              <Text style={styles.sectionTitle}>Recent Imports</Text>
              {importLogs.slice(0, 10).map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logType}>{log.import_type?.toUpperCase()}</Text>
                    <Text style={styles.logStatus}>{log.status}</Text>
                  </View>
                  <Text style={styles.logDetail}>{log.file_name || 'Manual'}</Text>
                  <Text style={styles.logCounts}>S: {log.success_rows} / F: {log.failed_rows}</Text>
                  <Text style={styles.logDate}>{new Date(log.created_at).toLocaleDateString('en-IN')}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'import' && (
            <View>
              <Text style={styles.sectionTitle}>Import Data</Text>
              <Text style={styles.importHint}>Upload CSV or Excel files with official Uttarakhand government data</Text>

              {[
                { label: 'Import Districts', type: 'districts', icon: '🏛️', desc: 'CSV/Excel with district_name column' },
                { label: 'Import Tehsils', type: 'tehsils', icon: '📋', desc: 'CSV/Excel with district_name, tehsil_name columns' },
                { label: 'Import Villages', type: 'villages', icon: '🏘️', desc: 'CSV/Excel with district_name, tehsil_name, village_name columns' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={styles.importCard}
                  onPress={() => handleImport(item.type)}
                >
                  <Text style={styles.importIcon}>{item.icon}</Text>
                  <View style={styles.importInfo}>
                    <Text style={styles.importLabel}>{item.label}</Text>
                    <Text style={styles.importDesc}>{item.desc}</Text>
                  </View>
                  <Text style={styles.importAction}>📂</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'villages' && (
            <View>
              <Text style={styles.sectionTitle}>Village Management</Text>
              <Text style={styles.importHint}>Add or edit villages in the master database</Text>
              <TouchableOpacity
                style={styles.importCard}
                onPress={() => Alert.alert('Info', 'Village CRUD operations available via the API. Use the import feature for bulk additions.')}
              >
                <Text style={styles.importIcon}>✏️</Text>
                <View style={styles.importInfo}>
                  <Text style={styles.importLabel}>Manage Villages</Text>
                  <Text style={styles.importDesc}>Add new villages, edit existing ones, or delete outdated entries</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  loginIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  loginTitle: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  loginInput: {
    width: '100%',
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 14,
    fontSize: FONTS.regular,
    color: COLORS.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: '600',
  },
  loginHint: {
    marginTop: 16,
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.white,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: FONTS.regular,
    opacity: 0.9,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 4,
    margin: 8,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: FONTS.small,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    marginBottom: 16,
    fontWeight: '500',
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '30%',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  // Import
  importCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  importIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  importInfo: {
    flex: 1,
  },
  importLabel: {
    fontSize: FONTS.regular,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  importDesc: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  importAction: {
    fontSize: 20,
  },
  importHint: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  // Logs
  logItem: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logType: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  logStatus: {
    fontSize: FONTS.small,
    color: COLORS.secondary,
  },
  logDetail: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  logCounts: {
    fontSize: FONTS.small,
    color: COLORS.text,
  },
  logDate: {
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

export default AdminScreen;