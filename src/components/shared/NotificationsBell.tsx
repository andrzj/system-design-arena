'use client';

import { Bell } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notification-store';

export function NotificationsBell() {
  const items = useNotificationStore((s) => s.items);
  const open = useNotificationStore((s) => s.open);
  const toggleOpen = useNotificationStore((s) => s.toggleOpen);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unread = items.filter((i) => !i.read).length;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F8') {
        event.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleOpen]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        data-testid="notifications-bell"
        onClick={toggleOpen}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Notifications</span>
            <button type="button" className="text-xs text-primary" onClick={markAllRead}>
              Mark all read
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-md border border-border/60 p-2 text-xs ${item.read ? 'opacity-60' : ''}`}
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground">{item.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
