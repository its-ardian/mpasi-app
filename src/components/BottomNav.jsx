import { BowlIcon, CalendarIcon, BagIcon, ClockIcon, UserIcon } from "./Icons";

const TABS = [
  { key: "recipes", label: "Resep", icon: BowlIcon },
  { key: "planner", label: "Rencana", icon: CalendarIcon },
  { key: "grocery", label: "Belanja", icon: BagIcon },
  { key: "tracker", label: "Riwayat", icon: ClockIcon },
  { key: "profile", label: "Profil", icon: UserIcon },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            className={`nav-btn${isActive ? " active" : ""}`}
            onClick={() => onChange(tab.key)}
          >
            <Icon />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
