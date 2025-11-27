import React from 'react'

export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="border-b border-gray-200 flex items-center gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab
        return (
          <button
            key={tab.value}
            className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
              isActive
                ? 'text-blue-700 bg-white shadow-sm border border-b-white border-gray-200'
                : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
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
