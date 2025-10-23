import React from 'react';
import { Order } from '../supabaseClient';

type Props = {
  order: Order;
  onClose: () => void;
};

const OrderDetailsModal: React.FC<Props> = ({ order, onClose }) => {
  const items = Array.isArray(order.items)
    ? order.items
    : (() => { try { return JSON.parse(order.items as string); } catch { return []; } })();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl font-bold" onClick={onClose}>&times;</button>
        
        <div className="flex items-center mb-6">
          <span className="text-3xl mr-3">📦</span>
          <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Order Number</div>
            <div className="font-bold text-lg text-blue-600">{order.order_number}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">Reference Number</div>
            <div className="font-semibold text-gray-700">{order.referencenumber}</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Chat ID</div>
          <div className="font-semibold text-gray-700">{order.chat_id}</div>
        </div>
        
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Delivery Address</div>
          <div className="font-semibold text-gray-700">{order.delivery_address}</div>
        </div>
        
        {order.special_instructions && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Special Instructions</div>
            <div className="font-semibold text-gray-700 bg-yellow-50 p-3 rounded">{order.special_instructions}</div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Payment Status</div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {order.payment_status}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Order Status</div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Created At</div>
            <div className="font-semibold text-gray-700">{new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Delivered At</div>
            <div className="font-semibold text-gray-700">
              {order.delivered_at ? new Date(order.delivered_at).toLocaleString() : 'Not delivered yet'}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Order Items</div>
          <div className="bg-gray-50 p-4 rounded-lg">
            {items.length === 0 ? (
              <div className="text-gray-500">No items</div>
            ) : (
              <ul className="space-y-2">
                {items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-green-600">₦{item.price?.toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="border-t-2 pt-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold text-gray-700">Total Amount</div>
            <div className="text-2xl font-bold text-green-600">₦{order.total_amount?.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
