# 🏠 Uttarakhand Real Estate Platform

A comprehensive mobile application for property listings exclusively within Uttarakhand, India. Built with React Native (Expo) for the frontend and Node.js + Express + PostgreSQL for the backend.

## 📋 Features

### For Users
- **Browse Properties**: View property listings with detailed information
- **Search & Filter**: Search by location (district, tehsil, village), property type, price range, area, etc.
- **Add Property**: Post properties with cascading location dropdowns (District → Tehsil → Village)
- **Contact Owner**: Direct call or WhatsApp integration
- **Location Pin**: Pin exact property location on map
- **Property Details**: View pricing, area details, amenities, and photos

### For Admins
- **Dashboard**: Overview of all data (districts, tehsils, villages, properties)
- **Data Import**: Bulk import districts, tehsils, and villages from CSV/Excel files
- **Village Management**: Add, edit, or delete villages in the master database
- **Import Logs**: Track all data imports

## 🏗️ System Architecture

### Location Hierarchy (Fixed)
```
State → District → Tehsil → Village
              ↓
        Uttarakhand (only)
```

## 🛠️ Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
3. **Expo CLI** - Install: `npm install -g expo-cli`
4. **Git** - [Download](https://git-scm.com/)
5. **Android Studio** (for Android emulator) or **Expo Go** app on your phone

## 📦 Installation

### Step 1: Clone & Setup PostgreSQL Database

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE property_portal;
```

2. Run the schema:
```bash
psql -U postgres -d property_portal -f database/schema.sql
```

3. Run the seed data (includes all 13 districts, tehsils, and sample villages):
```bash
psql -U postgres -d property_portal -f database/seed.sql
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Edit `.env` file with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=property_portal
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

Start the backend:
```bash
npm run dev
```

The API will run at: `http://localhost:5000`

### Step 3: Mobile App Setup

```bash
cd mobile
npm install
```

Update the API URL in `mobile/src/services/api.js` if needed:
```javascript
const API_URL = 'http://localhost:5000/api'; // For Android emulator use: http://10.0.2.2:5000/api
```

Start the app:
```bash
npx expo start
```

Scan the QR code with **Expo Go** app or press `a` for Android emulator.

## 📱 API Endpoints

### Location API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/districts` | Get all districts |
| GET | `/api/locations/tehsils/:districtId` | Get tehsils by district |
| GET | `/api/locations/villages/:tehsilId` | Get villages by tehsil |
| GET | `/api/locations/search?query=...` | Search all locations |

### Property API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get properties (with filters) |
| GET | `/api/properties/:id` | Get single property |
| POST | `/api/properties` | Create new property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| GET | `/api/properties/stats` | Get statistics |

### Admin API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Dashboard stats |
| POST | `/api/admin/import/districts` | Import districts (CSV/Excel) |
| POST | `/api/admin/import/tehsils` | Import tehsils (CSV/Excel) |
| POST | `/api/admin/import/villages` | Import villages (CSV/Excel) |

## 🗄️ Database Schema

```
districts (id, district_name, state_name)
tehsils   (id, district_id, tehsil_name)
villages  (id, district_id, tehsil_id, village_name)
properties (id, district_id, tehsil_id, village_id, ...rest)
admin_users (id, username, email, password_hash, role)
import_logs (id, import_type, file_name, status, ...)
```

## 🔐 Default Admin Login

- **Username**: `admin`
- **Password**: `admin123`

## 📁 Project Structure

```
├── database/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Seed data (districts, tehsils, villages)
├── backend/
│   ├── .env                # Environment variables
│   ├── package.json
│   └── src/
│       ├── server.js       # Express server entry point
│       ├── config/
│       │   └── database.js # PostgreSQL connection
│       ├── controllers/
│       │   ├── locationController.js
│       │   ├── propertyController.js
│       │   └── adminController.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── upload.js
│       └── routes/
│           ├── locationRoutes.js
│           ├── propertyRoutes.js
│           └── adminRoutes.js
├── mobile/
│   ├── app.json
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── navigation/
│       │   └── AppNavigator.js
│       ├── screens/
│       │   ├── HomeScreen.js
│       │   ├── PropertyDetailScreen.js
│       │   ├── AddPropertyScreen.js
│       │   ├── SearchScreen.js
│       │   └── AdminScreen.js
│       ├── components/
│       │   ├── PropertyCard.js
│       │   └── LocationPicker.js
│       ├── services/
│       │   └── api.js
│       ├── context/
│       │   └── AuthContext.js
│       └── constants/
│           └── index.js
└── SETUP.md
```

## 📸 Screenshots

The app includes:
1. **Home** - Property listings with search bar and quick filters
2. **Search** - Advanced search with filters (type, price, area, bedrooms)
3. **Add Property** - Form with cascading location dropdowns (auto-selected Uttarakhand)
4. **Property Detail** - Full property details with contact options (Call/WhatsApp)
5. **Admin** - Dashboard, CSV/Excel import, and village management

## 📄 CSV Import Format

### Districts File
```csv
district_name
Dehradun
Haridwar
```

### Tehsils File
```csv
district_name,tehsil_name
Dehradun,Vikasnagar
Dehradun,Doiwala
```

### Villages File
```csv
district_name,tehsil_name,village_name
Dehradun,Vikasnagar,Herbertpur
Dehradun,Vikasnagar,Dhakrani