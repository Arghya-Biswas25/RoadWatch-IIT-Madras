import type { RoadStatus } from '../../types';

const statusClasses: Record<string, string> = {
  Good: 'bg-green-100 text-green-800 border-green-200',
  Fair: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Poor: 'bg-orange-100 text-orange-800 border-orange-200',
  Critical: 'bg-red-100 text-red-800 border-red-200',
  Unknown: 'bg-gray-100 text-gray-600 border-gray-200',
  Submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  Routed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Seen: 'bg-purple-100 text-purple-800 border-purple-200',
  InProgress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Resolved: 'bg-green-100 text-green-800 border-green-200',
  Escalated: 'bg-red-100 text-red-800 border-red-200',
  Closed: 'bg-gray-100 text-gray-600 border-gray-200',
  High: 'bg-orange-100 text-orange-800 border-orange-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
};

export function Badge({ label, className = '' }: { label: string; className?: string }) {
  const cls = statusClasses[label] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls} ${className}`}>
      {label}
    </span>
  );
}

export function RoadTypeBadge({ type }: { type: string }) {
  const colours: Record<string, string> = {
    NH: 'bg-blue-600 text-white', SH: 'bg-purple-600 text-white',
    MDR: 'bg-teal-600 text-white', ODR: 'bg-cyan-600 text-white',
    VR: 'bg-green-600 text-white', Urban: 'bg-orange-600 text-white',
    Other: 'bg-gray-600 text-white',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${colours[type] || colours.Other}`}>
      {type}
    </span>
  );
}
