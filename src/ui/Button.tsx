import type { ComponentPropsWithRef } from 'react';

type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default';
};

export function Button({ className, variant = 'default', size = 'sm', type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={className ? 'ui-button ' + className : 'ui-button'}
    data-slot="button" data-variant={variant} data-size={size} />;
}
