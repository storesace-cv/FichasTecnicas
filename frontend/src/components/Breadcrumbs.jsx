import React from 'react'
import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-semibold text-gray-800">{item.label}</span>
              ) : (
                <Link to={item.href} className="text-blue-600 hover:underline font-medium">
                  {item.label}
                </Link>
              )}
              {!isLast && <span className="text-gray-400">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
