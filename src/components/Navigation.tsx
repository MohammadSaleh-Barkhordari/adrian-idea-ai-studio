import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/NotificationBell';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, t, isRTL } = useLanguage();

  // Authentication state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    }
  };

  const langPrefix = language === 'en' ? '/en' : '';
  
  const navItems = [
    { name: t?.nav?.about || 'About', href: `${langPrefix}/about` },
    { name: t?.nav?.services || 'Services', href: `${langPrefix}/services` },
    { name: t?.nav?.caseStudies || 'Case Studies', href: `${langPrefix}/case-studies` },
    { name: t?.nav?.aiPhilosophy || 'AI Philosophy', href: `${langPrefix}/ai-philosophy` },
    { name: t?.nav?.blog || 'Blog', href: `${langPrefix}/blog` },
    { name: t?.nav?.contact || 'Contact', href: `${langPrefix}/contact` },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={langPrefix || '/'} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <img 
              src="/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png" 
              alt={`${t?.companyName || 'Adrian Idea'} Logo`}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              width="32"
              height="32"
            />
            <span className="text-lg sm:text-xl font-display font-bold">{t?.companyName || 'Adrian Idea'}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-8`}>
            {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`transition-colors duration-300 font-medium ${
                    isActive(item.href) 
                      ? 'text-golden font-semibold' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
            {/* Notification Bell (only for logged in users) */}
            {user && <NotificationBell />}
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Authentication Area */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex h-9 w-9 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-accent text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background/95 backdrop-blur-sm border border-border" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{t?.nav?.account || 'Account'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    <span>{t?.nav?.dashboard || 'Dashboard'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    <span>{t?.nav?.settings || 'Settings'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    <span>{t?.nav?.signOut || 'Sign out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="hidden md:flex bg-gradient-accent hover:shadow-glow-accent transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                {t?.nav?.signIn || 'Sign In'}
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-9 h-9 p-0"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-glass-border animate-fade-in">
            <div className="flex flex-col space-y-1 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`py-3 px-4 rounded-lg transition-colors duration-300 font-medium min-h-[44px] flex items-center ${
                    isActive(item.href) 
                      ? 'text-golden font-semibold bg-accent/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-accent text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{t?.nav?.account || 'Account'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start min-h-[44px]"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/dashboard');
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {t?.nav?.dashboard || 'Dashboard'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start min-h-[44px]"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {t?.nav?.settings || 'Settings'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start min-h-[44px]"
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t?.nav?.signOut || 'Sign out'}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="mt-4 bg-gradient-accent w-full min-h-[48px]"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/auth');
                  }}
                >
                  {t?.nav?.signIn || 'Sign In'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;