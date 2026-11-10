import { config } from './config';
import { supabase } from './supabase';
import type { CategoryCode, MarketCode, RoleCode } from '../i18n/ar';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'network_error');
  }
  if (!res.ok) {
    let code = 'http_error';
    try {
      const body = (await res.json()) as { detail?: { code?: string } };
      code = body.detail?.code ?? code;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, code);
  }
  return (await res.json()) as T;
}

export type Org = { id: string; name: string; role: RoleCode; created_at: string };

export type Preferences = {
  locale: 'ar' | 'en';
  timezone: string;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  notification_categories: CategoryCode[];
  markets: MarketCode[];
};

export type Me = {
  id: string;
  email: string | null;
  preferences: Preferences | null;
  organizations: Org[];
};

export type Budget = {
  org_id: string;
  monthly_limit_usd: string;
  alert_threshold_pct: number;
  hard_stop: boolean;
};

export type UsageSummary = {
  actual_usd: string;
  estimated_usd: string;
  monthly_limit_usd: string;
  alert_threshold_pct: number;
  used_pct: number;
  status: 'ok' | 'alert' | 'limit_reached';
  by_task: { task: string; model: string | null; calls: number; usd: number }[];
};

export const api = {
  me: () => request<Me>('/api/v1/me'),
  updatePreferences: (body: Partial<Preferences>) =>
    request<Preferences>('/api/v1/me/preferences', { method: 'PATCH', body: JSON.stringify(body) }),
  createOrg: (name: string) =>
    request<Org>('/api/v1/orgs', { method: 'POST', body: JSON.stringify({ name }) }),
  budget: (orgId: string) => request<Budget>(`/api/v1/orgs/${orgId}/budget`),
  updateBudget: (orgId: string, body: Omit<Budget, 'org_id'>) =>
    request<Budget>(`/api/v1/orgs/${orgId}/budget`, { method: 'PUT', body: JSON.stringify(body) }),
  usage: (orgId: string) => request<UsageSummary>(`/api/v1/orgs/${orgId}/usage/summary`),
};

export function formatUsd(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}
