import React from 'react'

export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="border-b border-soft flex items-center gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab
        return (
          <button
            key={tab.value}
            className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              isActive
                ? 'text-primary-strong bg-surface shadow-sm border border-b-[var(--color-surface)] border-soft'
                : 'text-subtle hover:text-primary-strong hover:bg-surface-muted'
            }`}
            onClick={() => onChange(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
