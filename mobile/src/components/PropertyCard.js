import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../constants';

const PropertyCard = ({ property, onPress }) => {
  const {
    title,
    price,
    total_area,
    area_unit,
    bedrooms,
    bathrooms,
    property_type,
    listing_type,
    district_name,
    tehsil_name,
    village_name,
    images,
    created_at,
    is_featured,
    furnishing_status,
  } = property;

  const formatPrice = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      residential_house: 'House',
      apartment_flat: 'Apartment',
      land_plot: 'Plot',
      commercial_shop: 'Shop',
      commercial_office: 'Office',
      farm_land: 'Farm',
      villa: 'Villa',
      other: 'Property',
    };
    return labels[type] || 'Property';
  };

  const getPrimaryImage = () => {
    if (images && images.length > 0) {
      const primaryImage = images.find(img => img.is_primary);
      return primaryImage?.url || images[0]?.url || null;
    }
    return null;
  };

  const primaryImage = getPrimaryImage();
  const timeAgo = getTimeAgo(created_at);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(property)} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        {primaryImage ? (
          <Image source={{ uri: primaryImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderIcon}>🏠</Text>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, listing_type === 'sell' ? styles.badgeSale : styles.badgeRent]}>
            <Text style={styles.badgeText}>
              {listing_type === 'sell' ? 'FOR SALE' : listing_type === 'rent' ? 'FOR RENT' : 'LEASE'}
            </Text>
          </View>
          {is_featured && (
            <View style={[styles.badge, styles.badgeFeatured]}>
              <Text style={styles.badgeText}>FEATURED</Text>
            </View>
          )}
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{formatPrice(price)}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>{title || `${getPropertyTypeLabel(property_type)} in ${village_name || tehsil_name}`}</Text>
        
        <Text style={styles.location} numberOfLines={1}>
          📍 {village_name}, {tehsil_name}, {district_name}
        </Text>

        <View style={styles.features}>
          {property_type !== 'land_plot' && (
            <>
              {bedrooms > 0 && (
                <View style={styles.feature}>
                  <Text style={styles.featureText}>🛏️ {bedrooms} BHK</Text>
                </View>
              )}
              {bathrooms > 0 && (
                <View style={styles.feature}>
                  <Text style={styles.featureText}>🚿 {bathrooms}</Text>
                </View>
              )}
            </>
          )}
          <View style={styles.feature}>
            <Text style={styles.featureText}>📐 {total_area} {area_unit || 'sqft'}</Text>
          </View>
          {furnishing_status && (
            <View style={styles.feature}>
              <Text style={styles.featureText}>
                {furnishing_status === 'fully_furnished' ? '🛋️ Fully' : furnishing_status === 'semi_furnished' ? '🛋️ Semi' : '🛋️ No'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.typeLabel}>{getPropertyTypeLabel(property_type)}</Text>
          <Text style={styles.timeAgo}>{timeAgo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const created = new Date(date);
  const diff = Math.floor((now - created) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderText: {
    color: COLORS.textLight,
    marginTop: 8,
    fontSize: FONTS.small,
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeSale: {
    backgroundColor: COLORS.secondary,
  },
  badgeRent: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeFeatured: {
    backgroundColor: COLORS.accent,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceTag: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priceText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: 'bold',
  },
  details: {
    padding: 12,
  },
  title: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  location: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  feature: {
    backgroundColor: COLORS.lightGrey,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featureText: {
    fontSize: FONTS.small,
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: FONTS.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
  },
});

export default PropertyCard;