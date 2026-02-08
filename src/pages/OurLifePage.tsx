import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Calendar, CheckSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OurLifePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      
      // Check if user has access to this page
      const allowedEmails = ['raianasattari@gmail.com', 'mosba1991@gmail.com'];
      if (!allowedEmails.includes(session.user.email)) {
        navigate('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const ourLifeItems = [
    {
      title: 'Our Financial',
      description: 'Manage personal finances, budgets, and expenses',
      icon: Calculator,
      color: 'text-green-500',
      onClick: () => {
        navigate('/our-financial');
      }
    },
    {
      title: 'Our Calendar',
      description: 'Personal calendar and event management',
      icon: Calendar,
      color: 'text-blue-500',
      onClick: () => {
        navigate('/our-calendar');
      }
    },
    {
      title: 'To Do List',
      description: 'Personal tasks and to-do items',
      icon: CheckSquare,
      color: 'text-purple-500',
      onClick: () => {
        navigate('/our-todo');
      }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" dir="ltr">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-3 sm:mb-4 hover:bg-accent min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-lg bg-rose-500/10">
                <CheckSquare className="h-6 w-6 sm:h-8 sm:w-8 text-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">Our Life</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Personal management tools for {user?.email?.split('@')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Our Life Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {ourLifeItems.map((item, index) => (
              <Card 
                key={index} 
                className="glass hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={item.onClick}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Welcome Message */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Welcome to Your Personal Space</CardTitle>
              <CardDescription>
                This section is exclusively available for you and your partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the sections above to manage your personal finances, calendar events, 
                and to-do lists. Each section is designed to help you stay organized 
                and keep track of your personal life.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OurLifePage;