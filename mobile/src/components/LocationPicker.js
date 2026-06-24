import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { locationAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../constants';

const LocationPicker = ({ selectedDistrict, selectedTehsil, selectedVillage, onDistrictChange, onTehsilChange, onVillageChange }) => {
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadTehsils(selectedDistrict);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedTehsil) {
      loadVillages(selectedTehsil);
    }
  }, [selectedTehsil]);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getDistricts();
      setDistricts(response.data.data);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTehsils = async (districtId) => {
    try {
      setLoading(true);
      const response = await locationAPI.getTehsils(districtId);
      setTehsils(response.data.data);
    } catch (error) {
      console.error('Error loading tehsils:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVillages = async (tehsilId) => {
    try {
      setLoading(true);
      const response = await locationAPI.getVillages(tehsilId);
      setVillages(response.data.data);
    } catch (error) {
      console.error('Error loading villages:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setSearchQuery('');
    let data = [];
    switch (type) {
      case 'district':
        data = districts;
        break;
      case 'tehsil':
        data = tehsils;
        break;
      case 'village':
        data = villages;
        break;
    }
    setModalData(data);
    setModalVisible(true);
  };

  const handleSelect = (item) => {
    switch (modalType) {
      case 'district':
        onDistrictChange(item);
        break;
      case 'tehsil':
        onTehsilChange(item);
        break;
      case 'village':
        onVillageChange(item);
        break;
    }
    setModalVisible(false);
  };

  const filteredData = modalData.filter(item => {
    const name = item.district_name || item.tehsil_name || item.village_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getSelectedName = () => {
    const parts = [];
    if (selectedDistrict) parts.push(selectedDistrict.district_name);
    if (selectedTehsil) parts.push(selectedTehsil.tehsil_name);
    if (selectedVillage) parts.push(selectedVillage.village_name);
    return parts.length > 0 ? parts.join(' → ') : 'Uttarakhand';
  };

  const getButtonTitle = (type, item) => {
    switch (type) {
      case 'district': return item?.district_name || 'Select District';
      case 'tehsil': return item?.tehsil_name || 'Select Tehsil';
      case 'village': return item?.village_name || 'Select Village';
      default: return 'Select';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stateLabel}>📍 Uttarakhand</Text>

      <TouchableOpacity
        style={[styles.pickerButton, selectedDistrict && styles.pickerButtonSelected]}
        onPress={() => openModal('district')}
        disabled={districts.length === 0}
      >
        <Text style={[styles.pickerButtonText, selectedDistrict && styles.pickerButtonTextSelected]}>
          {getButtonTitle('district', selectedDistrict)}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.pickerButton, selectedTehsil && styles.pickerButtonSelected]}
        onPress={() => openModal('tehsil')}
        disabled={!selectedDistrict || tehsils.length === 0}
      >
        <Text style={[styles.pickerButtonText, selectedTehsil && styles.pickerButtonTextSelected]}>
          {getButtonTitle('tehsil', selectedTehsil)}
        </Text>
        {selectedDistrict && <Text style={styles.arrow}>▼</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.pickerButton, selectedVillage && styles.pickerButtonSelected]}
        onPress={() => openModal('village')}
        disabled={!selectedTehsil || villages.length === 0}
      >
        <Text style={[styles.pickerButtonText, selectedVillage && styles.pickerButtonTextSelected]}>
          {getButtonTitle('village', selectedVillage)}
        </Text>
        {selectedTehsil && <Text style={styles.arrow}>▼</Text>}
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {modalType?.charAt(0).toUpperCase() + modalType?.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${modalType}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textLight}
            />

            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const name = item.district_name || item.tehsil_name || item.village_name;
                  return (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.modalItemText}>{name}</Text>
                      {item.state_name && (
                        <Text style={styles.modalItemSubText}>{item.state_name}</Text>
                      )}
                      {item.tehsil_name && !item.district_name && (
                        <Text style={styles.modalItemSubText}>
                          {(selectedTehsil && modalType === 'village') ? item.tehsil_name || '' : ''}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {searchQuery ? 'No matching items found' : 'No items available'}
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: FONTS.medium,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  pickerButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f7ff',
  },
  pickerButtonText: {
    fontSize: FONTS.regular,
    color: COLORS.textLight,
  },
  pickerButtonTextSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  arrow: {
    color: COLORS.textLight,
    fontSize: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.large,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 20,
    color: COLORS.textLight,
    padding: 4,
  },
  searchInput: {
    margin: 12,
    padding: 12,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 8,
    fontSize: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loader: {
    padding: 30,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey,
    marginHorizontal: 12,
  },
  modalItemText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
  modalItemSubText: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: FONTS.regular,
  },
});

export default LocationPicker;