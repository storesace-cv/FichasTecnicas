import React from 'react'

export default function PageHeader({ title, subtitle, actions = null }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Ficha Técnica</p>
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        {subtitle && <p className="text-base text-gray-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
