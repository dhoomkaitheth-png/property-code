import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../constants';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🏠</Text>
        <Text style={styles.title}>Uttarakhand</Text>
        <Text style={styles.subtitle}>Real Estate</Text>
      </View>
      <View style={styles.taglineContainer}>
        <Text style={styles.tagline}>Find Your Dream Property</Text>
        <Text style={styles.taglineSub}>in the Land of Gods</Text>
      </View>
      <ActivityIndicator size="large" color={COLORS.white} style={styles.loader} />
      <Text style={styles.footer}>🏔️ Uttarakhand</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.white,
    opacity: 0.9,
    letterSpacing: 4,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  tagline: {
    fontSize: FONTS.large,
    color: COLORS.white,
    opacity: 0.9,
  },
  taglineSub: {
    fontSize: FONTS.regular,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: 4,
  },
  loader: {
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    fontSize: FONTS.medium,
    color: COLORS.white,
    opacity: 0.6,
  },
});

export default SplashScreen;