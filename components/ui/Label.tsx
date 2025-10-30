import * as React from 'react';

export default function Label({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`block text-sm font-medium text-neutral-700 ${className}`} {...props} />;
}

