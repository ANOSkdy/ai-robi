import Link from 'next/link';
import { getDraft } from '@/app/actions/drafts';
import { resumePayloadSchema } from '@/lib/schemas/resume';

export default async function ResumePreviewPage({ params }: { params: { draftId: string } }) {
  const draft = await getDraft(params.draftId);

  if (!draft) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">ドラフトが見つかりません</h1>
        <p className="text-sm text-gray-500">ドラフトID {params.draftId} は存在しません。新しく作成してください。</p>
        <Link className="text-sm text-blue-600 underline" href="/resume/new">
          新規で作成する
        </Link>
      </div>
    );
  }

  const parsed = resumePayloadSchema.partial().safeParse(draft.payload ?? {});
  const data = parsed.success ? parsed.data : {};
  const statusLabel = draft.status === 'submitted' ? '送信済み' : '下書き';

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">職務経歴書プレビュー</h1>
        <p className="text-sm text-gray-500">
          ステータス: {statusLabel}・最終更新: {new Date(draft.updatedAt).toLocaleString('ja-JP')}
        </p>
      </header>

      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="text-base font-semibold">職務要約</h2>
        <p className="whitespace-pre-wrap text-sm">{data.summary ?? '未入力'}</p>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="text-base font-semibold">スキル</h2>
        <div className="space-y-2 text-sm">
          {(data.skills && data.skills.length > 0 ? data.skills : [{}]).map((skill, index) => (
            <div key={index} className="rounded border border-dashed p-3">
              <div className="font-medium">{skill?.name ?? '未入力'}</div>
              <div className="text-xs text-gray-500">{skill?.level ?? 'レベル未入力'}</div>
              <p className="text-xs text-gray-500">{skill?.description ?? '補足なし'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="text-base font-semibold">職歴</h2>
        <div className="space-y-2 text-sm">
          {(data.history && data.history.length > 0 ? data.history : [{}]).map((item, index) => (
            <div key={index} className="rounded border border-dashed p-3">
              <div className="font-medium">{item?.company ?? '未入力'}</div>
              <div className="text-xs text-gray-500">{item?.role ?? '役職未入力'}</div>
              <div className="text-xs text-gray-500">
                {item?.start ?? '-'} ~ {item?.end ?? '-'}
              </div>
              <p className="text-xs text-gray-500 whitespace-pre-wrap">{item?.detail ?? '詳細未入力'}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="flex items-center justify-between">
        <Link className="text-sm text-blue-600 underline" href={`/resume/${params.draftId}/summary`}>
          編集に戻る
        </Link>
        <Link className="text-sm text-blue-600 underline" href="/resume/new">
          新しいドラフトを作成
        </Link>
      </footer>
    </div>
  );
}
