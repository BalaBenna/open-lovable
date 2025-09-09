import React from 'react';
import { cn } from '@/lib/utils';
import { Input, InputProps } from '../atoms/Input';
import { Textarea, TextareaProps } from '../atoms/Textarea';

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  className,
  children
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export interface InputFieldProps extends Omit<InputProps, 'error'> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required,
  className,
  ...props
}) => {
  return (
    <FormField label={label} error={error} required={required}>
      <Input
        className={cn(error && 'border-red-500', className)}
        {...props}
      />
    </FormField>
  );
};

export interface TextareaFieldProps extends Omit<TextareaProps, 'error'> {
  label?: string;
  error?: string;
  required?: boolean;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  error,
  required,
  className,
  ...props
}) => {
  return (
    <FormField label={label} error={error} required={required}>
      <Textarea
        className={cn(error && 'border-red-500', className)}
        {...props}
      />
    </FormField>
  );
};

export { FormField as default };
