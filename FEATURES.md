# Brezzy Stirs & Fries Dashboard - Features Guide

## 🎯 Overview
This dashboard provides real-time monitoring and management of customer orders for your food delivery business.

## 📊 Dashboard Statistics

The dashboard displays 6 key metrics that update in real-time:

1. **Total Customers** 👥
   - Total number of registered customers in the database
   - Updates automatically when new customers are added

2. **Orders Today** 📝
   - Number of orders placed today
   - Automatically resets at midnight

3. **Revenue Today** 💰
   - Total revenue generated today
   - Displayed in Nigerian Naira (₦)

4. **Pending Orders** ⏳
   - Orders with status "pending"
   - Helps track orders waiting to be processed

5. **Paid Orders** ✅
   - Orders with payment_status "paid"
   - Shows successful payment confirmations

6. **Delivered Orders** 🚚
   - Orders with status "delivered"
   - Tracks completed deliveries

## 👥 Customer Management

### Features:
- **Search Functionality**: Search customers by name or phone number
- **Customer Information**: View customer details including:
  - Name
  - Phone number
  - Total orders placed
  - Total amount spent
- **Real-time Updates**: Customer list updates automatically when new customers register

### Usage:
1. Type in the search box to filter customers
2. Click on a customer row to view more details (future feature)

## 📝 Orders Management

### Features:
- **Search Orders**: Search by order number
- **Order Information**:
  - Order number
  - Chat ID
  - Order items (truncated preview)
  - Total amount
  - Order status (with color coding)
  - Payment status (with color coding)
  - Order date
- **Status Indicators**:
  - 🟢 Green: Delivered/Paid
  - 🟡 Yellow: Pending
  - 🔵 Blue: Processing
  - 🔴 Red: Unpaid

### Usage:
1. Search for orders using the search box
2. Click on any order row to view detailed information
3. The order details modal shows:
   - Complete order information
   - Full list of items ordered
   - Delivery address
   - Special instructions
   - Payment and order status
   - Order timeline

## 🔔 Notification System

### Features:
- **Real-time Alerts**: Get notified when:
  - A new order is placed
  - Payment status changes to "paid"
- **Sound Notifications**: Toggle sound alerts on/off
- **Notification History**: View last 20 notifications
- **Visual Indicator**: Bell icon with notification counter

### Usage:
1. Click the sound button to toggle sound on/off
2. View notification count on the bell icon
3. Notifications appear in the history panel
4. Toast notifications appear in the top-right corner

## ⚡ Real-time Features

The dashboard uses Supabase real-time subscriptions to provide instant updates:

1. **Customer Updates**: New customers appear immediately
2. **Order Updates**: New orders and status changes reflect in real-time
3. **Dashboard Stats**: All statistics update automatically
4. **Live Indicator**: Green pulsing dot in header shows active connection

## 🎨 Visual Design

### Color Scheme:
- **Primary**: Orange/Red gradient (brand colors)
- **Success**: Green (delivered, paid)
- **Warning**: Yellow (pending)
- **Info**: Blue (processing)
- **Danger**: Red (unpaid, errors)

### Responsive Design:
- Mobile-friendly layout
- Adaptive grid system
- Touch-friendly buttons and interactions

## 🔧 Technical Features

### Performance:
- Optimized database queries
- Real-time subscriptions for instant updates
- Efficient re-rendering with React

### Data Types:
- TypeScript types for type safety
- Proper data validation
- Error handling and loading states

### Database Connection:
- Secure Supabase connection
- Real-time PostgreSQL subscriptions
- Automatic reconnection on connection loss

## 💡 Tips for Best Use

1. **Keep the Dashboard Open**: Leave it running to receive real-time notifications
2. **Enable Sound**: Turn on sound alerts to never miss new orders
3. **Search Efficiently**: Use the search boxes to quickly find specific customers or orders
4. **Monitor Statistics**: Keep an eye on dashboard stats for business insights
5. **Check Order Details**: Click on orders to view complete information before processing

## 🚀 Future Enhancements

Potential features for future versions:
- Order status updates from dashboard
- Customer profile pages
- Sales analytics and charts
- Export data to CSV/PDF
- Multi-user authentication
- Role-based access control
- SMS/Email notifications
- Delivery tracking integration
