import React, { useEffect, useState } from 'react';
import { supabase, Customer } from '../supabaseClient';
import CustomerDetailsModal from './CustomerDetailsModal';

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setCustomers(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
    const subscription = supabase
      .channel('customers-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
        fetchCustomers();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone_number?.includes(search)
  );

  if (loading) return <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6"><div className="animate-pulse">Loading customers...</div></div>;
  if (error) return <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 text-red-500 dark:text-red-400">Error: {error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
          <span className="text-xl sm:text-2xl mr-2">👥</span>
          Customers ({filtered.length})
        </h2>
      </div>
      <input
        className="mb-3 sm:mb-4 p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
        placeholder="🔍 Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto -mx-4 sm:mx-0 touch-pan-x">
        <div className="min-w-full inline-block align-middle">
          <table className="w-full text-left text-sm sm:text-base min-w-[600px]">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600">
              <tr>
                <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Name</th>
                <th className="p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Phone</th>
                <th className="p-2 sm:p-3 font-semibold text-center text-gray-700 dark:text-gray-200 whitespace-nowrap">Orders</th>
                <th className="p-2 sm:p-3 font-semibold text-right text-gray-700 dark:text-gray-200 whitespace-nowrap">Total Spent</th>
              </tr>
            </thead>
            <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500 dark:text-gray-400">No customers found</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setSelectedCustomer(c)}>
                  <td className="p-2 sm:p-3 font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                  <td className="p-2 sm:p-3 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{c.phone_number}</td>
                  <td className="p-2 sm:p-3 text-center">
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      {c.total_orders}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 text-right font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">₦{c.total_spent?.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      {selectedCustomer && (
        <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
};

export default CustomerList;
