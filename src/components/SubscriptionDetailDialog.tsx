import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Globe, Mail, Users, Calendar, CreditCard, Info, ExternalLink } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface SubscriptionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: any;
  accountOwnerName?: string;
}

const STATUS_BADGES: Record<string, { className: string; label: string }> = {
  active: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Active' },
  trial: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Trial' },
  cancelled: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Cancelled' },
  expired: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', label: 'Expired' },
  paused: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Paused' },
  free_tier: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', label: 'Free Tier' },
};

const formatCost = (cost: number | null, currency: string | null, cycle: string | null) => {
  if (!cost) return 'Free';
  const sym = { USD: '$', EUR: '€', GBP: '£', IRR: 'IRR ' }[currency || 'USD'] || currency || '';
  const cycleMap: Record<string, string> = { monthly: '/month', yearly: '/year', weekly: '/week', pay_as_you_go: ' (pay as you go)', lifetime: ' (lifetime)', free: '' };
  return `${sym}${cost.toLocaleString()}${cycleMap[cycle || 'monthly'] || ''}`;
};

const SubscriptionDetailDialog = ({ open, onOpenChange, subscription: s, accountOwnerName }: SubscriptionDetailDialogProps) => {
  if (!s) return null;

  const statusBadge = STATUS_BADGES[s.status] || { className: '', label: s.status };
  const seatsPercent = s.max_seats && s.used_seats != null ? (s.used_seats / s.max_seats) * 100 : null;
  const daysUntilPayment = s.next_payment_date ? differenceInDays(new Date(s.next_payment_date), new Date()) : null;

  const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 font-medium text-sm">
        <Icon className="w-4 h-4 text-muted-foreground" /> {title}
      </h3>
      <div className="pl-6 space-y-1.5 text-sm">{children}</div>
    </div>
  );

  const Row = ({ label, value, dir }: { label: string; value?: string | null; dir?: string }) =>
    value ? <div className="flex justify-between gap-2"><span className="text-muted-foreground">{label}</span><span className="text-right" dir={dir}>{value}</span></div> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[550px] p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center gap-3">
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.app_name} className="w-12 h-12 rounded-lg object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Globe className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <DialogTitle className="text-lg">{s.app_name}</DialogTitle>
              {s.app_name_fa && <p className="text-sm text-muted-foreground" dir="rtl">{s.app_name_fa}</p>}
            </div>
            <Badge className={`${statusBadge.className} ml-auto flex-shrink-0`}>{statusBadge.label}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[60vh] px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-4 pt-4">
            {/* App Info */}
            <Section icon={Info} title="App Information">
              {s.purpose && <p>{s.purpose}</p>}
              {s.purpose_fa && <p dir="rtl" className="text-muted-foreground">{s.purpose_fa}</p>}
              {s.website_url && (
                <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  {s.website_url} <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <Row label="Category" value={s.category?.replace('_', ' ')} />
              {s.used_by_teams?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-muted-foreground">Teams:</span>
                  {s.used_by_teams.map((t: string) => <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>)}
                </div>
              )}
            </Section>

            <Separator />

            {/* Billing */}
            <Section icon={CreditCard} title="Billing">
              <Row label="Plan" value={s.plan_name} />
              <Row label="Cost" value={formatCost(s.cost_per_cycle, s.currency, s.billing_cycle)} />
              <Row label="Billing Cycle" value={s.billing_cycle?.replace('_', ' ')} />
              <Row label="Payment Day" value={s.payment_day ? `Day ${s.payment_day}` : null} />
              <Row label="Reset Day" value={s.reset_day ? `Day ${s.reset_day}` : null} />
              <Row label="Auto Renew" value={s.auto_renew ? 'Yes' : 'No'} />
              {daysUntilPayment !== null && (
                <div className="mt-2">
                  <Badge variant={daysUntilPayment <= 7 ? 'destructive' : 'outline'}>
                    {daysUntilPayment <= 0 ? 'Payment overdue' : `Payment in ${daysUntilPayment} days`}
                  </Badge>
                </div>
              )}
            </Section>

            <Separator />

            {/* Usage */}
            <Section icon={Users} title="Access & Usage">
              <Row label="Login Email" value={s.login_email} />
              <Row label="Login Method" value={s.login_method} />
              <Row label="Account Owner" value={accountOwnerName} />
              <Row label="Usage Limit" value={s.usage_limit} />
              {s.usage_limit_fa && <Row label="Usage (FA)" value={s.usage_limit_fa} />}
              {seatsPercent !== null && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Seats</span>
                    <span>{s.used_seats}/{s.max_seats}</span>
                  </div>
                  <Progress value={seatsPercent} className="h-2" />
                </div>
              )}
              {s.access_instructions && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-1">Access Instructions</p>
                  <p className="text-sm whitespace-pre-wrap">{s.access_instructions}</p>
                </div>
              )}
              {s.access_instructions_fa && (
                <div className="mt-1 p-3 bg-muted rounded-lg" dir="rtl">
                  <p className="text-xs font-medium mb-1">دستورالعمل دسترسی</p>
                  <p className="text-sm whitespace-pre-wrap">{s.access_instructions_fa}</p>
                </div>
              )}
            </Section>

            <Separator />

            {/* Dates */}
            <Section icon={Calendar} title="Dates">
              <Row label="Start Date" value={s.start_date} />
              <Row label="Next Payment" value={s.next_payment_date} />
              <Row label="Expiry Date" value={s.expiry_date} />
            </Section>

            {/* Notes */}
            {(s.notes || s.notes_fa) && (
              <>
                <Separator />
                <Section icon={Info} title="Notes">
                  {s.notes && <p className="whitespace-pre-wrap">{s.notes}</p>}
                  {s.notes_fa && <p className="whitespace-pre-wrap text-muted-foreground" dir="rtl">{s.notes_fa}</p>}
                </Section>
              </>
            )}

            {/* Tags */}
            {s.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {s.tags.map((tag: string) => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDetailDialog;
