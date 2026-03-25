import React, { useState } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      // If it's an external link
      if (notification.link.startsWith('http')) {
        window.open(notification.link, '_blank');
      } else {
        navigate(notification.link);
      }
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1e1e2e] transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-[#0a0a0f]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px] bg-[#12121a] border-[#1e1e2e] shadow-2xl rounded-xl p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e]">
          <DropdownMenuLabel className="font-semibold text-lg p-0 text-white">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="h-8 text-xs font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 px-2"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
              <Bell className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-1">We'll let you know when something happens.</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <div key={notification.id}>
                  <DropdownMenuItem 
                    className={`flex flex-col items-start px-4 py-3 gap-1 cursor-pointer transition-colors outline-none ${
                        !notification.is_read 
                            ? 'bg-violet-900/10 hover:bg-violet-900/20 text-white' 
                            : 'hover:bg-[#1e1e2e] text-gray-300'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <span className={`text-sm font-medium ${!notification.is_read ? 'text-violet-100' : 'text-gray-200'} line-clamp-1`}>
                        {notification.title}
                      </span>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className={`text-sm ${!notification.is_read ? 'text-gray-300' : 'text-gray-400'} line-clamp-2 leading-snug w-full`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between w-full mt-1.5 pt-1">
                      <span className="text-xs font-medium text-gray-500">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {notification.link && (
                        <span className="text-xs font-medium text-violet-400 flex items-center">
                          View details <ExternalLink className="h-3 w-3 ml-1" />
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#1e1e2e] my-0 opacity-50 last:hidden" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
