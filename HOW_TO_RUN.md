# 🏠 Uttarakhand Real Estate Platform

A production-ready real estate marketplace similar to 99acres, MagicBricks, and Housing.com, focused exclusively on **Uttarakhand, India**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE property_portal;
\q

# Run migrations in order
psql -U postgres -d property_portal -f database/schema.sql
psql -U postgres -d property_portal -f database/schema_v2.sql
psql -U postgres -d property_portal -f database/schema_v3.sql
psql -U postgres -d property_portal -f database/seed.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

The API will be available at `http://localhost:5000`

### 3. Mobile App Setup

```bash
cd mobile
npm install

# Start Expo
npx expo start
```

### 4. Access the Platform

| Component | URL |
|-----------|-----|
| **Website** | http://localhost:5000 |
| **API** | http://localhost:5000/api |
| **Admin Panel** | http://localhost:5000/admin |
| **Mobile App** | Expo Go (scan QR) |

### Default Admin Credentials
- **Username:** admin
- **Password:** admin123
- **Email:** admin@uttarakhandrealestate.com

---

## 📋 Complete API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/fcm-token` | Update FCM token | Yes |

### OTP Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/otp/send` | Send OTP to mobile |
| POST | `/api/otp/verify` | Verify OTP |
| POST | `/api/otp/verify-login` | OTP-based login/register |

### Password Reset
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/password-reset/request` | Request password reset |
| GET | `/api/password-reset/verify/:token` | Verify reset token |
| POST | `/api/password-reset/reset` | Reset password |
| POST | `/api/password-reset/change` | Change password (auth) |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List properties (with filters) |
| GET | `/api/properties/featured` | Featured properties |
| GET | `/api/properties/stats` | Property statistics |
| GET | `/api/properties/:id` | Single property detail |
| POST | `/api/properties` | Create property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Soft delete property |
| POST | `/api/properties/:id/images` | Upload images |

### Locations (Uttarakhand)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations/districts` | All 13 districts |
| GET | `/api/locations/tehsils/:district_id` | Tehsils by district |
| GET | `/api/locations/villages/:tehsil_id` | Villages by tehsil |
| GET | `/api/locations/search` | Search locations |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/favorites` | User's favorites |
| POST | `/api/favorites` | Add to favorites |
| DELETE | `/api/favorites/:property_id` | Remove from favorites |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | User's leads |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id/status` | Update lead status |

### Chat (Real-time via Socket.IO)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | User's conversations |
| GET | `/api/chat/messages/:userId` | Messages with user |
| POST | `/api/chat/send` | Send message |
| PUT | `/api/chat/read/:messageId` | Mark as read |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | User's notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Payments & Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/plans` | Premium plans |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/subscriptions` | User subscriptions |
| GET | `/api/payments/subscriptions/active` | Active subscription |
| GET | `/api/payments/history` | Payment history |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs` | Published blogs |
| GET | `/api/blogs/featured` | Featured blogs |
| GET | `/api/blogs/categories` | Blog categories |
| GET | `/api/blogs/:slug` | Single blog |

### Analytics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/analytics/admin` | Dashboard stats | Admin |
| GET | `/api/analytics/districts` | District-wise stats | Admin |
| GET | `/api/analytics/trends` | Monthly trends | Admin |
| GET | `/api/analytics/seller` | Seller stats | Seller |

### Visits
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/visits` | Schedule visit |
| GET | `/api/visits/my-visits` | My scheduled visits |
| GET | `/api/visits/property/:id` | Property visits |
| PUT | `/api/visits/:id/status` | Update visit status |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Report property |
| GET | `/api/reports` | Admin: all reports |
| PUT | `/api/reports/:id/status` | Admin: update status |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact-enquiries` | Submit enquiry |
| GET | `/api/contact-enquiries` | Admin: all enquiries |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Users list |
| GET | `/api/admin/dashboard` | Dashboard stats |
| PUT | `/api/admin/users/:id/toggle` | Toggle user status |
| POST | `/api/admin/properties/import` | Import properties |
| GET | `/api/admin/properties/export` | Export properties |

---

## 🗄️ Database Schema

### Tables (20+)
- `districts` - 13 Uttarakhand districts
- `tehsils` - All tehsils
- `villages` - All villages
- `properties` - Main property listings
- `property_images` - Property photos
- `property_videos` - Property videos
- `property_documents` - Legal documents
- `users` - Buyers, sellers, agents
- `favorites` - Saved properties
- `leads` - Buyer inquiries
- `chat_messages` - Real-time messages
- `notifications` - Push notifications
- `amenities` - Master amenities list
- `property_amenities` - Property-amenity mapping
- `otp_verification` - OTP codes
- `password_reset_tokens` - Reset tokens
- `premium_plans` - Subscription plans
- `user_subscriptions` - Active subscriptions
- `payments` - Payment records
- `blogs` - Content management
- `search_history` - Search analytics
- `contact_enquiries` - Contact form
- `property_views` - View tracking
- `property_reports` - Abuse reports
- `scheduled_visits` - Site visit bookings
- `agent_profiles` - Agent details
- `admin_users` - Admin accounts
- `import_logs` - Data import logs

