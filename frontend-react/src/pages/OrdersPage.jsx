import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersPage = ({ customerData }) => {
  const navigate = useNavigate();

  // Mock orders data
  const orders = [
    {
      id: 'ORD001',
      date: '2025-11-05',
      status: 'Delivered',
      total: 8999,
      items: [
        { name: 'Premium Suit', quantity: 1, price: 8999, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=150&h=150&fit=crop' }
      ]
    },
    {
      id: 'ORD002',
      date: '2025-11-03',
      status: 'In Transit',
      total: 1999,
      items: [
        { name: 'Cotton Kurta Set', quantity: 1, price: 1999, image: 'https://images.unsplash.com/photo-1583391733975-5e3e1e9bb8ba?w=150&h=150&fit=crop' }
      ]
    },
    {
      id: 'ORD003',
      date: '2025-10-28',
      status: 'Delivered',
      total: 7998,
      items: [
        { name: 'Anarkali Suit Set', quantity: 1, price: 4999, image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=150&h=150&fit=crop' },
        { name: 'Party Dress', quantity: 1, price: 2999, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&h=150&fit=crop' }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-700 bg-green-50';
      case 'In Transit':
        return 'text-blue-700 bg-blue-50';
      case 'Processing':
        return 'text-yellow-700 bg-yellow-50';
      case 'Cancelled':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm mb-2"
          >
            ← Back to Shopping
          </button>
          <h1 className="text-2xl font-normal">Your Orders</h1>
          <p className="text-sm text-gray-600 mt-1">{orders.length} orders placed</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded border border-gray-300 overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-600 uppercase">Order Placed</div>
                  <div className="font-normal">{new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 uppercase">Total</div>
                  <div className="font-normal">₹{order.total.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 uppercase">Order ID</div>
                  <div className="font-normal">{order.id}</div>
                </div>
                <div className="text-right md:text-left">
                  <span className={`inline-block px-3 py-1 rounded text-xs font-normal ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 mb-4 last:mb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded border border-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="text-base font-normal mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                      <p className="text-base font-bold">₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {order.status === 'Delivered' && (
                        <>
                          <button className="px-4 py-2 bg-[#FF9900] hover:bg-[#e88b00] text-gray-900 border-none rounded text-sm whitespace-nowrap">
                            Buy Again
                          </button>
                          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 whitespace-nowrap">
                            Write Review
                          </button>
                        </>
                      )}
                      {order.status === 'In Transit' && (
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 whitespace-nowrap">
                          Track Package
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="bg-white rounded border border-gray-300 p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-normal mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-[#FF9900] hover:bg-[#e88b00] text-gray-900 border-none rounded text-sm"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
