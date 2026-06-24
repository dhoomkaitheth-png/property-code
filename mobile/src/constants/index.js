// Uttarakhand Real Estate Platform - Constants

export const STATE = 'Uttarakhand';

export const PROPERTY_TYPES = [
  { label: 'Residential House', value: 'residential_house' },
  { label: 'Apartment/Flat', value: 'apartment_flat' },
  { label: 'Land/Plot', value: 'land_plot' },
  { label: 'Commercial Shop', value: 'commercial_shop' },
  { label: 'Commercial Office', value: 'commercial_office' },
  { label: 'Farm Land', value: 'farm_land' },
  { label: 'Villa', value: 'villa' },
  { label: 'Other', value: 'other' },
];

export const LISTING_TYPES = [
  { label: 'For Sale', value: 'sell' },
  { label: 'For Rent', value: 'rent' },
  { label: 'For Lease', value: 'lease' },
];

export const PROPERTY_STATUS = [
  { label: 'Available', value: 'available' },
  { label: 'Sold', value: 'sold' },
  { label: 'Rented', value: 'rented' },
  { label: 'Under Contract', value: 'under_contract' },
  { label: 'Inactive', value: 'inactive' },
];

export const FURNISHING_STATUS = [
  { label: 'Fully Furnished', value: 'fully_furnished' },
  { label: 'Semi Furnished', value: 'semi_furnished' },
  { label: 'Unfurnished', value: 'unfurnished' },
];

export const AREA_UNITS = [
  { label: 'Sq. Ft.', value: 'sqft' },
  { label: 'Sq. Mtr.', value: 'sqm' },
  { label: 'Acre', value: 'acre' },
  { label: 'Hectare', value: 'hectare' },
  { label: 'Bigha', value: 'bigha' },
  { label: 'Nali', value: 'nali' },
];

export const PRICE_RANGES = [
  { label: 'Under ₹5 Lakh', min: 0, max: 500000 },
  { label: '₹5 - ₹10 Lakh', min: 500000, max: 1000000 },
  { label: '₹10 - ₹25 Lakh', min: 1000000, max: 2500000 },
  { label: '₹25 - ₹50 Lakh', min: 2500000, max: 5000000 },
  { label: '₹50 Lakh - ₹1 Crore', min: 5000000, max: 10000000 },
  { label: '₹1 - ₹2 Crore', min: 10000000, max: 20000000 },
  { label: 'Above ₹2 Crore', min: 20000000, max: null },
];

export const AREA_RANGES = [
  { label: 'Under 500 sqft', min: 0, max: 500 },
  { label: '500 - 1000 sqft', min: 500, max: 1000 },
  { label: '1000 - 2000 sqft', min: 1000, max: 2000 },
  { label: '2000 - 5000 sqft', min: 2000, max: 5000 },
  { label: 'Above 5000 sqft', min: 5000, max: null },
];

export const BEDROOM_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '1 BHK', value: 1 },
  { label: '2 BHK', value: 2 },
  { label: '3 BHK', value: 3 },
  { label: '4+ BHK', value: 4 },
];

export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'created_at', order: 'DESC' },
  { label: 'Oldest First', value: 'created_at', order: 'ASC' },
  { label: 'Price: Low to High', value: 'price', order: 'ASC' },
  { label: 'Price: High to Low', value: 'price', order: 'DESC' },
  { label: 'Area: Low to High', value: 'total_area', order: 'ASC' },
  { label: 'Area: High to Low', value: 'total_area', order: 'DESC' },
];

export const COLORS = {
  primary: '#1a5276',
  primaryLight: '#2e86c1',
  primaryDark: '#0e2f44',
  secondary: '#27ae60',
  accent: '#f39c12',
  danger: '#e74c3c',
  warning: '#f1c40f',
  background: '#f5f6fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  border: '#dcdde1',
  white: '#ffffff',
  black: '#000000',
  grey: '#95a5a6',
  lightGrey: '#ecf0f1',
  whatsapp: '#25D366',
  phone: '#3498db',
};

export const FONTS = {
  regular: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
  title: 26,
  small: 12,
  tiny: 10,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Amenities checklist
export const AMENITIES = [
  'Parking',
  'Power Backup',
  'Water Supply',
  'Security',
  'Gym',
  'Swimming Pool',
  'Garden',
  'Club House',
  'Children Play Area',
  'Jogging Track',
  'Lift',
  'Rain Water Harvesting',
  'Solar Panel',
  'Gas Pipeline',
  'CCTV',
  'Visitor Parking',
];