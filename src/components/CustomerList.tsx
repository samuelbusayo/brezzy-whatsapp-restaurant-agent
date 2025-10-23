import React from 'react';


import { useEffect, useState } from 'react';
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

  if (loading) return <div className="bg-white shadow-lg rounded-lg p-6"><div className="animate-pulse">Loading customers...</div></div>;
  if (error) return <div className="bg-white shadow-lg rounded-lg p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">👥</span>
          Customers ({filtered.length})
        </h2>
      </div>
      <input
        className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        placeholder="🔍 Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Phone</th>
              <th className="p-3 font-semibold text-center">Orders</th>
              <th className="p-3 font-semibold text-right">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500">No customers found</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-orange-50 cursor-pointer transition-colors" onClick={() => setSelectedCustomer(c)}>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-gray-600">{c.phone_number}</td>
                  <td className="p-3 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                      {c.total_orders}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold text-green-600">₦{c.total_spent?.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedCustomer && (
        <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
};

export default CustomerList;
