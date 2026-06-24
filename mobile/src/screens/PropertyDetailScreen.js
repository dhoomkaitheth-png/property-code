import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert, Share } from 'react-native';
import { propertyAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../constants';

const PropertyDetailScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      const response = await propertyAPI.getProperty(propertyId);
      setProperty(response.data.data);
    } catch (error) {
      console.error('Error loading property:', error);
      Alert.alert('Error', 'Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount) => {
    if (!amount) return 'N/A';
    if (amount >= 10000000) {
      return `₹ ${(amount / 10000000).toFixed(2)} Crore`;
    } else if (amount >= 100000) {
      return `₹ ${(amount / 100000).toFixed(2)} Lakh`;
    } else if (amount >= 1000) {
      return `₹ ${(amount / 1000).toFixed(1)}K`;
    }
    return `₹ ${amount}`;
  };

  const handleCall = () => {
    if (property?.owner_phone) {
      Linking.openURL(`tel:${property.owner_phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (property?.owner_phone) {
      const message = `Hi, I'm interested in your property: ${property.title || 'Property in ' + property.village_name}`;
      Linking.openURL(`https://wa.me/91${property.owner_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this property in Uttarakhand!\n\n${property.title || 'Property'}\n💰 ${formatPrice(property.price)}\n📍 ${property.village_name}, ${property.tehsil_name}, ${property.district_name}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.actionTitle}>Property Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{property.title || `${property.property_type?.replace('_', ' ')} in ${property.village_name}`}</Text>
        <Text style={styles.location}>📍 {property.village_name}, {property.tehsil_name}, {property.district_name}, Uttarakhand</Text>
        {property.pincode && <Text style={styles.pincode}>📮 Pin: {property.pincode}</Text>}
      </View>

      {/* Price Card */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
        </View>
        {property.price_per_sqft && (
          <Text style={styles.pricePerSqft}>₹ {property.price_per_sqft}/sqft</Text>
        )}
        <View style={styles.priceBadges}>
          <View style={[styles.badge, property.listing_type === 'sell' ? styles.saleBadge : styles.rentBadge]}>
            <Text style={styles.badgeText}>
              {property.listing_type === 'sell' ? 'FOR SALE' : property.listing_type === 'rent' ? 'FOR RENT' : 'FOR LEASE'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.badgeText}>
              {property.property_type?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {property.is_price_negotiable && (
            <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.badgeText}>NEGOTIABLE</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{property.total_area}</Text>
          <Text style={styles.statLabel}>Area ({property.area_unit})</Text>
        </View>
        {property.bedrooms > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.bedrooms}</Text>
            <Text style={styles.statLabel}>Bedrooms</Text>
          </View>
        )}
        {property.bathrooms > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.bathrooms}</Text>
            <Text style={styles.statLabel}>Bathrooms</Text>
          </View>
        )}
        {property.balconies > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.balconies}</Text>
            <Text style={styles.statLabel}>Balconies</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {property.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>
      )}

      {/* Area Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Area Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Area</Text>
          <Text style={styles.detailValue}>{property.total_area} {property.area_unit}</Text>
        </View>
        {property.built_up_area && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Built-up Area</Text>
            <Text style={styles.detailValue}>{property.built_up_area} {property.area_unit}</Text>
          </View>
        )}
        {property.carpet_area && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Carpet Area</Text>
            <Text style={styles.detailValue}>{property.carpet_area} {property.area_unit}</Text>
          </View>
        )}
        {property.plot_area && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plot Area</Text>
            <Text style={styles.detailValue}>{property.plot_area} {property.area_unit}</Text>
          </View>
        )}
      </View>

      {/* Furnishing & Floors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Details</Text>
        {property.furnishing_status && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Furnishing</Text>
            <Text style={styles.detailValue}>
              {property.furnishing_status === 'fully_furnished' ? 'Fully Furnished' :
               property.furnishing_status === 'semi_furnished' ? 'Semi Furnished' : 'Unfurnished'}
            </Text>
          </View>
        )}
        {property.floors > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Floor</Text>
            <Text style={styles.detailValue}>{property.floors} of {property.total_floors || property.floors}</Text>
          </View>
        )}
        {property.year_built && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Year Built</Text>
            <Text style={styles.detailValue}>{property.year_built}</Text>
          </View>
        )}
        {property.possession_date && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Possession</Text>
            <Text style={styles.detailValue}>{new Date(property.possession_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
        )}
      </View>

      {/* Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address</Text>
        <Text style={styles.address}>{property.local_address}</Text>
        {property.full_address && <Text style={styles.address}>{property.full_address}</Text>}
      </View>

      {/* Contact Section */}
      {property.owner_phone && (
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Owner</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Text style={styles.callIcon}>📞</Text>
              <Text style={styles.callText}>Call</Text>
              <Text style={styles.phoneNumber}>{property.owner_phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
              <Text style={styles.whatsappIcon}>💬</Text>
              <Text style={styles.whatsappText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
          {property.owner_name && <Text style={styles.ownerName}>Owner: {property.owner_name}</Text>}
          {property.owner_email && <Text style={styles.ownerEmail}>{property.owner_email}</Text>}
        </View>
      )}

      {/* Map Placeholder */}
      {property.latitude && property.longitude && (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>📍 {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}</Text>
        </View>
      )}

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
  },
  errorText: {
    color: COLORS.textLight,
    fontSize: FONTS.medium,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  actionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  shareIcon: {
    fontSize: 22,
  },
  titleSection: {
    padding: 16,
    backgroundColor: COLORS.surface,
    marginBottom: 1,
  },
  title: {
    fontSize: FONTS.xlarge,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  location: {
    fontSize: FONTS.regular,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  pincode: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  priceCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FONTS.regular,
    color: COLORS.textLight,
  },
  price: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  pricePerSqft: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: 4,
  },
  priceBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleBadge: {
    backgroundColor: COLORS.secondary,
  },
  rentBadge: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 1,
    gap: 8,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.lightGrey,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.large,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
  },
  detailLabel: {
    fontSize: FONTS.regular,
    color: COLORS.textLight,
    flex: 1,
  },
  detailValue: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  address: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginVertical: 1,
  },
  contactTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: COLORS.phone,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  callText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.small,
  },
  phoneNumber: {
    color: COLORS.white,
    fontSize: FONTS.tiny,
    marginTop: 2,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: COLORS.whatsapp,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  whatsappIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  whatsappText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.small,
  },
  ownerName: {
    fontSize: FONTS.regular,
    color: COLORS.text,
    marginBottom: 4,
  },
  ownerEmail: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  mapPlaceholder: {
    backgroundColor: COLORS.surface,
    padding: 20,
    alignItems: 'center',
    marginVertical: 1,
  },
  mapIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  mapText: {
    fontSize: FONTS.regular,
    color: COLORS.text,
  },
});

export default PropertyDetailScreen;