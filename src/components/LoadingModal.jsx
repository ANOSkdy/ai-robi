'use client';

import React from 'react';

export default function LoadingModal({ loading, message = '処理中です…' }) {
  if (!loading) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-live="assertive"
      >
        <div className="loader" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
}
