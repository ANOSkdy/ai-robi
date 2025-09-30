import React, { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

const baseClasses = "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300";

const PrimaryButton = forwardRef(function PrimaryButton(
  { children, className = "", loading = false, disabled, type = "button", ...props }: PrimaryButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const mergedClassName = className ? `${baseClasses} ${className}` : baseClasses;
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={mergedClassName}
      disabled={isDisabled}
      aria-busy={loading ? "true" : undefined}
    >
      {loading ? "処理中..." : children}
    </button>
  );
});

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
