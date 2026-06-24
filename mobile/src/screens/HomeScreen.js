import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { propertyAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { COLORS, FONTS, SHADOWS } from '../constants';

const HomeScreen = ({ navigation }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await propertyAPI.getProperties({
        page: pageNum,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'DESC',
      });

      const newData = response.data.data || [];
      if (append) {
        setProperties(prev => [...prev, ...newData]);
      } else {
        setProperties(newData);
      }
      setTotalPages(response.data.totalPages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProperties(1);
  }, []);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      loadProperties(page + 1, true);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery.trim() });
    }
  };

  const handlePropertyPress = (property) => {
    navigation.navigate('PropertyDetail', { propertyId: property.id });
  };

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search properties in Uttarakhand..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFilters}>
        {['Buy', 'Rent', 'Plot', 'House', 'Villa'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={styles.quickFilterChip}
            onPress={() => navigation.navigate('Search', {
              property_type: filter.toLowerCase() === 'plot' ? 'land_plot' :
                            filter.toLowerCase() === 'house' ? 'residential_house' : filter.toLowerCase()
            })}
          >
            <Text style={styles.quickFilterText}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Properties</Text>
        <Text style={styles.sectionCount}>{properties.length} listings</Text>
      </View>
    </View>
  );

  if (loading && properties.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard property={item} onPress={handlePropertyPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>No Properties Yet</Text>
            <Text style={styles.emptyText}>Be the first to list a property in Uttarakhand</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddProperty')}
            >
              <Text style={styles.addButtonText}>+ Add Property</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.footerText}>Loading more...</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProperty')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  loadingText: {
    marginTop: 12,
    color: COLORS.textLight,
    fontSize: FONTS.regular,
  },
  listContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.regular,
    color: COLORS.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textLight,
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  filterIcon: {
    fontSize: 20,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  quickFilterChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickFilterText: {
    fontSize: FONTS.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionCount: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
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
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  footerText: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  fabText: {
    fontSize: 28,
    color: COLORS.white,
    fontWeight: '300',
    marginTop: -2,
  },
});

export default HomeScreen;