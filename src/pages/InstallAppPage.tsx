import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Smartphone, Bell, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { isSupported, isSubscribed, subscribe, loading } = usePushNotifications();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <Helmet>
        <title>Install App | Adrian Idea</title>
        <meta name="description" content="Install Adrian Idea app on your device for quick access and push notifications." />
      </Helmet>

      <Navigation />

      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Smartphone className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Install Adrian Idea</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get the full app experience with offline access, push notifications, and quick access from your home screen.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {/* Install Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Install App
                </CardTitle>
                <CardDescription>
                  Add Adrian Idea to your home screen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isInstalled ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>App is installed!</span>
                  </div>
                ) : isIOS ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      To install on iOS:
                    </p>
                    <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Share2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>Tap the Share button in Safari</span>
                      </li>
                      <li>Scroll down and tap "Add to Home Screen"</li>
                      <li>Tap "Add" to confirm</li>
                    </ol>
                  </div>
                ) : deferredPrompt ? (
                  <Button onClick={handleInstallClick} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Install Now
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Use your browser's menu to install this app, or visit this page on a mobile device.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Get notified about tasks, projects, and calendar events
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isSupported ? (
                  <p className="text-sm text-muted-foreground">
                    Push notifications are not supported in this browser.
                  </p>
                ) : isSubscribed ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>Notifications enabled!</span>
                  </div>
                ) : (
                  <Button
                    onClick={subscribe}
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {loading ? 'Enabling...' : 'Enable Notifications'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="bg-muted/50 rounded-xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">App Features</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Home Screen Access</h3>
                <p className="text-sm text-muted-foreground">
                  Launch the app directly from your device's home screen
                </p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Stay updated with real-time notifications
                </p>
              </div>
              <div className="text-center p-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Offline Access</h3>
                <p className="text-sm text-muted-foreground">
                  Access the app even without an internet connection
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default InstallAppPage;