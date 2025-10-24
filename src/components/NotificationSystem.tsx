
import React, { useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase, Order } from '../supabaseClient';

interface NotificationItem {
  message: string;
  orderId?: string;
  timestamp: Date;
}

interface Props {
  onViewOrder: (order: Order) => void;
}

const NotificationSystem: React.FC<Props> = ({ onViewOrder }) => {
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playSound = () => {
    if (soundOn && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const addNotification = (message: string, orderId?: string) => {
    setHistory((h) => [{ message, orderId, timestamp: new Date() }, ...h].slice(0, 20));
    playSound();
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      if (data) {
        onViewOrder(data as Order);
        setIsDropdownOpen(false);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      toast.error('Failed to load order details');
    }
  };

  React.useEffect(() => {
    // Listen for new orders via Supabase real-time
    const subscription = supabase
      .channel('new-orders-notification')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
        const newOrder = payload.new;
        const message = `New order #${newOrder.order_number} (Status: ${newOrder.status})`;
        addNotification(message, newOrder.id);
        
        // Custom toast for new order
        toast.info(
          <div>
            <div className="font-semibold mb-2">You have a new order!</div>
            <div className="text-sm mb-2">Status: <span className="font-medium">{newOrder.status}</span></div>
            <button
              onClick={() => handleViewOrder(newOrder.id)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium"
            >
              View Details
            </button>
          </div>,
          {
            autoClose: 8000,
            closeButton: true,
          }
        );
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload: any) => {
        const oldOrder = payload.old;
        const newOrder = payload.new;
        
        // Check for delivery FIRST (delivered_at changed from null to a timestamp)
        if (newOrder.delivered_at !== null && (oldOrder.delivered_at === null || oldOrder.delivered_at === undefined)) {
          const message = `Order #${newOrder.order_number} has been delivered!`;
          addNotification(message, newOrder.id);
          toast.success(
            <div>
              <div className="font-semibold mb-2">Order Delivered!</div>
              <div className="text-sm mb-2">Order #{newOrder.order_number}</div>
              <div className="text-xs mb-2">Delivered at: {new Date(newOrder.delivered_at).toLocaleString()}</div>
              <button
                onClick={() => handleViewOrder(newOrder.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                View Details
              </button>
            </div>,
            {
              autoClose: 8000,
              closeButton: true,
            }
          );
        }
        // Check for payment status change to paid (only if not a delivery notification)
        else if (newOrder.payment_status === 'paid' && oldOrder.payment_status !== 'paid') {
          const message = `Order #${newOrder.order_number} payment confirmed!`;
          addNotification(message, newOrder.id);
          toast.success(
            <div>
              <div className="font-semibold mb-2">Payment Confirmed!</div>
              <div className="text-sm mb-2">Order #{newOrder.order_number}</div>
              <button
                onClick={() => handleViewOrder(newOrder.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium"
              >
                View Details
              </button>
            </div>,
            {
              autoClose: 8000,
              closeButton: true,
            }
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [soundOn]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b2b7.mp3" preload="auto" />
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-lg shadow-lg transition-colors ${
              soundOn ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white backdrop-blur-sm' : 'bg-white bg-opacity-10 hover:bg-opacity-20 text-gray-200 backdrop-blur-sm'
            }`}
            onClick={() => setSoundOn((s) => !s)}
            title={soundOn ? 'Sound On' : 'Sound Off'}
          >
            {soundOn ? (
              <span className="text-xl">🔊</span>
            ) : (
              <span className="text-xl">🔇</span>
            )}
          </button>
          
          <button
            className="relative bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2 backdrop-blur-sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-2xl">🔔</span>
            {history.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-orange-900 text-xs rounded-full px-2 py-0.5 font-semibold">
                {history.length}
              </span>
            )}
            <svg 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 right-4 bg-white rounded-lg shadow-2xl w-96 max-h-96 overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📬</span>
                <span className="font-bold">Notification History</span>
              </div>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {history.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <span className="text-4xl block mb-2">🔔</span>
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ul className="text-sm">
                  {history.map((item, idx) => (
                    <li 
                      key={idx} 
                      className="border-b last:border-b-0 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span className="flex-1 text-gray-700">{item.message}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 ml-4">
                            {item.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        {item.orderId && (
                          <button
                            onClick={() => handleViewOrder(item.orderId!)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {history.length > 0 && (
              <div className="bg-gray-50 px-4 py-2 text-center border-t">
                <button
                  onClick={() => setHistory([])}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationSystem;
