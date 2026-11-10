import { AppText, Card, EmptyState, Screen } from '../../src/components/ui';
import { ar } from '../../src/i18n/ar';

export default function Library() {
  return (
    <Screen>
      <AppText variant="title">{ar.library.title}</AppText>
      <Card>
        <EmptyState icon="bookmarks-outline" text={ar.library.empty} />
      </Card>
    </Screen>
  );
}
