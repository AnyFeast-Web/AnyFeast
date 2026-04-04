import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

function CardRoot({ children, className, hover = true, glow = false, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-bg-surface border border-border-subtle rounded-lg p-6 transition-all duration-200',
        hover && 'hover:border-border-strong',
        glow && 'shadow-teal-glow border-border-active',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={clsx('text-md font-display font-semibold text-text-primary', className)}>
      {children}
    </h3>
  );
}

function CardActions({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {children}
    </div>
  );
}

function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx(className)}>{children}</div>;
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Actions: CardActions,
  Body: CardBody,
});
