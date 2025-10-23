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
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl font-bold" onClick={onClose}>&times;</button>
        
        <div className="flex items-center mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl mr-3">📦</span>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Order Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Number</div>
            <div className="font-bold text-base sm:text-lg text-blue-600 dark:text-blue-400">{order.order_number}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference Number</div>
            <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{order.referencenumber}</div>
          </div>
        </div>

        <div className="mb-3 sm:mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chat ID</div>
          <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{order.chat_id}</div>
        </div>
        
        <div className="mb-3 sm:mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivery Address</div>
          <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">{order.delivery_address}</div>
        </div>
        
        {order.special_instructions && (
          <div className="mb-3 sm:mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Special Instructions</div>
            <div className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-3 rounded">{order.special_instructions}</div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Status</div>
            <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
              order.payment_status === 'paid' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {order.payment_status}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Status</div>
            <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
              order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
              order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
              order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {order.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created At</div>
            <div className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300">{new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivered At</div>
            <div className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              {order.delivered_at ? new Date(order.delivered_at).toLocaleString() : 'Not delivered yet'}
            </div>
          </div>
        </div>
        
        <div className="mb-3 sm:mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Order Items</div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
            {items.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No items</div>
            ) : (
              <ul className="space-y-2">
                {items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center border-b dark:border-gray-600 pb-2 last:border-b-0">
                    <div>
                      <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">{item.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Quantity: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-sm sm:text-base text-green-600 dark:text-green-400">₦{item.price?.toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="border-t-2 dark:border-gray-600 pt-3 sm:pt-4">
          <div className="flex justify-between items-center">
            <div className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">Total Amount</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">₦{order.total_amount?.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;