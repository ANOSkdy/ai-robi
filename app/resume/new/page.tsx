import Link from 'next/link';
import { createDraft } from '@/app/actions/drafts';

export default async function NewResumePage() {
  const draft = await createDraft('resume');

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">職務経歴書を新規作成</h1>
        <p className="text-sm text-gray-500">ドラフトは自動保存され、後から再開できます。</p>
      </header>
      <Link
        href={`/resume/${draft.draftId}/summary`}
        className="inline-flex w-fit items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
      >
        作成を開始
      </Link>
    </div>
  );
}
