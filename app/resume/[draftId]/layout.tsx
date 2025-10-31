import type { ReactNode } from 'react';
import { getDraft } from '@/app/actions/drafts';

export default async function ResumeDraftLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { draftId: string };
}) {
  const draft = await getDraft(params.draftId);
  const title = draft?.status === 'submitted' ? '職務経歴書（送信済み）' : '職務経歴書ドラフト';

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 pb-24">
      <header>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">ドラフトID: {params.draftId}</p>
      </header>
      {children}
    </div>
  );
}
