import type { ReactNode } from 'react';
import { getDraftRepo } from '@/lib/drafts-repo';

type LayoutParams = Promise<{ draftId: string }> | { draftId: string };

export default async function CvDraftLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: LayoutParams;
}) {
  const resolvedParams = await params;
  const draft = await getDraftRepo(resolvedParams.draftId);
  const title = draft?.status === 'submitted' ? '履歴書（送信済み）' : '履歴書ドラフト';

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 pb-24">
      <header>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">ドラフトID: {resolvedParams.draftId}</p>
      </header>
      {children}
    </div>
  );
}
