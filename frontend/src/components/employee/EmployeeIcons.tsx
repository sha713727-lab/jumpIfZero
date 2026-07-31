function OverviewIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function ProjectsIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h10" />
    </svg>
  );
}

function ClientsIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M3.5 19c1.6-3 3.8-4.5 5.5-4.5s3.9 1.5 5.5 4.5" />
      <path d="M14 19c1-1.8 2.2-2.7 3.2-2.7 1.2 0 2.5.9 3.8 2.7" />
    </svg>
  );
}

function MessagesIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16v10H8l-4 4z" />
    </svg>
  );
}

function FilesIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h6l2 2h8v12H4z" />
    </svg>
  );
}

function ProfileIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3.2 4-4.8 7-4.8s5.2 1.6 7 4.8" />
    </svg>
  );
}

function SignOutIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 12h8" />
      <path d="M19 8l4 4-4 4" />
    </svg>
  );
}

function MenuIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function PlusIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function TrashIcon({ className }: { readonly className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M8 7l1 12h6l1-12" />
    </svg>
  );
}

export const employeeIcons = {
  overview: OverviewIcon,
  projects: ProjectsIcon,
  clients: ClientsIcon,
  messages: MessagesIcon,
  files: FilesIcon,
  profile: ProfileIcon,
  sales: ProjectsIcon,
  leads: ClientsIcon,
  signOut: SignOutIcon,
  menu: MenuIcon,
  close: CloseIcon,
  plus: PlusIcon,
  trash: TrashIcon,
} as const;
