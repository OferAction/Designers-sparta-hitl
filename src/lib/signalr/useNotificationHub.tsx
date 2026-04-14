import { useEffect, useState } from 'react';

import { HubConnectionState } from '@microsoft/signalr';

import { notificationHub } from './notificationHub';

export function useNotificationHub() {
  const [connectionState, setConnectionState] = useState<string>(
    HubConnectionState[notificationHub.getConnectionState()]
  );
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const connectionStatusUnsubscribe = notificationHub.addListener('connectionStatus', (status) => {
      setConnectionState(status);
    });

    const notificationUnsubscribe = notificationHub.addListener('notification', (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      connectionStatusUnsubscribe();
      notificationUnsubscribe();
    };
  }, []);

  const connect = async () => {
    try {
      await notificationHub.start();
      return true;
    } catch (error) {
      console.error('Failed to connect:', error);
      return false;
    }
  };

  const disconnect = async () => {
    try {
      await notificationHub.stop();
      return true;
    } catch (error) {
      console.error('Failed to disconnect:', error);
      return false;
    }
  };

  const subscribe = async (topicName: string, sessionId: string) => {
    try {
      console.log("subscribe", topicName, sessionId);
      return await notificationHub.subscribe(topicName, sessionId);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  };

  const unsubscribe = async (topicName: string, sessionId: string) => {
    try {
      return await notificationHub.unsubscribe(topicName, sessionId);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    connectionState,
    notifications,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearNotifications,
  };
} 