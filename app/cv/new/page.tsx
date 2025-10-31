import Link from 'next/link';
import { createDraft } from '@/app/actions/drafts';

export default async function NewCvPage() {
  const draft = await createDraft('cv');

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">履歴書を新規作成</h1>
        <p className="text-sm text-gray-500">ウィザード形式で入力を進められます。下書きは自動保存されます。</p>
      </header>
      <Link
        href={`/cv/${draft.draftId}/basic`}
        className="inline-flex w-fit items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
      >
        作成を開始
      </Link>
    </div>
  );
}
