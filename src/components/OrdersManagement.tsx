
import React, { useEffect, useState } from 'react';
import { supabase, Order } from '../supabaseClient';
import OrderDetailsModal from './OrderDetailsModal';

interface Props {
  externalSelectedOrder?: Order | null;
  onClearExternalOrder?: () => void;
}

const OrdersManagement: React.FC<Props> = ({ externalSelectedOrder, onClearExternalOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Handle external order selection from notifications
  useEffect(() => {
    if (externalSelectedOrder) {
      setSelectedOrder(externalSelectedOrder);
    }
  }, [externalSelectedOrder]);

  const handleCloseModal = () => {
    setSelectedOrder(null);
    if (onClearExternalOrder) {
      onClearExternalOrder();
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (response.error) throw response.error;
        setOrders(response.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const subscription = supabase
      .channel('orders-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filtered = orders.filter((o: Order) => {
    const searchLower = search.toLowerCase();
    
    // Search by order number
    if (o.order_number?.toLowerCase().includes(searchLower)) return true;
    
    // Search by date
    const orderDate = new Date(o.created_at).toLocaleDateString().toLowerCase();
    if (orderDate.includes(searchLower)) return true;
    
    // Search by items
    const itemsStr = typeof o.items === 'string' ? o.items : JSON.stringify(o.items);
    if (itemsStr.toLowerCase().includes(searchLower)) return true;
    
    return false;
  });

  if (loading) return <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6"><div className="animate-pulse">Loading orders...</div></div>;
  if (error) return <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 text-red-500 dark:text-red-400">Error: {error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <span className="text-xl sm:text-2xl mr-2">📝</span>
          Orders ({filtered.length})
        </h2>
      </div>
      <input
        className="mb-3 sm:mb-4 p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
        placeholder="🔍 Search by order number, date, or item..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
            <tr>
              <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-200">Order #</th>
              <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-200 hidden sm:table-cell">Chat ID</th>
              <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-200 hidden md:table-cell">Items</th>
              <th className="p-2 sm:p-3 font-semibold text-right text-gray-700 dark:text-gray-200">Total</th>
              <th className="p-2 sm:p-3 font-semibold text-center text-gray-700 dark:text-gray-200">Status</th>
              <th className="p-2 sm:p-3 font-semibold text-center text-gray-700 dark:text-gray-200 hidden lg:table-cell">Payment</th>
              <th className="p-2 sm:p-3 font-semibold text-center text-gray-700 dark:text-gray-200 hidden xl:table-cell">Delivery Status</th>
              <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-200 hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-6 text-gray-500 dark:text-gray-400">No orders found</td>
              </tr>
            ) : (
              filtered.map((o: Order) => (
                <tr key={o.id} className="border-b dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setSelectedOrder(o)}>
                  <td className="p-2 sm:p-3 font-medium text-blue-600 dark:text-blue-400">{o.order_number}</td>
                  <td className="p-2 sm:p-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{o.chat_id}</td>
                  <td className="p-2 sm:p-3 text-gray-600 dark:text-gray-400 truncate max-w-xs hidden md:table-cell">{typeof o.items === 'string' ? o.items.substring(0, 30) + '...' : JSON.stringify(o.items).substring(0, 30) + '...'}</td>
                  <td className="p-2 sm:p-3 text-right font-semibold text-green-600 dark:text-green-400">₦{o.total_amount?.toLocaleString()}</td>
                  <td className="p-2 sm:p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      o.status === 'delivered' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      o.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      o.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 text-center hidden lg:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      o.payment_status === 'paid' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 text-center hidden xl:table-cell">
                    {o.delivered_at ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex items-center justify-center gap-1">
                        <span>🚚</span>
                        <span>Delivered</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-2 sm:p-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default OrdersManagement;
