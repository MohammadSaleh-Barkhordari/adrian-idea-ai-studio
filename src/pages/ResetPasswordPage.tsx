import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { HomeShell, PageHero, Field } from '@/components/home/shared';
import { SEO } from '@/components/SEO';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setCanReset(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: 'Please make sure both passwords match.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
      else {
        toast({ title: 'Password Updated!', description: 'Your password has been reset successfully.' });
        navigate('/dashboard');
      }
    } catch {
      toast({ title: 'An error occurred', description: 'Please try again later.', variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  return (
    <HomeShell>
      <PageHero
        crumb="Account"
        titleHtml={<>Reset<br /><span className="serif">password</span></>}
        intro={canReset ? 'Enter your new password below.' : 'Verifying your reset link…'}
      />
      <section>
        <div className="wrap auth-wrap">
          {canReset ? (
            <form onSubmit={handleReset} className="ai-form auth-form">
              <Field label="New password">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field label="Confirm password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                />
              </Field>
              <button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword}
                className="btn btn-fill magnetic"
                data-cursor="send"
              >
                <span>{isLoading ? 'Resetting…' : 'Reset password'}</span>
              </button>
            </form>
          ) : (
            <p style={{ color: 'var(--ink-dim)', fontWeight: 300, maxWidth: '52ch' }}>
              If this page doesn't update, your reset link may have expired. Please request a new one from the sign-in page.
            </p>
          )}
        </div>
      </section>
    </HomeShell>
  );
};

export default ResetPasswordPage;
