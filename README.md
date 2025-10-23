# Brezzy Stirs & Fries - Order Management Dashboard

A real-time customer order management dashboard for "Brezzy Stirs & Fries" food delivery business. This web application connects to a Supabase PostgreSQL database and displays customer information and order statuses in real-time.

## Features

- 📊 **Real-time Dashboard**: View live statistics including total customers, today's orders, revenue, pending orders, paid orders, and delivered orders
- 👥 **Customer Management**: Browse and search through customer database with total orders and spending information
- 📝 **Order Management**: Track all orders with real-time updates, search functionality, and detailed order views
- 🔔 **Notification System**: Get instant notifications for new orders and payment status changes with sound alerts
- 📦 **Order Details**: View comprehensive order information including items, delivery address, payment status, and more
- ⚡ **Live Updates**: Automatic real-time synchronization with Supabase database using subscriptions

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Build Tool**: Vite
- **Hosting**: Vercel (Serverless)
- **Notifications**: React Toastify

## Database Schema

### Customers Table
- `id`: UUID (primary key)
- `chat_id`: string
- `phone_number`: string
- `name`: string
- `email`: string
- `total_orders`: number
- `total_spent`: number
- `created_at`: timestamp
- `updated_at`: timestamp

### Orders Table
- `id`: UUID (primary key)
- `chat_id`: string
- `order_number`: string
- `items`: JSON (array of order items)
- `total_amount`: number
- `status`: string (pending, processing, delivered, etc.)
- `payment_status`: string (paid, unpaid)
- `referencenumber`: string
- `delivery_address`: string
- `special_instructions`: string
- `created_at`: timestamp
- `delivered_at`: timestamp (nullable)

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account with database already set up

### Installation

1. Navigate to the project directory:
```bash
cd brexxy
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
The `.env` file should contain:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start webhook server (local development only)

## 🚀 Deploying to Vercel

This app is ready for serverless deployment on Vercel! Follow these quick steps:

### Quick Deploy (5 minutes)

1. **Push to GitHub** (already done ✅)
2. **Import to Vercel**: https://vercel.com/new
3. **Configure Settings**:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add Environment Variables**:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. **Deploy!**

### 📚 Deployment Guides

For detailed deployment instructions, see:
- **📖 Quick Start**: [`QUICK_START.md`](./QUICK_START.md) - Deploy in 5 minutes
- **✅ Deployment Checklist**: [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) - Step-by-step guide
- **📋 Full Guide**: [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) - Complete documentation
- **🏗️ Architecture**: [`ARCHITECTURE.md`](./ARCHITECTURE.md) - System overview

### Webhook Endpoint

After deployment, your webhook will be available at:
```
https://your-app.vercel.app/api/webhook
```

Use this URL in your WhatsApp Business API or messaging platform configuration.

## Features in Detail

### Dashboard Overview
- Real-time statistics cards showing key metrics
- Automatic updates when database changes
- Visual indicators with color-coded status badges

### Customer List
- Searchable customer database
- Displays customer name, phone, total orders, and total spent
- Real-time updates when new customers are added

### Orders Management
- Comprehensive order listing with search functionality
- Color-coded status badges for order and payment status
- Click on any order to view detailed information
- Real-time notifications for new orders and payment updates

### Notification System
- Toast notifications for important events
- Notification history panel
- Toggle sound alerts on/off
- Visual notification counter

## Real-time Subscriptions

The application uses Supabase real-time subscriptions to listen for:
- New customer additions
- Customer updates
- New order placements
- Order status changes
- Payment status updates

## Customization

You can customize the application by:
- Modifying the color scheme in Tailwind classes
- Adjusting the notification sound URL in `NotificationSystem.tsx`
- Adding new dashboard statistics in `Dashboard.tsx`
- Extending the database schema and TypeScript types in `supabaseClient.ts`

## License

MIT

## Support

For issues or questions, please contact the development team.
