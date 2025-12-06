import React, { useState } from 'react';
import axios from 'axios';

const SessionSelector = ({ onSessionStart }) => {
  const [customerId, setCustomerId] = useState('CUST001');
  const channel = 'web'; // Automatically set to 'web' for website, change to 'mobile' in mobile app
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartSession = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/start_session', {
        customer_id: customerId,
        channel: channel
      });

      if (response.data.success) {
        onSessionStart({
          session_id: response.data.session_id,
          message: response.data.message,
          customer_id: customerId,
          channel: channel
        });
      }
    } catch (err) {
      setError('Failed to start session. Please make sure the backend server is running.');
      console.error('Session start error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-dark-bg to-dark-surface">
      <div className="w-full max-w-md p-10 bg-white/5 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-3 -tracking-tight">Intelligent Retail Platform</h2>
          <p className="text-base text-gray-300 leading-relaxed">Connect with our enterprise-grade AI assistant for personalized shopping experiences</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="customer-id" className="block text-sm font-bold text-white mb-2.5 uppercase tracking-wide">
              Customer ID
            </label>
            <select
              id="customer-id"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-primary/30 rounded-lg text-white text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
            >
              <option value="CUST001">CUST001 - Keshav Sharma</option>
              <option value="CUST002">CUST002 - Rajesh Kumar</option>
              <option value="CUST003">CUST003 - Anjali Gupta</option>
              <option value="CUST004">CUST004 - Vikram Singh</option>
              <option value="CUST005">CUST005 - Sneha Patel</option>
            </select>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-200 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <button
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white text-lg font-semibold border-none rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_10px_30px_rgba(102,126,234,0.5)] hover:-translate-y-0.5"
            onClick={handleStartSession}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Initializing Session...
              </>
            ) : (
              <>
                Launch Platform →
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-lg">🎯</span>
            <span>Personalized Recommendations</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-lg">🤖</span>
            <span>AI-Powered Shopping</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-lg">💳</span>
            <span>Secure Payment Processing</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="text-lg">🎁</span>
            <span>Loyalty Rewards</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSelector;
