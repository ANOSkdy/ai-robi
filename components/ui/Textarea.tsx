import * as React from 'react';

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border px-3 py-2 shadow-sm outline-none focus:ring-2 focus:ring-black/20 ${className}`}
    />
  );
}

