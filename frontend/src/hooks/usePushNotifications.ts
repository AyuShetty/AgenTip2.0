'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Hook for managing browser push notification subscriptions.
 * Handles service worker registration, permission requests,
 * and sending subscriptions to the backend.
 */
export function usePushNotifications(wallet: string) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vapidKey, setVapidKey] = useState<string>('');

  // Check current permission status and fetch VAPID key
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    // Fetch VAPID public key from backend
    fetch(`${API_URL}/notify/vapid-public-key`)
      .then(res => res.json())
      .then(data => setVapidKey(data.publicKey))
      .catch(() => {
        // Fallback to env variable
        setVapidKey(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '');
      });
  }, []);

  // Check if already subscribed
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(registration => {
      registration.pushManager.getSubscription().then(sub => {
        setIsSubscribed(!!sub);
      });
    }).catch(() => {});
  }, []);

  const subscribe = useCallback(async (summaryTime: string = '20:00') => {
    if (!wallet || !vapidKey) return false;

    setIsLoading(true);
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        throw new Error('Permission denied');
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as any,
      });

      // Send subscription to backend
      const res = await fetch(`${API_URL}/notify/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: wallet.toLowerCase(),
          subscription: subscription.toJSON(),
          summaryTime,
        }),
      });

      if (!res.ok) throw new Error('Server rejected subscription');

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, vapidKey]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch(`${API_URL}/notify/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.toLowerCase() }),
      });

      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error('Unsubscribe failed:', err);
      return false;
    }
  }, [wallet]);

  const sendTestNotification = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/notify/send-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: wallet.toLowerCase() }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [wallet]);

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

/**
 * Convert a URL-safe base64 VAPID key to a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
