

import { useEffect, useState } from 'react';
import { supabase, Order, Customer } from '../supabaseClient';

interface GrowthData {
  value: number;
  growth: number;
  isPositive: boolean;
}

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
    ordersYesterday: 0,
    revenueYesterday: 0,
    ordersThisMonth: 0,
    ordersLastMonth: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    customersThisMonth: 0,
    customersLastMonth: 0,
    loading: true,
    error: null as string | null,
  });

  // Calculate growth percentage
  const calculateGrowth = (current: number, previous: number): GrowthData => {
    if (previous === 0) {
      return { value: current, growth: current > 0 ? 100 : 0, isPositive: current > 0 };
    }
    const growth = ((current - previous) / previous) * 100;
    return { value: current, growth: Math.abs(growth), isPositive: growth >= 0 };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats((s) => ({ ...s, loading: true, error: null }));
        
        // Get date ranges
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        
        const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        // Fetch total customers
        const { count: customerCount, error: customerError } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true });
          
        // Fetch customers this month
        const { count: customersThisMonthCount } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayThisMonth.toISOString());
          
        // Fetch customers last month
        const { count: customersLastMonthCount } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayLastMonth.toISOString())
          .lte('created_at', lastDayLastMonth.toISOString());
        
        // Fetch all orders for total stats
        const { data: allOrders, error: allOrdersError } = await supabase
          .from('orders')
          .select('*') as { data: Order[] | null; error: any };
        
        // Fetch today's orders
        const { data: todayOrders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', todayStr + 'T00:00:00Z')
          .lte('created_at', todayStr + 'T23:59:59Z') as { data: Order[] | null };
          
        // Fetch yesterday's orders
        const { data: yesterdayOrders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', yesterdayStr + 'T00:00:00Z')
          .lte('created_at', yesterdayStr + 'T23:59:59Z') as { data: Order[] | null };
          
        // Fetch this month's orders
        const { data: thisMonthOrders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', firstDayThisMonth.toISOString()) as { data: Order[] | null };
          
        // Fetch last month's orders
        const { data: lastMonthOrders } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', firstDayLastMonth.toISOString())
          .lte('created_at', lastDayLastMonth.toISOString()) as { data: Order[] | null };
        
        // Calculate stats
        let totalOrders = 0, totalRevenue = 0, ordersToday = 0, revenueToday = 0;
        let pendingOrders = 0, paidOrders = 0, deliveredOrders = 0;
        let ordersYesterday = 0, revenueYesterday = 0;
        let ordersThisMonth = 0, ordersLastMonth = 0;
        let revenueThisMonth = 0, revenueLastMonth = 0;
        
        if (allOrders) {
          totalOrders = allOrders.length;
          totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
          pendingOrders = allOrders.filter((o) => o.status === 'pending').length;
          paidOrders = allOrders.filter((o) => o.payment_status === 'paid').length;
          deliveredOrders = allOrders.filter((o) => o.delivered_at !== null).length;
        }
        
        if (todayOrders) {
          ordersToday = todayOrders.length;
          revenueToday = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        }
        
        if (yesterdayOrders) {
          ordersYesterday = yesterdayOrders.length;
          revenueYesterday = yesterdayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        }
        
        if (thisMonthOrders) {
          ordersThisMonth = thisMonthOrders.length;
          revenueThisMonth = thisMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        }
        
        if (lastMonthOrders) {
          ordersLastMonth = lastMonthOrders.length;
          revenueLastMonth = lastMonthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
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
          ordersYesterday,
          revenueYesterday,
          ordersThisMonth,
          ordersLastMonth,
          revenueThisMonth,
          revenueLastMonth,
          customersThisMonth: customersThisMonthCount || 0,
          customersLastMonth: customersLastMonthCount || 0,
          loading: false,
          error: customerError?.message || allOrdersError?.message || null,
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

  // Calculate all growth metrics
  const dailyOrderGrowth = calculateGrowth(stats.ordersToday, stats.ordersYesterday);
  const dailyRevenueGrowth = calculateGrowth(stats.revenueToday, stats.revenueYesterday);
  const monthlyOrderGrowth = calculateGrowth(stats.ordersThisMonth, stats.ordersLastMonth);
  const monthlyRevenueGrowth = calculateGrowth(stats.revenueThisMonth, stats.revenueLastMonth);
  const monthlyCustomerGrowth = calculateGrowth(stats.customersThisMonth, stats.customersLastMonth);

  // Growth indicator component
  const GrowthIndicator = ({ growth, isPositive }: { growth: number; isPositive: boolean }) => (
    <div className={`flex items-center gap-1 text-xs lg:text-sm font-semibold ${
      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    }`}>
      <span>{isPositive ? '↑' : '↓'}</span>
      <span>{growth.toFixed(1)}%</span>
    </div>
  );

  if (stats.loading) return <div className="p-3 sm:p-6">Loading dashboard...</div>;
  if (stats.error) return <div className="p-3 sm:p-6 text-red-500 dark:text-red-400">Error: {stats.error}</div>;

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">Analytics Dashboard</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time business insights</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">
            📅 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Orders Today */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-4 sm:p-5 lg:p-6 border border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-purple-500 rounded-lg p-2">
              <span className="text-2xl">📝</span>
            </div>
            <GrowthIndicator growth={dailyOrderGrowth.growth} isPositive={dailyOrderGrowth.isPositive} />
          </div>
          <h3 className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">Orders Today</h3>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-900 dark:text-purple-100">{stats.ordersToday}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">vs {stats.ordersYesterday} yesterday</p>
        </div>

        {/* Revenue Today */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-4 sm:p-5 lg:p-6 border border-green-200 dark:border-green-700 hover:shadow-xl transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-500 rounded-lg p-2">
              <span className="text-2xl">💰</span>
            </div>
            <GrowthIndicator growth={dailyRevenueGrowth.growth} isPositive={dailyRevenueGrowth.isPositive} />
          </div>
          <h3 className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium mb-1">Revenue Today</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">₦{stats.revenueToday.toLocaleString()}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">vs ₦{stats.revenueYesterday.toLocaleString()} yesterday</p>
        </div>

        {/* Monthly Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-4 sm:p-5 lg:p-6 border border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-500 rounded-lg p-2">
              <span className="text-2xl">📊</span>
            </div>
            <GrowthIndicator growth={monthlyOrderGrowth.growth} isPositive={monthlyOrderGrowth.isPositive} />
          </div>
          <h3 className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Orders This Month</h3>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 dark:text-blue-100">{stats.ordersThisMonth}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">vs {stats.ordersLastMonth} last month</p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 rounded-xl p-4 sm:p-5 lg:p-6 border border-emerald-200 dark:border-emerald-700 hover:shadow-xl transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-emerald-500 rounded-lg p-2">
              <span className="text-2xl">💵</span>
            </div>
            <GrowthIndicator growth={monthlyRevenueGrowth.growth} isPositive={monthlyRevenueGrowth.isPositive} />
          </div>
          <h3 className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">Revenue This Month</h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-900 dark:text-emerald-100">₦{stats.revenueThisMonth.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">vs ₦{stats.revenueLastMonth.toLocaleString()} last month</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">Overall Performance</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center border-t-4 border-blue-500 hover:shadow-2xl transition-shadow min-h-[140px]">
          <span className="text-3xl sm:text-4xl lg:text-5xl mb-2">👥</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center mb-2">Total Customers</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCustomers}</span>
          <GrowthIndicator growth={monthlyCustomerGrowth.growth} isPositive={monthlyCustomerGrowth.isPositive} />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center border-t-4 border-indigo-500 hover:shadow-2xl transition-shadow min-h-[140px]">
          <span className="text-3xl sm:text-4xl lg:text-5xl mb-2">📦</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center mb-2">Total Orders</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalOrders}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center border-t-4 border-yellow-500 hover:shadow-2xl transition-shadow min-h-[140px]">
          <span className="text-3xl sm:text-4xl lg:text-5xl mb-2">⌛</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center mb-2">Pending Orders</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingOrders}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center border-t-4 border-teal-500 hover:shadow-2xl transition-shadow min-h-[140px]">
          <span className="text-3xl sm:text-4xl lg:text-5xl mb-2">✅</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center mb-2">Paid Orders</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-teal-600 dark:text-teal-400">{stats.paidOrders}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center border-t-4 border-cyan-500 hover:shadow-2xl transition-shadow min-h-[140px]">
          <span className="text-3xl sm:text-4xl lg:text-5xl mb-2">🚚</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center mb-2">Delivered Orders</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-600 dark:text-cyan-400">{stats.deliveredOrders}</span>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 sm:p-5 lg:p-6 flex flex-col items-center justify-center border-t-4 border-emerald-500 hover:shadow-2xl transition-shadow min-h-[140px]">
          <span className="text-3xl sm:text-4xl lg:text-5xl mb-2">💵</span>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium text-center mb-2">Total Revenue</span>
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400">₦{stats.totalRevenue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;