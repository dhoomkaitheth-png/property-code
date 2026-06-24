import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { favoriteAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { COLORS, FONTS, SHADOWS } from '../constants';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await favoriteAPI.getFavorites({ page: pageNum, limit: 10 });
      const newData = response.data.data || [];

      if (append) {
        setFavorites(prev => [...prev, ...newData]);
      } else {
        setFavorites(newData);
      }
      setTotalPages(response.data.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites(1);
  }, []);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadFavorites(page + 1, true);
    }
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetail', { propertyId: property.id });
  };

  if (loading && favorites.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ My Favorites</Text>
        <Text style={styles.headerCount}>{favorites.length} saved</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.favorite_id?.toString() || item.id}
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={handlePropertyPress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyText}>Start saving properties you like by tapping the heart icon</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Browse Properties</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerCount: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
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
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: '600',
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});

export default FavoritesScreen;