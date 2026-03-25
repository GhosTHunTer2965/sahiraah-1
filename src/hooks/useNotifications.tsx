import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const loadNotificationsAndSubscribe = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Initial fetch
        const { data, error } = await (supabase as any)
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotifications(data as Notification[]);
          setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        }

        // Realtime subscription
        channel = supabase
          .channel('notifications-realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              // Handle incoming changes (insert, update, delete)
              // For simplicity, we can just refetch all if the list is small, 
              // or handle the payload directly. Here we'll handle the payload directly for efficiency.
              if (payload.eventType === 'INSERT') {
                setNotifications(prev => [payload.new as Notification, ...prev]);
                setUnreadCount(prev => prev + 1);
              } else if (payload.eventType === 'UPDATE') {
                setNotifications(prev => 
                  prev.map(n => n.id === payload.new.id ? (payload.new as Notification) : n)
                );
                // We'll update unread count by recalculating to ensure accuracy if multiple things changed
                setUnreadCount(prev => {
                  const oldWasRead = payload.old?.is_read;
                  const newIsRead = payload.new.is_read;
                  if (!oldWasRead && newIsRead) return Math.max(0, prev - 1);
                  if (oldWasRead && !newIsRead) return prev + 1;
                  return prev;
                });
              } else if (payload.eventType === 'DELETE') {
                setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                // Just relying on recalculation could be safer, but we can do it explicitly here too
                // For simplicity, let's trigger a full recalculation just to be safe if a delete happens.
                setUnreadCount(prev => {
                  // We can't know if the deleted one was read unless we search the list, 
                  // but we already updated `notifications` state.
                  return prev; // It's better to recalculate, but we'll manage.
                });
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotificationsAndSubscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Sync Unread count if notifications array changes (e.g., from DELETE payload)
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.is_read).length);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking as read:', error);
      // Revert if failed (optional, simplified here)
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false); // Only update those that are currently false
  };

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead };
}
