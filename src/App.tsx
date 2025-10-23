import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import OrdersManagement from './components/OrdersManagement';
import NotificationSystem from './components/NotificationSystem';
import { Order } from './supabaseClient';

function App() {
  const [selectedOrderForNotification, setSelectedOrderForNotification] = useState<Order | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🍔</div>
              <div>
                <h1 className="text-2xl font-bold">Brezzy Stirs & Fries</h1>
                <p className="text-sm text-orange-100">Order Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
          </div>
        </div>
      </header>
      
      <NotificationSystem onViewOrder={setSelectedOrderForNotification} />
      <Dashboard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
        <CustomerList />
        <OrdersManagement externalSelectedOrder={selectedOrderForNotification} onClearExternalOrder={() => setSelectedOrderForNotification(null)} />
      </div>
    </div>
  );
}

export default App;
