import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import OrdersManagement from './components/OrdersManagement';
import NotificationSystem from './components/NotificationSystem';
import { Order } from './supabaseClient';
import { useTheme } from './ThemeContext';

function App() {
  const [selectedOrderForNotification, setSelectedOrderForNotification] = useState<Order | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="text-2xl sm:text-3xl">🍔</div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Brezzy Stirs & Fries</h1>
                <p className="text-xs sm:text-sm text-orange-100 hidden sm:block">Order Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors backdrop-blur-sm"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <span className="text-xl">☀️</span>
                ) : (
                  <span className="text-xl">🌙</span>
                )}
              </button>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live</span>
              </div>
              <NotificationSystem onViewOrder={setSelectedOrderForNotification} />
            </div>
          </div>
        </div>
      </header>
      <Dashboard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6 max-w-7xl mx-auto">
        <CustomerList />
        <OrdersManagement externalSelectedOrder={selectedOrderForNotification} onClearExternalOrder={() => setSelectedOrderForNotification(null)} />
      </div>
    </div>
  );
}

export default App;
