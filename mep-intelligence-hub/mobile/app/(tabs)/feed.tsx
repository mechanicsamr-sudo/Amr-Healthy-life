import { AppText, Card, Disclaimer, EmptyState, Screen } from '../../src/components/ui';
import { ar } from '../../src/i18n/ar';

export default function Feed() {
  return (
    <Screen>
      <AppText variant="title">{ar.feed.title}</AppText>
      <Card>
        <EmptyState icon="radio-outline" text={ar.feed.empty} />
      </Card>
      <Disclaimer />
    </Screen>
  );
}
