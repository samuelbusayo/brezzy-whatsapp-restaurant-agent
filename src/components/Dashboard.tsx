import React from 'react';


import { useEffect, useState } from 'react';
import { supabase, Order } from '../supabaseClient';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    ordersToday: 0,
    totalRevenue: 0,
    revenueToday: 0,
    pendingOrders: 0,
    paidOrders: 0,
    deliveredOrders: 0,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((s) => ({ ...s, loading: true, error: null }));
        // Fetch total customers
        const { count: customerCount, error: customerError } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true });
        // Fetch all orders for total stats
        const { data: allOrders, error: allOrdersError } = await supabase
          .from('orders')
          .select('*') as { data: Order[] | null; error: any };
        
        // Fetch today's orders
        const today = new Date().toISOString().slice(0, 10);
        const { data: todayOrders, error: todayOrdersError } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', today + 'T00:00:00Z')
          .lte('created_at', today + 'T23:59:59Z') as { data: Order[] | null; error: any };
        
        // Calculate stats
        let totalOrders = 0, totalRevenue = 0, ordersToday = 0, revenueToday = 0;
        let pendingOrders = 0, paidOrders = 0, deliveredOrders = 0;
        
        if (allOrders) {
          totalOrders = allOrders.length;
          totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
          pendingOrders = allOrders.filter((o) => o.status === 'pending').length;
          paidOrders = allOrders.filter((o) => o.payment_status === 'paid').length;
          // Count delivered orders only if delivered_at is not null
          deliveredOrders = allOrders.filter((o) => o.delivered_at !== null).length;
        }
        
        if (todayOrders) {
          ordersToday = todayOrders.length;
          revenueToday = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        }
        setStats({
          totalCustomers: customerCount || 0,
          totalOrders,
          ordersToday,
          totalRevenue,
          revenueToday,
          pendingOrders,
          paidOrders,
          deliveredOrders,
          loading: false,
          error: customerError?.message || allOrdersError?.message || todayOrdersError?.message || null,
        });
      } catch (err: any) {
        setStats((s) => ({ ...s, loading: false, error: err.message }));
      }
    };
    fetchStats();
    // Subscribe to real-time order changes
    const subscription = supabase
      .channel('orders-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStats();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (stats.loading) return <div className="p-3 sm:p-6">Loading dashboard...</div>;
  if (stats.error) return <div className="p-3 sm:p-6 text-red-500 dark:text-red-400">Error: {stats.error}</div>;

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100">Dashboard Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">👥</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Total Customers</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCustomers}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-indigo-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">📦</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Total Orders</span>
          <span className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalOrders}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">📝</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Orders Today</span>
          <span className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.ordersToday}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-emerald-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">💵</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Total Revenue</span>
          <span className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">₦{stats.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-green-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">💰</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Revenue Today</span>
          <span className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">₦{stats.revenueToday.toLocaleString()}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">⌛</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Pending Orders</span>
          <span className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingOrders}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-teal-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">✅</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Paid Orders</span>
          <span className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.paidOrders}</span>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 sm:p-4 flex flex-col items-center border-t-4 border-cyan-500 hover:shadow-xl transition-shadow">
          <span className="text-3xl sm:text-4xl mb-1 sm:mb-2">🚚</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center">Delivered Orders</span>
          <span className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.deliveredOrders}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
