import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import OrdersManagement from './components/OrdersManagement';
import NotificationSystem from './components/NotificationSystem';
import Sidebar from './components/Sidebar';
import { Order } from './supabaseClient';
import { useTheme } from './ThemeContext';

function App() {
  const [selectedOrderForNotification, setSelectedOrderForNotification] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-700 text-white shadow-lg sticky top-0 z-40">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button & Title */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="text-xl sm:text-2xl">🍔</div>
                  <div>
                    <h1 className="text-base sm:text-xl font-bold">Brezzy Stirs & Fries</h1>
                    <p className="text-xs text-orange-100 hidden sm:block">Order Management Dashboard</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1.5 sm:p-2 rounded-lg transition-colors backdrop-blur-sm"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <span className="text-base sm:text-xl">☀️</span>
                  ) : (
                    <span className="text-base sm:text-xl">🌙</span>
                  )}
                </button>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Live</span>
                </div>
                <NotificationSystem onViewOrder={setSelectedOrderForNotification} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'customers' && (
            <div className="p-3 sm:p-6 max-w-7xl mx-auto">
              <CustomerList />
            </div>
          )}
          {currentPage === 'orders' && (
            <div className="p-3 sm:p-6 max-w-7xl mx-auto">
              <OrdersManagement
                externalSelectedOrder={selectedOrderForNotification}
                onClearExternalOrder={() => setSelectedOrderForNotification(null)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
