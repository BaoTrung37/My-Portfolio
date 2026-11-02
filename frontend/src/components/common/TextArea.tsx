import React, { useId } from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      value,
      id: customId,
      className = '',
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const currentLength = typeof value === 'string' ? value.length : 0;

    const borderClass = error
      ? 'border-error focus:border-error focus:ring-error/20'
      : 'border-neutral-divider focus:border-primary focus:ring-primary/20';

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-caption font-medium text-neutral-title select-none flex items-center gap-1"
            >
              <span>{label}</span>
              {props.required && <span className="text-error text-xs">*</span>}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-caption text-neutral-placeholder text-xs ml-auto">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-lg border bg-container px-3.5 py-2.5 text-body-1 text-neutral-title placeholder:text-neutral-placeholder transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed resize-y ${borderClass} ${className}`.trim()}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-error text-caption font-normal">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-neutral-secondary text-caption">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
