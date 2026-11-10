import { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import { AppText, Button, Card, Chip, ErrorBox, Field, Loading, Screen } from '../../src/components/ui';
import { ar, type CategoryCode, type MarketCode } from '../../src/i18n/ar';
import { api, formatUsd, type Budget, type Preferences } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth';
import { useAsync } from '../../src/lib/useAsync';
import { colors, space } from '../../src/theme';

const MARKETS = Object.keys(ar.settings.marketNames) as MarketCode[];
const CATEGORIES = Object.keys(ar.settings.categoryNames) as CategoryCode[];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export default function Settings() {
  const { session, signOut } = useAuth();
  const me = useAsync(() => api.me(), []);
  const org = me.data?.organizations[0] ?? null;
  const isAdmin = org?.role === 'owner' || org?.role === 'admin';
  const budget = useAsync(() => (org ? api.budget(org.id) : Promise.resolve(null)), [org?.id]);
  const usage = useAsync(() => (org ? api.usage(org.id) : Promise.resolve(null)), [org?.id]);

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [prefsMsg, setPrefsMsg] = useState<string | null>(null);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [draft, setDraft] = useState<Omit<Budget, 'org_id'> | null>(null);
  const [budgetMsg, setBudgetMsg] = useState<string | null>(null);
  const [savingBudget, setSavingBudget] = useState(false);

  useEffect(() => {
    if (me.data?.preferences) setPrefs(me.data.preferences);
  }, [me.data]);
  useEffect(() => {
    if (budget.data) {
      const { org_id: _ignored, ...rest } = budget.data;
      setDraft(rest);
    }
  }, [budget.data]);

  async function savePrefs() {
    if (!prefs) return;
    if (prefs.markets.length === 0) return setPrefsMsg(ar.settings.atLeastOneMarket);
    setSavingPrefs(true);
    setPrefsMsg(null);
    try {
      setPrefs(
        await api.updatePreferences({
          markets: prefs.markets,
          notification_categories: prefs.notification_categories,
        }),
      );
      setPrefsMsg(ar.common.saved);
    } catch {
      setPrefsMsg(ar.common.errorGeneric);
    } finally {
      setSavingPrefs(false);
    }
  }

  async function saveBudget() {
    if (!org || !draft) return;
    const limit = Number(draft.monthly_limit_usd);
    if (!Number.isFinite(limit) || limit < 0) return setBudgetMsg(ar.common.errorGeneric);
    setSavingBudget(true);
    setBudgetMsg(null);
    try {
      await api.updateBudget(org.id, { ...draft, monthly_limit_usd: limit.toFixed(2) });
      await Promise.all([budget.reload(), usage.reload()]);
      setBudgetMsg(ar.common.saved);
    } catch {
      setBudgetMsg(ar.common.errorGeneric);
    } finally {
      setSavingBudget(false);
    }
  }

  if (me.loading && !me.data) return <Screen><Loading /></Screen>;
  if (me.error) return <Screen><ErrorBox message={ar.common.errorGeneric} onRetry={me.reload} /></Screen>;

  return (
    <Screen>
      <AppText variant="title">{ar.settings.title}</AppText>

      <Card title={ar.settings.account}>
        <AppText>{'⁦'}{session?.user.email}{'⁩'}</AppText>
        {org ? <AppText variant="small">{org.name} · {ar.roles[org.role]}</AppText> : null}
      </Card>

      {prefs ? (
        <Card title={ar.settings.markets}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {MARKETS.map((m) => (
              <Chip
                key={m}
                label={ar.settings.marketNames[m]}
                selected={prefs.markets.includes(m)}
                onPress={() => setPrefs({ ...prefs, markets: toggle(prefs.markets, m) })}
              />
            ))}
          </View>
          <AppText variant="heading" style={{ marginTop: space.lg, marginBottom: space.sm }}>
            {ar.settings.notifications}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={ar.settings.categoryNames[c]}
                selected={prefs.notification_categories.includes(c)}
                onPress={() =>
                  setPrefs({ ...prefs, notification_categories: toggle(prefs.notification_categories, c) })
                }
              />
            ))}
          </View>
          <Button label={ar.common.save} onPress={savePrefs} loading={savingPrefs} />
          {prefsMsg ? <AppText variant="small" style={{ marginTop: space.sm }}>{prefsMsg}</AppText> : null}
        </Card>
      ) : null}

      {org && usage.data ? (
        <Card title={ar.settings.usage}>
          <AppText>{ar.settings.actual}: {formatUsd(usage.data.actual_usd)}</AppText>
          <AppText>{ar.settings.estimated}: {formatUsd(usage.data.estimated_usd)}</AppText>
          <AppText
            variant="small"
            style={{ color: usage.data.status === 'ok' ? colors.ok : usage.data.status === 'alert' ? colors.warn : colors.danger }}
          >
            {ar.settings.status[usage.data.status]} · {usage.data.used_pct.toFixed(0)}%
          </AppText>
          {usage.data.by_task.length === 0 ? (
            <AppText variant="muted" style={{ marginTop: space.sm }}>{ar.settings.noUsage}</AppText>
          ) : (
            usage.data.by_task.map((t) => (
              <AppText key={`${t.task}-${t.model}`} variant="small">
                {t.task} · {t.model ?? '—'} · {t.calls} · {formatUsd(t.usd)}
              </AppText>
            ))
          )}
        </Card>
      ) : null}

      {org && draft ? (
        <Card title={ar.settings.budget}>
          <Field
            label={ar.settings.monthlyLimit}
            value={draft.monthly_limit_usd}
            onChangeText={(v) => setDraft({ ...draft, monthly_limit_usd: v.replace(/[^\d.]/g, '') })}
            keyboardType="decimal-pad"
            editable={isAdmin}
          />
          <Field
            label={`${ar.settings.alertAt} (%)`}
            value={String(draft.alert_threshold_pct)}
            onChangeText={(v) => {
              const n = Math.min(100, Math.max(1, Number(v.replace(/\D/g, '')) || 1));
              setDraft({ ...draft, alert_threshold_pct: n });
            }}
            keyboardType="number-pad"
            editable={isAdmin}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText style={{ flex: 1 }}>{ar.settings.hardStop}</AppText>
            <Switch
              value={draft.hard_stop}
              onValueChange={(v) => setDraft({ ...draft, hard_stop: v })}
              disabled={!isAdmin}
              trackColor={{ true: colors.primary }}
            />
          </View>
          {isAdmin ? (
            <Button label={ar.common.save} onPress={saveBudget} loading={savingBudget} />
          ) : (
            <AppText variant="small">{ar.settings.adminOnly}</AppText>
          )}
          {budgetMsg ? <AppText variant="small" style={{ marginTop: space.sm }}>{budgetMsg}</AppText> : null}
        </Card>
      ) : null}

      <Button kind="danger" label={ar.auth.signOut} onPress={() => void signOut()} />
    </Screen>
  );
}
