import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SHADOWS } from '../constants';

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!isLogin) {
      if (!form.name.trim()) { Alert.alert('Error', 'Please enter your name'); return false; }
      if (form.name.trim().length < 2) { Alert.alert('Error', 'Name must be at least 2 characters'); return false; }
    }
    if (!form.email.trim() && !form.mobile.trim()) {
      Alert.alert('Error', 'Please enter email or mobile number'); return false;
    }
    if (!form.password || form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters'); return false;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match'); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        const identifier = form.email || form.mobile;
        response = await authAPI.login(identifier, form.password);
      } else {
        response = await authAPI.register({
          name: form.name,
          email: form.email || undefined,
          mobile: form.mobile || undefined,
          password: form.password,
          role: 'buyer',
        });
      }

      const { token, user } = response.data.data;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      Alert.alert('Success', isLogin ? 'Logged in successfully!' : 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🏠</Text>
          <Text style={styles.headerTitle}>Uttarakhand Real Estate</Text>
          <Text style={styles.headerSub}>{isLogin ? 'Welcome Back!' : 'Join Us Today!'}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{isLogin ? 'Login' : 'Create Account'}</Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={form.name}
              onChangeText={(v) => updateForm('name', v)}
              autoCapitalize="words"
            />
          )}

          {isLogin ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email or Mobile"
                value={form.email}
                onChangeText={(v) => updateForm('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Mobile (optional)"
                value={form.mobile}
                onChangeText={(v) => updateForm('mobile', v)}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={form.email}
                onChangeText={(v) => updateForm('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={form.mobile}
                onChangeText={(v) => updateForm('mobile', v)}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Password * (min 6 characters)"
            value={form.password}
            onChangeText={(v) => updateForm('password', v)}
            secureTextEntry
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={form.confirmPassword}
              onChangeText={(v) => updateForm('confirmPassword', v)}
              secureTextEntry
            />
          )}

          {isLogin && (
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitText}>{isLogin ? 'Login' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <View style={styles.roleHint}>
              <Text style={styles.roleHintText}>Login as Buyer/Seller</Text>
              <Text style={styles.roleHintSub}>Admins use separate Admin Panel</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSub: {
    fontSize: FONTS.medium,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
  },
  formTitle: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
    padding: 14,
    fontSize: FONTS.regular,
    color: COLORS.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forgotPassword: {
    color: COLORS.primary,
    fontSize: FONTS.small,
    textAlign: 'right',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textLight,
    fontSize: FONTS.small,
  },
  toggleButton: {
    alignItems: 'center',
    padding: 12,
  },
  toggleText: {
    color: COLORS.primary,
    fontSize: FONTS.regular,
    fontWeight: '500',
  },
  roleHint: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
  },
  roleHintText: {
    fontSize: FONTS.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  roleHintSub: {
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
    marginTop: 2,
  },
});

export default AuthScreen;