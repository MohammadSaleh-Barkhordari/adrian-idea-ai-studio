import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NotificationPreferences {
  task_notifications: boolean;
  project_notifications: boolean;
  calendar_notifications: boolean;
  financial_notifications: boolean;
}

export const NotificationBell = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    isIOS,
    isStandalone,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    task_notifications: true,
    project_notifications: true,
    calendar_notifications: true,
    financial_notifications: false
  });
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [isSubscribed]);

  // Load service worker debug info
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        const info = regs.map(r => 
          `Scope: ${r.scope}\nScript: ${r.active?.scriptURL || 'no active SW'}\nState: ${r.active?.state || 'unknown'}`
        ).join('\n---\n');
        setDebugInfo(`${regs.length} SW(s) registered:\n${info}`);
      });
    }
  }, [isSubscribed]);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences({
          task_notifications: data.task_notifications ?? true,
          project_notifications: data.project_notifications ?? true,
          calendar_notifications: data.calendar_notifications ?? true,
          financial_notifications: data.financial_notifications ?? false
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    setPrefsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPrefs = { ...preferences, [key]: value };
      setPreferences(newPrefs);

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPrefs
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title={isSubscribed ? 'Notifications enabled' : 'Enable notifications'}
        >
          {isSubscribed ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {isSubscribed && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="end">
        <div className="space-y-4">
          {/* iOS Guidance */}
          {isIOS && !isStandalone && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                📱 To enable notifications on iPhone/iPad:
              </p>
              <ol className="text-xs text-amber-600 dark:text-amber-400 mt-2 list-decimal list-inside space-y-1">
                <li>Tap the Share button (□↑) in Safari</li>
                <li>Select "Add to Home Screen"</li>
                <li>Open the app from your Home Screen</li>
                <li>Then enable notifications</li>
              </ol>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Button
              variant={isSubscribed ? 'outline' : 'default'}
              size="sm"
              onClick={handleToggleNotifications}
              disabled={loading || (isIOS && !isStandalone)}
            >
              {loading ? 'Loading...' : isSubscribed ? 'Disable' : 'Enable'}
            </Button>
          </div>

          {isSubscribed && (
            <>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Notification Settings</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {showSettings && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task_notifications" className="text-sm">
                        Task Updates
                      </Label>
                      <Switch
                        id="task_notifications"
                        checked={preferences.task_notifications}
                        onCheckedChange={(checked) => updatePreference('task_notifications', checked)}
                        disabled={prefsLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="project_notifications" className="text-sm">
                        Project Updates
                      </Label>
                      <Switch
                        id="project_notifications"
                        checked={preferences.project_notifications}
                        onCheckedChange={(checked) => updatePreference('project_notifications', checked)}
                        disabled={prefsLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="calendar_notifications" className="text-sm">
                        Calendar Reminders
                      </Label>
                      <Switch
                        id="calendar_notifications"
                        checked={preferences.calendar_notifications}
                        onCheckedChange={(checked) => updatePreference('calendar_notifications', checked)}
                        disabled={prefsLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="financial_notifications" className="text-sm">
                        Financial Updates
                      </Label>
                      <Switch
                        id="financial_notifications"
                        checked={preferences.financial_notifications}
                        onCheckedChange={(checked) => updatePreference('financial_notifications', checked)}
                        disabled={prefsLoading}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {permission === 'denied' && (
            <p className="text-sm text-destructive">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}

          {/* Debug Info Section */}
          <Collapsible open={showDebug} onOpenChange={setShowDebug}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground mt-2">
                <Bug className="h-3 w-3 mr-1" />
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-x-auto whitespace-pre-wrap">
                {debugInfo || 'Loading SW info...'}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </PopoverContent>
    </Popover>
  );
};
