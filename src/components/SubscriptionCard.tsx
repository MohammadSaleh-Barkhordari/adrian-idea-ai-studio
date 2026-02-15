import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, Eye, Edit, Globe, Mail, Users } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  ai_tools: 'border-l-purple-500',
  design: 'border-l-pink-500',
  development: 'border-l-blue-500',
  communication: 'border-l-green-500',
  project_management: 'border-l-orange-500',
  marketing: 'border-l-red-500',
  analytics: 'border-l-teal-500',
  cloud_hosting: 'border-l-indigo-500',
  video_production: 'border-l-amber-500',
  storage: 'border-l-slate-500',
  '3d_modeling': 'border-l-cyan-500',
  other: 'border-l-gray-500',
};

const STATUS_BADGES: Record<string, { className: string; label: string }> = {
  active: { className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Active' },
  trial: { className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Trial' },
  cancelled: { className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Cancelled' },
  expired: { className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', label: 'Expired' },
  paused: { className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Paused' },
  free_tier: { className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', label: 'Free Tier' },
};

interface SubscriptionCardProps {
  subscription: any;
  isAdmin: boolean;
  onViewDetails: () => void;
  onEdit: () => void;
}

const formatCost = (cost: number | null, currency: string | null, cycle: string | null) => {
  if (!cost) return 'Free';
  const sym = { USD: '$', EUR: '€', GBP: '£', IRR: 'IRR ' }[currency || 'USD'] || currency || '';
  const cycleLabel = { monthly: '/mo', yearly: '/yr', weekly: '/wk', pay_as_you_go: '' }[cycle || 'monthly'] || '';
  return `${sym}${cost.toLocaleString()}${cycleLabel}`;
};

const SubscriptionCard = ({ subscription, isAdmin, onViewDetails, onEdit }: SubscriptionCardProps) => {
  const s = subscription;
  const borderColor = CATEGORY_COLORS[s.category] || CATEGORY_COLORS.other;
  const statusBadge = STATUS_BADGES[s.status] || { className: 'bg-gray-100 text-gray-800', label: s.status };
  const seatsPercent = s.max_seats && s.used_seats != null ? (s.used_seats / s.max_seats) * 100 : null;

  return (
    <Card className={`border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.app_name} className="w-10 h-10 rounded-lg object-contain flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{s.app_name}</h3>
              {s.app_name_fa && <p className="text-xs text-muted-foreground truncate" dir="rtl">{s.app_name_fa}</p>}
            </div>
          </div>
          <Badge className={`${statusBadge.className} flex-shrink-0`}>{statusBadge.label}</Badge>
        </div>

        {/* Purpose */}
        {s.purpose && <p className="text-sm text-muted-foreground line-clamp-2">{s.purpose}</p>}

        {/* Plan & Cost */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {s.plan_name && <Badge variant="outline">{s.plan_name}</Badge>}
          <span className="font-medium">{formatCost(s.cost_per_cycle, s.currency, s.billing_cycle)}</span>
          {s.payment_day && <span className="text-muted-foreground">• Day {s.payment_day}</span>}
        </div>

        {/* Usage & Seats */}
        {s.usage_limit && <p className="text-xs text-muted-foreground">Usage: {s.usage_limit}</p>}
        {seatsPercent !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Seats</span>
              <span>{s.used_seats}/{s.max_seats}</span>
            </div>
            <Progress value={seatsPercent} className="h-2" />
          </div>
        )}

        {/* Login & Website */}
        {s.login_email && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{s.login_email}</span>
            {s.login_method && <span>({s.login_method})</span>}
          </div>
        )}

        {/* Teams */}
        {s.used_by_teams?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Users className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            {s.used_by_teams.map((team: string) => (
              <Badge key={team} variant="secondary" className="text-xs capitalize">{team}</Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
            <Eye className="w-3.5 h-3.5 mr-1" /> Details
          </Button>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
          {s.website_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={s.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
