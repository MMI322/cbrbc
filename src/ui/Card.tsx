import type { ComponentPropsWithoutRef } from 'react';

export function Card({ className, ...props }: ComponentPropsWithoutRef<'article'>) {
  return <article {...props} className={className ? 'ui-card ' + className : 'ui-card'} data-slot="card" />;
}
