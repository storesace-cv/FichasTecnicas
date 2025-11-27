import React from 'react';

export default function LoadingSpinner({ label = 'A carregar…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-700">
      <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}
