import type { ComponentPropsWithoutRef } from 'react';

type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  variant?: 'secondary' | 'success' | 'destructive' | 'warning';
};

export function Badge({ className, variant = 'secondary', ...props }: BadgeProps) {
  return <span {...props} className={className ? 'ui-badge ' + className : 'ui-badge'}
    data-slot="badge" data-variant={variant} />;
}
