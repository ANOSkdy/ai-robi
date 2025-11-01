import { createDraft } from '@/app/actions/drafts';
import StepNav from '@/components/nav/StepNav';
import Section from '@/components/ui/Section';

export default async function NewResumePage() {
  const draft = await createDraft('resume');

  return (
    <Section title="職務経歴書を新規作成" description="ドラフトは自動保存され、後から再開できます。">
      <p className="text-sm text-gray-600">
        ステップナビが現在の位置を案内し、入力内容は各ステップ終了時に検証されます。必要なときはスキップリンクでメインコンテンツに移動できます。
      </p>
      <StepNav backHref="/" nextHref={`/resume/${draft.draftId}/summary`} nextLabel="作成を開始" />
    </Section>
  );
}
