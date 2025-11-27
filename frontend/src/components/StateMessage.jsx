import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const variants = {
  error: {
    icon: ExclamationTriangleIcon,
    base: 'bg-red-50 border-red-200 text-red-800',
    title: 'Ocorreu um erro',
  },
  success: {
    icon: CheckCircleIcon,
    base: 'bg-green-50 border-green-200 text-green-800',
    title: 'Operação concluída',
  },
  info: {
    icon: InformationCircleIcon,
    base: 'bg-blue-50 border-blue-200 text-blue-800',
    title: 'Informação',
  },
};

export default function StateMessage({
  variant = 'info',
  title,
  description,
  action,
}) {
  const config = variants[variant] || variants.info;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border px-5 py-4 ${config.base}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-6 w-6" aria-hidden />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">{title || config.title}</p>
          {description && <p className="text-sm opacity-90">{description}</p>}
          {action}
        </div>
      </div>
    </div>
  );
}
