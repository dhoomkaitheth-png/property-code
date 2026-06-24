import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { propertyAPI, locationAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { COLORS, FONTS, PROPERTY_TYPES, LISTING_TYPES, PRICE_RANGES, AREA_RANGES, BEDROOM_OPTIONS, SORT_OPTIONS, SHADOWS } from '../constants';

const SearchScreen = ({ route, navigation }) => {
  const initialQuery = route.params?.query || '';
  const initialType = route.params?.property_type || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    property_type: initialType || '',
    listing_type: '',
    min_price: '',
    max_price: '',
    min_area: '',
    max_area: '',
    bedrooms: '',
    district_id: '',
    tehsil_id: '',
    village_id: '',
    sort_by: 'created_at',
    sort_order: 'DESC',
  });

  // Districts list
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    loadDistricts();
    if (initialQuery || initialType) {
      searchProperties();
    }
  }, []);

  const loadDistricts = async () => {
    try {
      const response = await locationAPI.getDistricts();
      setDistricts(response.data.data || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const searchProperties = async () => {
    setLoading(true);
    try {
      const params = {
        search: query || undefined,
        ...filters,
        ...(filters.min_price ? { min_price: parseFloat(filters.min_price) } : {}),
        ...(filters.max_price ? { max_price: parseFloat(filters.max_price) } : {}),
        ...(filters.min_area ? { min_area: parseFloat(filters.min_area) } : {}),
        ...(filters.max_area ? { max_area: parseFloat(filters.max_area) } : {}),
        ...(filters.bedrooms ? { bedrooms: parseInt(filters.bedrooms) } : {}),
      };

      // Clean undefined values
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const response = await propertyAPI.getProperties(params);
      setResults(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      property_type: '',
      listing_type: '',
      min_price: '',
      max_price: '',
      min_area: '',
      max_area: '',
      bedrooms: '',
      district_id: '',
      tehsil_id: '',
      village_id: '',
      sort_by: 'created_at',
      sort_order: 'DESC',
    });
    setQuery('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Properties</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterToggle}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, location..."
          placeholderTextColor={COLORS.textLight}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchProperties}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchProperties}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <ScrollView style={styles.filtersPanel} horizontal={false} showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Property Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                {PROPERTY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.filterChip, filters.property_type === type.value && styles.filterChipActive]}
                    onPress={() => updateFilter('property_type', filters.property_type === type.value ? '' : type.value)}
                  >
                    <Text style={[styles.filterChipText, filters.property_type === type.value && styles.filterChipTextActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Listing Type</Text>
            <View style={styles.filterOptions}>
              {LISTING_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.filterChip, filters.listing_type === type.value && styles.filterChipActive]}
                  onPress={() => updateFilter('listing_type', filters.listing_type === type.value ? '' : type.value)}
                >
                  <Text style={[styles.filterChipText, filters.listing_type === type.value && styles.filterChipTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.filterLabel}>Price Range (₹)</Text>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="Min"
              placeholderTextColor={COLORS.textLight}
              value={filters.min_price}
              onChangeText={(v) => updateFilter('min_price', v)}
              keyboardType="numeric"
            />
            <Text style={styles.filterSep}>-</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Max"
              placeholderTextColor={COLORS.textLight}
              value={filters.max_price}
              onChangeText={(v) => updateFilter('max_price', v)}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.filterLabel}>Area (sqft)</Text>
          <View style={styles.filterRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="Min"
              placeholderTextColor={COLORS.textLight}
              value={filters.min_area}
              onChangeText={(v) => updateFilter('min_area', v)}
              keyboardType="numeric"
            />
            <Text style={styles.filterSep}>-</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Max"
              placeholderTextColor={COLORS.textLight}
              value={filters.max_area}
              onChangeText={(v) => updateFilter('max_area', v)}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.filterLabel}>Bedrooms</Text>
          <View style={styles.filterOptions}>
            {BEDROOM_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.filterChip, filters.bedrooms === String(opt.value) && styles.filterChipActive]}
                onPress={() => updateFilter('bedrooms', filters.bedrooms === String(opt.value) ? '' : String(opt.value))}
              >
                <Text style={[styles.filterChipText, filters.bedrooms === String(opt.value) && styles.filterChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.applyFiltersButton} onPress={() => { setShowFilters(false); searchProperties(); }}>
            <Text style={styles.applyFiltersText}>Apply Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard property={item} onPress={(p) => navigation.navigate('PropertyDetail', { propertyId: p.id })} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No Results</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          }
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Bottom Apply Button */}
      {showFilters && (
        <TouchableOpacity style={styles.bottomApply} onPress={() => { setShowFilters(false); searchProperties(); }}>
          <Text style={styles.bottomApplyText}>Apply & Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    fontSize: FONTS.regular,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterToggle: {
    fontSize: 22,
  },
  searchBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  filtersPanel: {
    backgroundColor: COLORS.surface,
    maxHeight: 350,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: FONTS.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 4,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.lightGrey,
    marginRight: 4,
    marginBottom: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11,
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  filterInput: {
    flex: 1,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 10,
    fontSize: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterSep: {
    color: COLORS.textLight,
  },
  applyFiltersButton: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyFiltersText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  clearFiltersButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  clearFiltersText: {
    color: COLORS.danger,
    fontSize: FONTS.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
  },
  bottomApply: {
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: 'center',
  },
  bottomApplyText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.medium,
  },
});

export default SearchScreen;