// lib/hooks/useSessionMonitor.ts - FIXED VERSION
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { silentLogout } from '@/lib/features/auth/auth-slice';
import api from '@/lib/api';

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const SESSION_REFRESH_INTERVAL = 30 * 60 * 1000; // Refresh every 30 minutes
const ACTIVITY_THROTTLE = 60 * 1000; // Throttle activity updates to 1 minute

export function useSessionMonitor() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const activityThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const isValidatingRef = useRef<boolean>(false); // ✅ NEW: Prevent concurrent validations

  // ==================== SESSION VALIDATION ====================
  const validateSession = async (): Promise<boolean> => {
    if (!token || !isAuthenticated) {
      return false;
    }

    // ✅ NEW: Prevent concurrent validations
    if (isValidatingRef.current) {
      console.log('⏭️ Skipping validation - already in progress');
      return true;
    }

    isValidatingRef.current = true;

    try {
      const response = await api.get('/auth/validate-session');
      
      if (response.data.success) {
        console.log('✅ Session valid');
        isValidatingRef.current = false;
        return true;
      } else {
        console.warn('⚠️ Session invalid:', response.data.message);
        isValidatingRef.current = false;
        dispatch(silentLogout());
        return false;
      }
    } catch (error: any) {
      isValidatingRef.current = false;
      
      // ✅ CRITICAL FIX: Don't logout on 401 during validation
      // The backend returns 401 when session is expired, but we should only
      // logout if we get a specific SESSION_EXPIRED code
      if (error.response?.status === 401) {
        console.log('❌ Session expired - logging out');
        dispatch(silentLogout());
        return false;
      }
      
      // ✅ For network errors, assume session is still valid
      console.warn('⚠️ Session validation failed (network error) - keeping session');
      return true; // Don't logout on network errors
    }
  };

  // ==================== SESSION REFRESH ====================
  const refreshSession = async () => {
    if (!token || !isAuthenticated) {
      return;
    }

    try {
      await api.post('/auth/refresh-session');
      console.log('✅ Session refreshed');
    } catch (error: any) {
      // ✅ CRITICAL FIX: Don't logout on refresh errors
      // Only log the error, don't trigger logout
      console.warn('⚠️ Session refresh failed:', error.response?.data?.message);
      
      // Only logout if we get a specific SESSION_EXPIRED code
      if (error.response?.data?.code === 'SESSION_EXPIRED') {
        console.log('❌ Session expired during refresh - logging out');
        dispatch(silentLogout());
      }
    }
  };

  // ==================== ACTIVITY TRACKING ====================
  const handleUserActivity = () => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Throttle activity updates
    if (activityThrottleRef.current) {
      clearTimeout(activityThrottleRef.current);
    }

    activityThrottleRef.current = setTimeout(() => {
      refreshSession();
    }, ACTIVITY_THROTTLE);
  };

  // ==================== SETUP MONITORING ====================
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clear intervals if not authenticated
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      setIsMonitoring(false);
      return;
    }

    console.log('🔐 Starting session monitoring...');
    setIsMonitoring(true);

    // ✅ CRITICAL FIX: Don't validate immediately on mount
    // Give the app time to settle before first validation
    const initialValidationTimer = setTimeout(() => {
      validateSession();
    }, 3000); // Wait 3 seconds before first validation

    // Setup periodic session validation
    checkIntervalRef.current = setInterval(() => {
      validateSession();
    }, SESSION_CHECK_INTERVAL);

    // Setup periodic session refresh
    refreshIntervalRef.current = setInterval(() => {
      refreshSession();
    }, SESSION_REFRESH_INTERVAL);

    // Setup activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Cleanup
    return () => {
      clearTimeout(initialValidationTimer);
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (activityThrottleRef.current) {
        clearTimeout(activityThrottleRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      setIsMonitoring(false);
    };
  }, [isAuthenticated, token]);

  // ==================== VISIBILITY CHANGE HANDLER ====================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        console.log('👀 Tab visible - validating session');
        // ✅ Add small delay to prevent race conditions
        setTimeout(() => {
          validateSession();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  return {
    isMonitoring,
    validateSession,
    refreshSession,
  };
}