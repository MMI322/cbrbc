import type { ComponentPropsWithRef } from 'react';

export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return <input {...props} className={className ? 'ui-input ' + className : 'ui-input'} data-slot="input" />;
}
