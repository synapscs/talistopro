import { ReactNode } from 'react';

interface Props {
  label: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function ActionButton({ label, icon, href, onClick, disabled }: Props) {
  const handleClick = () => {
    if (disabled) return;
    if (onClick) onClick();
    if (href) window.location.href = href;
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center gap-3 w-full p-4 rounded-lg border-2 transition-all ${
        disabled
          ? 'border-gray-200 opacity-50 cursor-not-allowed'
          : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-gray-900">{label}</span>
      {disabled && (
        <span className="ml-auto text-xs text-gray-500">Próximamente</span>
      )}
    </button>
  );
}