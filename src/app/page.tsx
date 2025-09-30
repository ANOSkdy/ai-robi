export default function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">AI-ROBI ドキュメント生成</h1>
      <p className="text-sm text-gray-600">履歴書/職務経歴書の入力フローへ進んでください。</p>
      <div className="flex gap-3">
        <a className="px-4 py-2 bg-black text-white rounded" href="/resume/profile">履歴書を作成</a>
        <a className="px-4 py-2 border rounded" href="/cv">職務経歴書を作成</a>
        <a className="px-4 py-2 border rounded" href="/preview">プレビュー</a>
      </div>
    </div>
  );
}
