'use client';

interface AdminButtonProps {
  onClick: () => void;
}

export function AdminButton({ onClick }: AdminButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-white hover:text-[#d1a954] px-4 py-2 transition-colors duration-200"
    >
      Close Admin
    </button>
  );
}
