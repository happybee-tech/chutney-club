import React from 'react';

type IconProps = {
  className?: string;
};

function BaseIcon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      {children}
    </svg>
  );
}

export function OverviewIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M4 4h7v7H4z" />
      <path d="M13 4h7v4h-7z" />
      <path d="M13 10h7v10h-7z" />
      <path d="M4 13h7v7H4z" />
    </BaseIcon>
  );
}

export function BrandIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M6 21V7l6-4 6 4v14" />
      <path d="M9 21v-5h6v5" />
    </BaseIcon>
  );
}

export function CategoryIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M4 7h7v13H4z" />
      <path d="M13 4h7v16h-7z" />
    </BaseIcon>
  );
}

export function ProductIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M4 7l8-4 8 4-8 4-8-4z" />
      <path d="M4 7v10l8 4 8-4V7" />
    </BaseIcon>
  );
}

export function OrdersIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M7 4h10l2 4v12H5V8l2-4z" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </BaseIcon>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3 3 0 0 1 0 5.75" />
    </BaseIcon>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </BaseIcon>
  );
}

export function ToggleIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <rect x="3" y="7" width="18" height="10" rx="5" />
      <circle cx="9" cy="12" r="3" />
    </BaseIcon>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </BaseIcon>
  );
}

export function DeleteIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M7 6l1 14h8l1-14" />
      <path d="M10 10v7" />
      <path d="M14 10v7" />
    </BaseIcon>
  );
}

export function SurveyIcon({ className }: IconProps) {
  return (
    <BaseIcon className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8l-6-6z" />
      <path d="M9 15h6" />
      <path d="M9 11h6" />
      <path d="M14 2v6h6" />
    </BaseIcon>
  );
}
