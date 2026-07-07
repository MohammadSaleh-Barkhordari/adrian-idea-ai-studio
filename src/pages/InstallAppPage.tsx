import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Smartphone, Bell, Share2, CheckCircle } from 'lucide-react';
import { HomeShell, PageHero } from '@/components/home/shared';
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
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <HomeShell>
      <Helmet>
        <title>Install App | Adrian Idea</title>
        <meta name="description" content="Install Adrian Idea app on your device for quick access and push notifications." />
      </Helmet>

      <PageHero
        crumb="Install"
        titleHtml={<>Install<br /><span className="serif">Adrian Idea</span></>}
        intro="Get the full app experience with offline access, push notifications, and quick access from your home screen."
      />

      <section>
        <div className="wrap install-grid">
          <div className="install-card fade-up">
            <div className="install-card-head">
              <Download size={20} style={{ color: 'var(--gold)' }} />
              <h3>Install App</h3>
            </div>
            <p className="install-card-desc">Add Adrian Idea to your home screen</p>
            {isInstalled ? (
              <div className="install-status">
                <CheckCircle size={18} />
                <span>App is installed</span>
              </div>
            ) : isIOS ? (
              <div className="install-steps">
                <p>To install on iOS:</p>
                <ol>
                  <li>
                    <Share2 size={14} style={{ color: 'var(--gold)' }} />
                    <span>Tap the Share button in Safari</span>
                  </li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to confirm</li>
                </ol>
              </div>
            ) : deferredPrompt ? (
              <button onClick={handleInstallClick} className="btn btn-fill magnetic" data-cursor="start">
                <span>Install now</span>
              </button>
            ) : (
              <p className="install-card-desc">
                Use your browser's menu to install this app, or visit this page on a mobile device.
              </p>
            )}
          </div>

          <div className="install-card fade-up">
            <div className="install-card-head">
              <Bell size={20} style={{ color: 'var(--gold)' }} />
              <h3>Push notifications</h3>
            </div>
            <p className="install-card-desc">Get notified about tasks, projects, and calendar events</p>
            {!isSupported ? (
              <p className="install-card-desc">Push notifications are not supported in this browser.</p>
            ) : isSubscribed ? (
              <div className="install-status">
                <CheckCircle size={18} />
                <span>Notifications enabled</span>
              </div>
            ) : (
              <button
                onClick={subscribe}
                disabled={loading}
                className="btn btn-line magnetic"
                data-cursor="go"
              >
                <span>{loading ? 'Enabling…' : 'Enable notifications'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="wrap install-features">
          <h2 className="sec-title mask-reveal" style={{ marginBottom: 24 }}>
            <span className="w"><span>App</span></span>{' '}
            <span className="w"><span className="serif">features</span></span>
          </h2>
          <div className="install-features-grid">
            <div className="install-feature">
              <Smartphone size={22} style={{ color: 'var(--gold)' }} />
              <h4>Home screen access</h4>
              <p>Launch the app directly from your device's home screen</p>
            </div>
            <div className="install-feature">
              <Bell size={22} style={{ color: 'var(--gold)' }} />
              <h4>Push notifications</h4>
              <p>Stay updated with real-time notifications</p>
            </div>
            <div className="install-feature">
              <Download size={22} style={{ color: 'var(--gold)' }} />
              <h4>Offline access</h4>
              <p>Access the app even without an internet connection</p>
            </div>
          </div>
        </div>
      </section>
    </HomeShell>
  );
};

export default InstallAppPage;
