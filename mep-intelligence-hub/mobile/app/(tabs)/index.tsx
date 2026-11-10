import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  Card,
  Disclaimer,
  EmptyState,
  ErrorBox,
  Field,
  Loading,
  Screen,
} from '../../src/components/ui';
import { ar } from '../../src/i18n/ar';
import { api, ApiError, formatUsd } from '../../src/lib/api';
import { useAsync } from '../../src/lib/useAsync';
import { colors, space } from '../../src/theme';

function errorText(e: unknown) {
  return e instanceof ApiError && e.code === 'network_error' ? ar.common.errorNetwork : ar.common.errorGeneric;
}

export default function Home() {
  const me = useAsync(() => api.me(), []);
  const org = me.data?.organizations[0] ?? null;
  const usage = useAsync(() => (org ? api.usage(org.id) : Promise.resolve(null)), [org?.id]);

  const [orgName, setOrgName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function createOrg() {
    if (orgName.trim().length < 2) return;
    setCreating(true);
    setCreateError(null);
    try {
      await api.createOrg(orgName.trim());
      setOrgName('');
      await me.reload();
    } catch (e) {
      setCreateError(errorText(e));
    } finally {
      setCreating(false);
    }
  }

  if (me.loading && !me.data) return <Screen><Loading /></Screen>;
  if (me.error) return <Screen><ErrorBox message={errorText(me.error)} onRetry={me.reload} /></Screen>;

  return (
    <Screen>
      <View>
        <AppText variant="muted">{ar.home.greeting}</AppText>
        <AppText variant="title" style={{ color: colors.primary }}>{ar.appName}</AppText>
      </View>

      {org ? (
        <Card title={ar.home.currentOrg}>
          <AppText variant="heading">{org.name}</AppText>
          <AppText variant="small">{ar.roles[org.role]}</AppText>
        </Card>
      ) : (
        <Card title={ar.home.noOrgTitle}>
          <AppText variant="muted" style={{ marginBottom: space.md }}>{ar.home.noOrgBody}</AppText>
          <Field label={ar.home.orgNameLabel} value={orgName} onChangeText={setOrgName} maxLength={120} />
          <Button label={ar.home.createOrg} onPress={createOrg} loading={creating} disabled={orgName.trim().length < 2} />
          {createError ? <ErrorBox message={createError} /> : null}
        </Card>
      )}

      {org && usage.data ? (
        <Card title={ar.home.costThisMonth}>
          <AppText variant="title">
            {formatUsd(Number(usage.data.actual_usd) + Number(usage.data.estimated_usd))}
            <AppText variant="muted"> / {formatUsd(usage.data.monthly_limit_usd)}</AppText>
          </AppText>
          <AppText
            variant="small"
            style={{ color: usage.data.status === 'ok' ? colors.ok : usage.data.status === 'alert' ? colors.warn : colors.danger }}
          >
            {ar.settings.status[usage.data.status]} · {usage.data.used_pct.toFixed(0)}%
          </AppText>
        </Card>
      ) : null}

      <Card title={ar.home.topOpportunities}>
        <EmptyState icon="trending-up-outline" text={ar.home.emptyPipeline} />
      </Card>
      <Card title={ar.home.newStandards}>
        <EmptyState icon="document-text-outline" text={ar.home.emptyPipeline} />
      </Card>
      <Disclaimer />
    </Screen>
  );
}
