import { createDraft } from '@/app/actions/drafts';
import StepNav from '@/components/nav/StepNav';
import Section from '@/components/ui/Section';

export default async function NewCvPage() {
  const draft = await createDraft('cv');

  return (
    <Section title="履歴書を新規作成" description="ウィザード形式で入力を進められます。下書きは自動保存されます。">
      <p className="text-sm text-[color:rgb(var(--muted-fg))]">
        次のステップで基本情報を入力し、ステップナビで確認しながら進められます。入力途中でもブラウザーの戻るボタンやスキップリンクから安全に操作できます。
      </p>
      <StepNav backHref="/" nextHref={`/cv/${draft.draftId}/basic`} nextLabel="作成を開始" />
    </Section>
  );
}
