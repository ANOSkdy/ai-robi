"use client";
export default function Page() {
  const gen = async (kind:"resume"|"cv") => {
    const res = await fetch(`/api/pdf/${kind}`, { method:"POST" });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${kind}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">プレビュー / PDF</h2>
      <div className="flex gap-3">
        <button className="px-4 py-2 border rounded" onClick={()=>gen("resume")}>履歴書PDF(雛形)</button>
        <button className="px-4 py-2 border rounded" onClick={()=>gen("cv")}>職務経歴書PDF(雛形)</button>
      </div>
      <p className="text-sm text-gray-600">※ 日本語フォント(TTF)は <code>/public/fonts</code> に配置してください。</p>
    </div>
  );
}
