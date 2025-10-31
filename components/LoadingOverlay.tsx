'use client';
export default function LoadingOverlay({ show, text }: { show: boolean; text?: string }) {
  if (!show) return null;
  return (
    <div className="eco-modal-overlay">
      <div className="eco-modal-content">
        <div className="eco-loader" />
        <p>{text || '処理を実行中です...'}</p>
      </div>
    </div>
  );
}

