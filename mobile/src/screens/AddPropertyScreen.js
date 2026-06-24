import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import LocationPicker from '../components/LocationPicker';
import { propertyAPI } from '../services/api';
import { COLORS, FONTS, PROPERTY_TYPES, LISTING_TYPES, FURNISHING_STATUS, AREA_UNITS } from '../constants';

const AddPropertyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedTehsil, setSelectedTehsil] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    property_type: 'residential_house',
    listing_type: 'sell',
    price: '',
    is_price_negotiable: true,
    total_area: '',
    area_unit: 'sqft',
    plot_area: '',
    built_up_area: '',
    carpet_area: '',
    bedrooms: '',
    bathrooms: '',
    balconies: '',
    floors: '1',
    total_floors: '1',
    furnishing_status: '',
    local_address: '',
    full_address: '',
    pincode: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    year_built: '',
  });

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!selectedDistrict) { Alert.alert('Error', 'Please select a district'); return false; }
    if (!selectedTehsil) { Alert.alert('Error', 'Please select a tehsil'); return false; }
    if (!selectedVillage) { Alert.alert('Error', 'Please select a village'); return false; }
    if (!form.local_address.trim()) { Alert.alert('Error', 'Please enter local address'); return false; }
    if (!form.title.trim() || form.title.length < 5) { Alert.alert('Error', 'Title must be at least 5 characters'); return false; }
    if (!form.price || parseFloat(form.price) <= 0) { Alert.alert('Error', 'Please enter a valid price'); return false; }
    if (!form.total_area || parseFloat(form.total_area) <= 0) { Alert.alert('Error', 'Please enter a valid total area'); return false; }
    if (!form.owner_phone || form.owner_phone.length < 10) { Alert.alert('Error', 'Please enter a valid phone number'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        district_id: selectedDistrict.id,
        tehsil_id: selectedTehsil.id,
        village_id: selectedVillage.id,
        local_address: form.local_address,
        full_address: form.full_address || undefined,
        pincode: form.pincode || undefined,
        title: form.title,
        description: form.description || undefined,
        property_type: form.property_type,
        listing_type: form.listing_type,
        price: parseFloat(form.price),
        is_price_negotiable: form.is_price_negotiable,
        total_area: parseFloat(form.total_area),
        area_unit: form.area_unit,
        plot_area: form.plot_area ? parseFloat(form.plot_area) : undefined,
        built_up_area: form.built_up_area ? parseFloat(form.built_up_area) : undefined,
        carpet_area: form.carpet_area ? parseFloat(form.carpet_area) : undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : 0,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : 0,
        balconies: form.balconies ? parseInt(form.balconies) : 0,
        floors: form.floors ? parseInt(form.floors) : 1,
        total_floors: form.total_floors ? parseInt(form.total_floors) : 1,
        furnishing_status: form.furnishing_status || undefined,
        owner_name: form.owner_name || undefined,
        owner_phone: form.owner_phone,
        owner_email: form.owner_email || undefined,
        year_built: form.year_built ? parseInt(form.year_built) : undefined,
      };

      await propertyAPI.createProperty(payload);
      Alert.alert('Success', 'Property listed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create property';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Property</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Location</Text>
        <Text style={styles.stateAuto}>State: Uttarakhand (auto-selected)</Text>
        <LocationPicker
          selectedDistrict={selectedDistrict}
          selectedTehsil={selectedTehsil}
          selectedVillage={selectedVillage}
          onDistrictChange={setSelectedDistrict}
          onTehsilChange={setSelectedTehsil}
          onVillageChange={setSelectedVillage}
        />
        <TextInput
          style={styles.input}
          placeholder="Local Address *"
          value={form.local_address}
          onChangeText={(v) => updateForm('local_address', v)}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Full Address (optional)"
          value={form.full_address}
          onChangeText={(v) => updateForm('full_address', v)}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={form.pincode}
          onChangeText={(v) => updateForm('pincode', v)}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      {/* Basic Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Basic Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Title * (e.g., 3 BHK House in Haldwani)"
          value={form.title}
          onChangeText={(v) => updateForm('title', v)}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={form.description}
          onChangeText={(v) => updateForm('description', v)}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Property Type</Text>
        <View style={styles.optionsGrid}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[styles.optionChip, form.property_type === type.value && styles.optionChipSelected]}
              onPress={() => updateForm('property_type', type.value)}
            >
              <Text style={[styles.optionText, form.property_type === type.value && styles.optionTextSelected]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Listing Type</Text>
        <View style={styles.optionsRow}>
          {LISTING_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[styles.optionBtn, form.listing_type === type.value && styles.optionBtnSelected]}
              onPress={() => updateForm('listing_type', type.value)}
            >
              <Text style={[styles.optionBtnText, form.listing_type === type.value && styles.optionBtnTextSelected]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Pricing</Text>
        <TextInput
          style={styles.input}
          placeholder="Price * (in ₹)"
          value={form.price}
          onChangeText={(v) => updateForm('price', v)}
          keyboardType="numeric"
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Price Negotiable</Text>
          <Switch
            value={form.is_price_negotiable}
            onValueChange={(v) => updateForm('is_price_negotiable', v)}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={form.is_price_negotiable ? COLORS.primary : COLORS.grey}
          />
        </View>
      </View>

      {/* Area Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📐 Area Details</Text>
        <View style={styles.inputRow}>
          <View style={{ flex: 2 }}>
            <TextInput
              style={styles.input}
              placeholder="Total Area *"
              value={form.total_area}
              onChangeText={(v) => updateForm('total_area', v)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.optionsRow}>
              {AREA_UNITS.slice(0, 3).map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  style={[styles.smallOption, form.area_unit === unit.value && styles.optionBtnSelected]}
                  onPress={() => updateForm('area_unit', unit.value)}
                >
                  <Text style={[styles.smallOptionText, form.area_unit === unit.value && styles.optionBtnTextSelected]}>
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Built-up Area (optional)"
          value={form.built_up_area}
          onChangeText={(v) => updateForm('built_up_area', v)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Carpet Area (optional)"
          value={form.carpet_area}
          onChangeText={(v) => updateForm('carpet_area', v)}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Plot Area (optional)"
          value={form.plot_area}
          onChangeText={(v) => updateForm('plot_area', v)}
          keyboardType="numeric"
        />
      </View>

      {/* Rooms */}
      {form.property_type !== 'land_plot' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛏️ Rooms</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                placeholder="Bedrooms"
                value={form.bedrooms}
                onChangeText={(v) => updateForm('bedrooms', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={styles.input}
                placeholder="Bathrooms"
                value={form.bathrooms}
                onChangeText={(v) => updateForm('bathrooms', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={styles.input}
                placeholder="Balconies"
                value={form.balconies}
                onChangeText={(v) => updateForm('balconies', v)}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                placeholder="Floor"
                value={form.floors}
                onChangeText={(v) => updateForm('floors', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TextInput
                style={styles.input}
                placeholder="Total Floors"
                value={form.total_floors}
                onChangeText={(v) => updateForm('total_floors', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Furnishing</Text>
          <View style={styles.optionsRow}>
            {FURNISHING_STATUS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.optionBtn, form.furnishing_status === f.value && styles.optionBtnSelected]}
                onPress={() => updateForm('furnishing_status', f.value)}
              >
                <Text style={[styles.optionBtnText, form.furnishing_status === f.value && styles.optionBtnTextSelected]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Contact Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Owner Name (optional)"
          value={form.owner_name}
          onChangeText={(v) => updateForm('owner_name', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          value={form.owner_phone}
          onChangeText={(v) => updateForm('owner_phone', v)}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="Email (optional)"
          value={form.owner_email}
          onChangeText={(v) => updateForm('owner_email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Year Built (optional)"
          value={form.year_built}
          onChangeText={(v) => updateForm('year_built', v)}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitText}>🏠 List Property</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
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
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  stateAuto: {
    fontSize: FONTS.small,
    color: COLORS.secondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  label: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    padding: 12,
    fontSize: FONTS.regular,
    color: COLORS.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.lightGrey,
  },
  optionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: FONTS.small,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.white,
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.lightGrey,
  },
  optionBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionBtnText: {
    fontSize: FONTS.small,
    color: COLORS.text,
  },
  optionBtnTextSelected: {
    color: COLORS.white,
  },
  smallOption: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.lightGrey,
  },
  smallOptionText: {
    fontSize: 11,
    color: COLORS.text,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: FONTS.regular,
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: COLORS.white,
    fontSize: FONTS.large,
    fontWeight: '600',
  },
});

export default AddPropertyScreen;