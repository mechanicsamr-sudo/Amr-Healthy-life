import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Button, Card, ErrorBox, Field, Screen } from '../src/components/ui';
import { ar } from '../src/i18n/ar';
import { useAuth } from '../src/lib/auth';
import { colors, space } from '../src/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { sendCode, verifyCode } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSend() {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return setError(ar.auth.invalidEmail);
    setBusy(true);
    setError(null);
    try {
      await sendCode(clean);
      setEmail(clean);
      setStep('code');
    } catch {
      setError(ar.common.errorNetwork);
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    if (!/^\d{6}$/.test(code.trim())) return setError(ar.auth.invalidCode);
    setBusy(true);
    setError(null);
    try {
      await verifyCode(email, code.trim());
      // Navigation happens automatically when the session changes.
    } catch {
      setError(ar.auth.invalidCode);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: space.xl, marginBottom: space.md }}>
        <AppText variant="title" style={{ color: colors.primary }}>{ar.appName}</AppText>
        <AppText variant="muted">{ar.auth.subtitle}</AppText>
      </View>
      <Card title={ar.auth.title}>
        {step === 'email' ? (
          <>
            <Field
              label={ar.auth.emailLabel}
              placeholder={ar.auth.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
            />
            <Button label={ar.auth.sendCode} onPress={onSend} loading={busy} />
          </>
        ) : (
          <>
            <AppText variant="muted" style={{ marginBottom: space.md }}>
              {ar.auth.codeSent} {'⁦'}{email}{'⁩'}
            </AppText>
            <Field
              label={ar.auth.codeLabel}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
            />
            <Button label={ar.auth.verify} onPress={onVerify} loading={busy} />
            <Button
              kind="secondary"
              label={ar.auth.changeEmail}
              onPress={() => {
                setStep('email');
                setCode('');
                setError(null);
              }}
            />
          </>
        )}
        {error ? <View style={{ marginTop: space.md }}><ErrorBox message={error} /></View> : null}
      </Card>
    </Screen>
  );
}
