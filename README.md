# ISFamilyHub - Family Management Web Application

A private, family-only household management web application built with the MERN stack (MongoDB, Express, React, Node.js). Features clean UI/UX with shadcn/ui, Tailwind CSS, and Radix UI components.

## Features

- **Expenses & Income Tracking** - Comprehensive financial analytics with charts and filtering
- **Bills Management** - Checklist-based bill tracking with recurring payments
- **Grocery Lists** - Simple checklist for shopping items
- **Meal Planning** - Weekly meal planner with breakfast, lunch, and dinner
- **Document Vault** - Secure document storage with expiry tracking
- **Inventory Management** - Item location tracking system
- **Admin Authentication** - JWT-based authentication for Farhan and Sheerin only
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with HTTP-only cookies
- **Cloudinary** for document storage
- **Zod** for input validation
- **bcryptjs** for password hashing

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Axios** for API communication

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (URI provided in project)
- Cloudinary account for document storage (optional)

### Installation

1. **Clone and install dependencies:**
```bash
cd "ISFamilyHub-Web App"
npm run install-all
```

2. **Configure environment variables:**

Edit `server/.env` and update:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

3. **Initialize database with admin users:**
```bash
cd server
node init-db.js
```

4. **Start the application:**
```bash
# From root directory
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend application on http://localhost:3000

### Default Admin Credentials
- **Username:** `Farhan` | **Password:** `Farhan8776`
- **Username:** `Sheerin` | **Password:** `Shafan`

**⚠️ Important:** Change these passwords in production!

## Usage

### For Normal Users (Family Members)
- Visit http://localhost:3000
- Access all modules in read-only mode
- View expenses, bills, groceries, meal plans, documents, and inventory
- Download documents from the vault

### For Admin Users (Farhan & Sheerin)
- Visit http://localhost:3000?admin=true to access login
- Full CRUD access to all modules
- Add/edit/delete expenses and income
- Manage bills and mark as paid
- Update grocery lists and meal plans
- Upload and manage documents
- Maintain inventory records

## Project Structure

```
ISFamilyHub-Web App/
├── server/                 # Backend Express.js application
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API route handlers
│   ├── middleware/        # Authentication middleware
│   ├── utils/             # Validation schemas
│   └── index.js           # Server entry point
├── client/                # Frontend Next.js application
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and API client
│   └── hooks/             # Custom React hooks
└── package.json           # Root package with scripts
```

## Key Features Explained

### Authentication System
- **Admin-only authentication** using JWT tokens in HTTP-only cookies
- **Normal users** access the app directly without login (read-only)
- **Conditional UI rendering** - admin controls hidden from normal users
- **Secure routes** - all write operations require admin authentication

### Expense Management
- **Dual-purpose tracking** for both expenses and income
- **Advanced filtering** by date, category, amount, payment method
- **Real-time analytics** with monthly/weekly/yearly breakdowns
- **Category insights** showing highest spending areas
- **Visual charts** for trend analysis

### Bills System
- **Checklist approach** rather than financial ledger
- **Recurring bill automation** - creates next bill when marked paid
- **Due date tracking** with visual indicators
- **Smooth animations** for checkbox interactions

### Document Vault
- **Secure cloud storage** via Cloudinary integration
- **Metadata management** with owner, type, expiry tracking
- **Search functionality** across titles and notes
- **Expiry notifications** for important documents
- **Access control** - admins upload, everyone can download

### Design Philosophy
- **Calm and professional** interface suitable for all ages
- **Minimal friction** with smooth animations and transitions
- **Accessibility-first** using Radix UI primitives
- **Mobile-responsive** with adaptive layouts
- **Performance-optimized** with Next.js server rendering

## Development

### Adding New Features
1. Create backend model in `server/models/`
2. Add API routes in `server/routes/`
3. Update validation schemas in `server/utils/validation.js`
4. Create frontend components in `client/components/`
5. Add API calls to `client/lib/api.ts`
6. Create pages in `client/app/`

### Database Schema
All collections follow consistent patterns:
- **Timestamps** - `createdAt` and `updatedAt` on all documents
- **User tracking** - `addedBy`, `uploadedBy`, `lastUpdatedBy` fields
- **Soft deletes** - `isArchived` flags instead of hard deletes
- **Indexing** - Optimized queries with proper indexes

## Security Considerations

- **Environment variables** for sensitive configuration
- **Input validation** using Zod schemas
- **Rate limiting** to prevent abuse
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Password hashing** with bcryptjs
- **JWT tokens** in HTTP-only cookies

## Deployment

### Production Checklist
1. Update JWT_SECRET in production environment
2. Change default admin passwords
3. Configure production MongoDB URI
4. Set up Cloudinary for document storage
5. Update CORS origins for production domain
6. Enable HTTPS for secure cookie transmission
7. Set NODE_ENV=production

### Recommended Hosting
- **Backend:** Railway, Render, or Heroku
- **Frontend:** Vercel or Netlify
- **Database:** MongoDB Atlas (already configured)
- **File Storage:** Cloudinary (already integrated)

## Support

This is a private family application. For technical issues:
1. Check server and client logs
2. Verify environment variables
3. Ensure MongoDB connection
4. Test API endpoints directly

## License

Private family use only. Not for commercial distribution.