---

## 🎨 Features

### Website (EJS Templates)
- ✅ Hero search with filters
- ✅ Featured & recent properties
- ✅ 13 district explorer
- ✅ Property listing (grid/list view)
- ✅ Advanced filters & sorting
- ✅ Property detail with gallery
- ✅ Interactive map (Leaflet)
- ✅ Contact buttons (Call/WhatsApp/Chat)
- ✅ Save favorites
- ✅ Schedule visits
- ✅ Report properties
- ✅ User dashboard
- ✅ Seller dashboard
- ✅ Admin panel
- ✅ Blog system
- ✅ Real-time chat
- ✅ Auth pages (login/register/password reset)
- ✅ Premium subscriptions

### Mobile App (React Native/Expo)
- ✅ Splash screen
- ✅ Auth (login/register/OTP)
- ✅ Bottom navigation (Home/Search/Favorites/Chat/Profile)
- ✅ Property listing with filters
- ✅ Property detail with carousel
- ✅ Google Maps integration
- ✅ Real-time chat
- ✅ Push notifications
- ✅ Seller management
- ✅ Admin panel

### Real-time Features
- ✅ Socket.IO chat
- ✅ Typing indicators
- ✅ Online status
- ✅ Read receipts
- ✅ Firebase Cloud Messaging (FCM)

### Security
- ✅ JWT authentication
- ✅ BCrypt password hashing
- ✅ Rate limiting
- ✅ Input validation
- ✅ SQL injection protection
- ✅ File upload validation

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── server.js          # Express app entry
│   │   ├── config/
│   │   │   └── database.js    # PostgreSQL connection
│   │   ├── controllers/       # Business logic
│   │   │   ├── propertyController.js
│   │   │   ├── userController.js
│   │   │   ├── paymentController.js
│   │   │   ├── blogController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── chatController.js
│   │   │   ├── notificationController.js
│   │   │   ├── otpController.js
│   │   │   ├── passwordResetController.js
│   │   │   ├── contactEnquiryController.js
│   │   │   ├── scheduledVisitController.js
│   │   │   ├── propertyReportController.js
│   │   │   ├── locationController.js
│   │   │   ├── favoriteController.js
│   │   │   ├── leadController.js
│   │   │   ├── adminController.js
│   │   │   └── webController.js
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, upload
│   │   ├── socket/            # Socket.IO chat
│   │   └── utils/             # Helpers
│   ├── templates/             # EJS views
│   │   ├── base.html
│   │   ├── index.html
│   │   ├── properties.html
│   │   ├── property_detail.html
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── blogs/
│   │   └── chat.html
│   ├── public/                # Static assets
│   │   ├── css/style.css
│   │   └── js/main.js
│   └── uploads/               # User uploads
├── mobile/                    # React Native app
│   └── src/
│       ├── App.js
│       ├── screens/
│       ├── components/
│       ├── navigation/
│       ├── services/
│       └── context/
├── database/
│   ├── schema.sql
│   ├── schema_v2.sql
│   ├── schema_v3.sql
│   ├── seed.sql
│   └── migration.sql
└── docs/
```

---

## 🚀 Deployment (Production)

### Ubuntu 24.04 + Nginx

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Clone project
git clone <repo-url>
cd uttarakhand-realestate

# Setup database
sudo -u postgres psql -c "CREATE DATABASE property_portal;"
sudo -u postgres psql -d property_portal -f database/schema.sql
sudo -u postgres psql -d property_portal -f database/schema_v2.sql
sudo -u postgres psql -d property_portal -f database/schema_v3.sql
sudo -u postgres psql -d property_portal -f database/seed.sql

# Install PM2
sudo npm install -g pm2

# Start backend
cd backend
npm install
pm2 start src/server.js --name "uttarakhand-api"
pm2 save
pm2 startup

# Configure Nginx
sudo nano /etc/nginx/sites-available/uttarakhand
# Add reverse proxy config (see below)

# SSL with Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads {
        alias /path/to/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📊 Performance Optimizations

- **Database Indexes**: All foreign keys, search fields, and sort columns are indexed
- **Full-Text Search**: GIN index on title/description
- **Pagination**: All list endpoints support page/limit
- **Connection Pooling**: PostgreSQL pool with 20 max connections
- **Caching**: Static assets with 30-day cache
- **Optimized for**: 100,000+ properties and 50,000+ users

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 14+ |
| **Web Frontend** | EJS, Bootstrap 5, JavaScript |
| **Mobile** | React Native, Expo |
| **Real-time** | Socket.IO |
| **Auth** | JWT, BCrypt |
| **Maps** | Leaflet (Web), Google Maps (Mobile) |
| **Payments** | Razorpay |
| **Notifications** | Firebase Cloud Messaging |
| **Deployment** | PM2, Nginx, Let's Encrypt |

---

## 📝 License

MIT License - Uttarakhand Real Estate Platform