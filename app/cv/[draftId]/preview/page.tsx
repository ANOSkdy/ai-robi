import Link from 'next/link';
import { getDraft } from '@/app/actions/drafts';
import { cvPayloadSchema } from '@/lib/schemas/cv';

export default async function CvPreviewPage({ params }: { params: { draftId: string } }) {
  const draft = await getDraft(params.draftId);

  if (!draft) {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-xl font-semibold">ドラフトが見つかりません</h1>
        <p className="text-sm text-[color:rgb(var(--muted-fg))]">ドラフトID {params.draftId} は存在しません。新しく作成してください。</p>
        <Link className="text-sm text-primary underline" href="/cv/new">
          新規で作成する
        </Link>
      </div>
    );
  }

  const parsed = cvPayloadSchema.partial().safeParse(draft.payload ?? {});
  const data = parsed.success ? parsed.data : {};
  const statusLabel = draft.status === 'submitted' ? '送信済み' : '下書き';

  const educationItems = Array.isArray(data.education) ? data.education : [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">履歴書プレビュー</h1>
        <p className="text-sm text-[color:rgb(var(--muted-fg))]">
          ステータス: {statusLabel}・最終更新: {new Date(draft.updatedAt).toLocaleString('ja-JP')}
        </p>
      </header>

      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="text-base font-semibold">基本情報</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">氏名</dt>
            <dd>{data.basic?.lastName ?? '-'} {data.basic?.firstName ?? ''}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">ふりがな</dt>
            <dd>{data.basic?.kana ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">生年月日</dt>
            <dd>{data.basic?.birthDate ?? '-'}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="text-base font-semibold">連絡先</h2>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">郵便番号</dt>
            <dd>{data.contact?.postalCode ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">住所</dt>
            <dd>{data.contact?.address ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">電話番号</dt>
            <dd>{data.contact?.phone ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-[color:rgb(var(--muted-fg))]">メール</dt>
            <dd>{data.contact?.email ?? '-'}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="text-base font-semibold">学歴</h2>
        <div className="space-y-2 text-sm">
          {educationItems.length === 0 ? (
            <div className="rounded border border-dashed p-3 text-[color:rgb(var(--muted-fg))]">学歴はまだ入力されていません。</div>
          ) : (
            educationItems.map((item, index) => (
              <div key={index} className="rounded border border-dashed p-3">
                <div className="font-medium">{item.school ?? '未入力'}</div>
                <div className="text-xs text-[color:rgb(var(--muted-fg))]">{item.degree ?? '学位未入力'}</div>
                <div className="text-xs text-[color:rgb(var(--muted-fg))]">
                  {item.start ?? '-'} ~ {item.end ?? '-'}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="flex items-center justify-between">
        <Link className="text-sm text-primary underline" href={`/cv/${params.draftId}/basic`}>
          編集に戻る
        </Link>
        <Link className="text-sm text-primary underline" href="/cv/new">
          新しいドラフトを作成
        </Link>
      </footer>
    </div>
  );
}
