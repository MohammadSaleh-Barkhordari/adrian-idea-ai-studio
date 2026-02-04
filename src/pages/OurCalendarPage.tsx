import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PersonalCalendarSection } from "@/components/PersonalCalendarSection";

export default function OurCalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const userEmail = session.user.email;
    const allowedEmails = ["raianasattari@gmail.com", "mosba1991@gmail.com"];
    
    if (!allowedEmails.includes(userEmail)) {
      navigate("/dashboard");
      return;
    }
    
    setUser(session.user);
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <Button
            onClick={() => navigate("/our-life")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Our Life
          </Button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Our Calendar
          </h1>
          <p className="text-muted-foreground mt-2">
            Personal planning and scheduling for our team
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <PersonalCalendarSection personName="Raiana" />
          <PersonalCalendarSection personName="Mohammad" />
        </div>
      </main>

      <Footer />
    </div>
  );
}