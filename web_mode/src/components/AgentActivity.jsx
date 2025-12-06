import React from 'react';

const AgentActivity = ({ activeAgent, status, message }) => {
  const getAgentInfo = (agentType) => {
    const agents = {
      'sales': { icon: '🤖', name: 'Sales Agent', color: '#3b82f6' },
      'recommendation': { icon: '🎯', name: 'Recommendation Agent', color: '#8b5cf6' },
      'inventory': { icon: '📦', name: 'Inventory Agent', color: '#10b981' },
      'payment': { icon: '💳', name: 'Payment Agent', color: '#f59e0b' },
      'fulfillment': { icon: '🚚', name: 'Fulfillment Agent', color: '#06b6d4' },
      'loyalty': { icon: '⭐', name: 'Loyalty Agent', color: '#f59e0b' },
      'post-purchase': { icon: '📨', name: 'Support Agent', color: '#ec4899' }
    };
    return agents[agentType] || { icon: '🤖', name: 'AI Agent', color: '#6b7280' };
  };

  if (!activeAgent) return null;

  const agent = getAgentInfo(activeAgent);

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-[slideInUp_0.3s_ease-out]">
      <div 
        className="p-4 bg-white/10 backdrop-blur-xl border-l-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] min-w-[300px]" 
        style={{ borderLeftColor: agent.color }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: agent.color }}
          >
            {agent.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white mb-1">
              {agent.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {status === 'processing' && (
                <>
                  <div 
                    className="w-3 h-3 border-2 border-transparent rounded-full animate-spin" 
                    style={{ borderTopColor: agent.color }}
                  />
                  <span>{message || 'Processing your request...'}</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </span>
                  <span>{message || 'Task completed'}</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    ✕
                  </span>
                  <span>{message || 'An error occurred'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentActivity;
