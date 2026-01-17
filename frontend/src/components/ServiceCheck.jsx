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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-primary-600 mb-2">QuickTask</h1>
              <p className="text-gray-600 text-sm">Waking up services...</p>
            </div>

            <div className="space-y-3">
              <ServiceStatus 
                name="Backend API" 
                status={status.backend} 
              />
              <ServiceStatus 
                name="Analytics Service" 
                status={status.analytics} 
              />
            </div>

            <p className="text-gray-500 text-xs mt-6">
              Free tier services may take up to 60 seconds to wake up
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Service Unavailable</h1>
              <p className="text-gray-600 text-sm mb-4">Some services failed to respond</p>
            </div>

            <div className="space-y-3 mb-6">
              <ServiceStatus name="Backend API" status={status.backend} />
              <ServiceStatus name="Analytics Service" status={status.analytics} />
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full btn-primary"
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
        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      ),
      text: 'Connecting...',
      color: 'text-primary-600',
    },
    ready: {
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'Connected',
      color: 'text-green-600',
    },
    error: {
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      text: 'Failed',
      color: 'text-red-600',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
      <span className="text-gray-800 font-medium">{name}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${config.color}`}>{config.text}</span>
        {config.icon}
      </div>
    </div>
  );
};

export default ServiceCheck;
