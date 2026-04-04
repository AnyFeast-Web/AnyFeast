import React, { useState } from 'react';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex items-center gap-1 border-b border-border-subtle', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-3 text-sm font-display font-medium transition-all duration-200 border-b-2 -mb-[1px]',
            activeTab === tab.id
              ? 'text-brand-primary border-brand-primary'
              : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-strong'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
