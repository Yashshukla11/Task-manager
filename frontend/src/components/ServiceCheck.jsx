import React, { useState, useEffect } from 'react';

const ServiceCheck = ({ children }) => {
  const [status, setStatus] = useState({
    checking: true,
    backend: 'checking',
    analytics: 'checking',
  });

  const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL || 'https://analytics-udx5.onrender.com';

  useEffect(() => {
    const checkServices = async () => {
      const results = { backend: 'error', analytics: 'error' };

      // Check backend
      try {
        const backendRes = await fetch(`${API_URL}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(30000) 
        });
        results.backend = backendRes.ok ? 'ready' : 'error';
      } catch (e) {
        results.backend = 'error';
      }

      setStatus(prev => ({ ...prev, backend: results.backend }));

      // Check analytics
      try {
        const analyticsRes = await fetch(`${ANALYTICS_URL}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(30000) 
        });
        results.analytics = analyticsRes.ok ? 'ready' : 'error';
      } catch (e) {
        results.analytics = 'error';
      }

      setStatus({
        checking: false,
        backend: results.backend,
        analytics: results.analytics,
      });
    };

    checkServices();
  }, []);

  const allReady = status.backend === 'ready' && status.analytics === 'ready';
  const hasError = !status.checking && (status.backend === 'error' || status.analytics === 'error');

  if (status.checking || (!allReady && !hasError)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">QuickTask</h1>
              <p className="text-purple-200 text-sm">Waking up services...</p>
            </div>

            <div className="space-y-4">
              <ServiceStatus 
                name="Backend API" 
                status={status.backend} 
              />
              <ServiceStatus 
                name="Analytics Service" 
                status={status.analytics} 
              />
            </div>

            <p className="text-purple-300 text-xs mt-6">
              Free tier services may take up to 60 seconds to wake up
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Service Unavailable</h1>
              <p className="text-red-200 text-sm mb-4">Some services failed to respond</p>
            </div>

            <div className="space-y-4 mb-6">
              <ServiceStatus name="Backend API" status={status.backend} />
              <ServiceStatus name="Analytics Service" status={status.analytics} />
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

const ServiceStatus = ({ name, status }) => {
  const statusConfig = {
    checking: {
      icon: (
        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      ),
      text: 'Connecting...',
      color: 'text-purple-300',
    },
    ready: {
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'Connected',
      color: 'text-green-400',
    },
    error: {
      icon: (
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      text: 'Failed',
      color: 'text-red-400',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
      <span className="text-white font-medium">{name}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${config.color}`}>{config.text}</span>
        {config.icon}
      </div>
    </div>
  );
};

export default ServiceCheck;
