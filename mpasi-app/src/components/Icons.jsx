const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
};

export const BowlIcon = (p) => (
  <svg {...common} {...p}>
    <path d="M3 12h18a9 9 0 0 1-18 0Z" />
    <path d="M12 12V6" />
    <path d="M9 6c0-1.5 1-3 3-3s3 1.5 3 3" />
  </svg>
);

export const CalendarIcon = (p) => (
  <svg {...common} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const BagIcon = (p) => (
  <svg {...common} {...p}>
    <path d="M6 8h12l1 12H5L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...common} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export const UserIcon = (p) => (
  <svg {...common} {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.5-4 5-5.5 7.5-5.5s6 1.5 7.5 5.5" />
  </svg>
);

export const HeartIcon = ({ filled, ...p }) => (
  <svg {...common} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20.5s-7.5-4.6-9.8-9.2C.7 8 2 4.6 5.4 4c2-.4 3.8.5 4.9 2.1a1 1 0 0 0 1.4 0C12.8 4.5 14.6 3.6 16.6 4c3.4.6 4.7 4 3.2 7.3-2.3 4.6-7.8 9.2-7.8 9.2Z" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...common} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ArrowLeftIcon = (p) => (
  <svg {...common} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...common} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...common} {...p}>
    <path d="M4 12.5 9 17l11-11" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg {...common} {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
  </svg>
);

export const XIcon = (p) => (
  <svg {...common} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
