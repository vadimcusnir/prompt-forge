'use client';

interface AdminButtonProps {
  onClick: () => void;
}

export function AdminButton({ onClick }: AdminButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-pf-text hover:text-gold-industrial px-4 py-2 transition-colors duration-200"
    >
      Close Admin
    </button>
  );
}
