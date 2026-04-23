import { NavLink } from "react-router-dom";
import mapIcon from "../assets/map-svgrepo-com.svg";
import reportsIcon from "../assets/reports-svgrepo-com.svg";
import cameraIcon from "../assets/camera-svgrepo-com.svg";
import ranksIcon from "../assets/ranks-svgrepo-com.svg";
import profileIcon from "../assets/profile-2-svgrepo-com.svg";

export function NavBar() {
  const itemBase =
    "grid justify-items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-slate-700 transition";

  const active =
    "bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-700";

  const iconClass = "h-5 w-5";

  return (
    <>
      {/* Navigation: nere på mobil/platta (default), längst upp på desktop (md+) */}
    <header
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md md:bottom-auto md:top-0 md:border-b md:border-t-0"
    >
      <nav className="mx-auto grid h-[74px] max-w-4xl grid-cols-5 items-center px-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${itemBase} ${isActive ? active : "hover:text-emerald-700"}`
          }
        >
          <img src={mapIcon} className={iconClass} alt="" aria-hidden="true" />
          <span>Map</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `${itemBase} ${isActive ? active : "hover:text-emerald-700"}`
          }
        >
          <img
            src={reportsIcon}
            className={iconClass}
            alt=""
            aria-hidden="true"
          />
          <span>Reports</span>
        </NavLink>

        {/* Kamera-knapp: "pop" bara på mobil; platt top bar på desktop */}
        <NavLink
          to="/reports"
          aria-label="Camera"
          className="mx-auto grid h-14 w-14 -translate-y-3 place-items-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/30 ring-1 ring-black/5 md:translate-y-0"
        >
          <img
            src={cameraIcon}
            className="h-6 w-6 brightness-0 invert"
            alt=""
            aria-hidden="true"
          />
        </NavLink>

        <NavLink
          to="/leaderboard"
          className={({ isActive }) =>
            `${itemBase} ${isActive ? active : "hover:text-emerald-700"}`
          }
        >
          <img
            src={ranksIcon}
            className={iconClass}
            alt=""
            aria-hidden="true"
          />
          <span>Ranks</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${itemBase} ${isActive ? active : "hover:text-emerald-700"}`
          }
        >
          <img
            src={profileIcon}
            className={iconClass}
            alt=""
            aria-hidden="true"
          />
          <span>Profile</span>
        </NavLink>
      </nav>
    </header>
    </>
  );
}