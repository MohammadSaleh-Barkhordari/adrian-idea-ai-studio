import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { HomeShell, PageHero, Field } from '@/components/home/shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { SEO } from '@/components/SEO';

type Mode = 'signin' | 'signup' | 'forgot';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('signin');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const langPrefix = language === 'en' ? '/en' : '';

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/dashboard');
    };
    checkAuth();
  }, [navigate]);

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else {
        toast({ title: 'Reset link sent!', description: 'Check your email for a password reset link.' });
        setMode('signin');
      }
    } catch {
      toast({ title: 'An error occurred', description: 'Please try again later.', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast({ title: 'Sign In Failed', description: error.message, variant: 'destructive' });
      else {
        toast({ title: 'Welcome back!', description: "You've successfully signed in." });
        navigate('/dashboard');
      }
    } catch {
      toast({ title: 'An error occurred', description: 'Please try again later.', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) toast({ title: 'Sign Up Failed', description: error.message, variant: 'destructive' });
      else toast({ title: 'Account Created!', description: 'Please check your email to verify your account.' });
    } catch {
      toast({ title: 'An error occurred', description: 'Please try again later.', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') handleSignIn();
    else if (mode === 'signup') handleSignUp();
    else handleForgotPassword();
  };

  return (
    <HomeShell>
      <PageHero
        crumb="Account"
        titleHtml={<>Welcome<br /><span className="serif">back</span></>}
        intro="Sign in to your account or create a new one to continue."
      />

      <section>
        <div className="wrap auth-wrap">
          <div className="auth-back">
            <Link to={langPrefix || '/'} className="btn btn-line btn-sm magnetic" data-cursor="back">
              ← Back to Home
            </Link>
          </div>

          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode !== 'signup'}
              className={`btn btn-sm magnetic ${mode !== 'signup' ? 'btn-fill' : 'btn-line'}`}
              onClick={() => setMode('signin')}
            >
              <span>Sign in</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`btn btn-sm magnetic ${mode === 'signup' ? 'btn-fill' : 'btn-line'}`}
              onClick={() => setMode('signup')}
            >
              <span>Sign up</span>
            </button>
          </div>

          <form onSubmit={onSubmit} className="ai-form auth-form">
            {mode === 'forgot' ? (
              <>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    required
                  />
                </Field>
                <button type="submit" disabled={isLoading || !email} className="btn btn-fill magnetic" data-cursor="send">
                  <span>{isLoading ? 'Sending…' : 'Send reset link'}</span>
                </button>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setMode('signin')}
                >
                  ← Back to sign in
                </button>
              </>
            ) : (
              <>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    required
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    disabled={isLoading}
                    required
                  />
                </Field>
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="btn btn-fill magnetic"
                  data-cursor="start"
                >
                  <span>
                    {isLoading
                      ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                      : (mode === 'signup' ? 'Create account' : 'Sign in')}
                  </span>
                </button>
                {mode === 'signin' && (
                  <button
                    type="button"
                    className="auth-link"
                    onClick={() => setMode('forgot')}
                  >
                    Forgot password?
                  </button>
                )}
              </>
            )}
          </form>
        </div>
      </section>
    </HomeShell>
  );
};

export default AuthPage;
