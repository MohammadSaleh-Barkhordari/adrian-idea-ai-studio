import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" dir="ltr">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Building2 className="h-7 w-7 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Customer Detail</h1>
          </div>

          <div className="text-center py-16 text-muted-foreground">
            <p>Customer detail view coming in Phase C.</p>
            <p className="text-sm mt-2">Customer ID: {customerId}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDetailPage;
