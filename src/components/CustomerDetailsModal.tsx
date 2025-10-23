import React, { useEffect, useState } from 'react';
import { Customer, Order, supabase } from '../supabaseClient';

type Props = {
  customer: Customer;
  onClose: () => void;
};

const CustomerDetailsModal: React.FC<Props> = ({ customer, onClose }) => {
  const [paidOrders, setPaidOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaidOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('chat_id', customer.chat_id)
          .eq('payment_status', 'paid')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPaidOrders(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaidOrders();
  }, [customer.chat_id]);

  // Group orders by date
  const groupedOrders = paidOrders.reduce((groups, order) => {
    const date = new Date(order.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {} as Record<string, Order[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-bold" onClick={onClose}>&times;</button>
        
        <div className="flex items-center mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl mr-3">👤</span>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Customer Details</h3>
        </div>
        
        {/* Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900 dark:to-red-900 dark:bg-opacity-20 p-3 sm:p-4 rounded-lg">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</div>
            <div className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100">{customer.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</div>
            <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{customer.phone_number}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</div>
            <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{customer.email || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chat ID</div>
            <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{customer.chat_id}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Orders</div>
            <div className="font-bold text-base sm:text-lg text-blue-600 dark:text-blue-400">{customer.total_orders}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</div>
            <div className="font-bold text-base sm:text-lg text-green-600 dark:text-green-400">₦{customer.total_spent?.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer Since</div>
            <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{new Date(customer.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Updated</div>
            <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{new Date(customer.updated_at).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Paid Orders Section */}
        <div className="border-t-2 pt-4">
          <div className="flex items-center mb-3 sm:mb-4">
            <span className="text-xl sm:text-2xl mr-2">💳</span>
            <h4 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Paid Orders ({paidOrders.length})</h4>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading orders...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400">Error: {error}</div>
          ) : paidOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="text-4xl block mb-2">📭</span>
              <p>No paid orders yet</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {Object.entries(groupedOrders).map(([date, orders]) => (
                <div key={date} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center mb-3">
                    <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">📅 {date}</span>
                    <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">({orders.length} order{orders.length > 1 ? 's' : ''})</span>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {orders.map((order) => {
                      const items = Array.isArray(order.items)
                        ? order.items
                        : (() => { try { return JSON.parse(order.items as string); } catch { return []; } })();
                      
                      return (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400">Order #{order.order_number}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-sm sm:text-base text-green-600 dark:text-green-400">₦{order.total_amount?.toLocaleString()}</div>
                              <div className="flex gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                  order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                  order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {order.status}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                  Paid
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference: {order.referencenumber}</div>
                          </div>
                          
                          <div className="text-xs sm:text-sm">
                            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Items:</div>
                            <ul className="space-y-1">
                              {items.map((item: any, idx: number) => (
                                <li key={idx} className="flex justify-between text-xs">
                                  <span className="text-gray-600 dark:text-gray-400">{item.name} x{item.quantity}</span>
                                  <span className="text-gray-700 dark:text-gray-300 font-medium">₦{item.price?.toLocaleString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {order.delivery_address && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              📍 {order.delivery_address}
                            </div>
                          )}
                          
                          {order.delivered_at && (
                            <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                              ✅ Delivered: {new Date(order.delivered_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
