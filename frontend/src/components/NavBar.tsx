import { NavLink } from "react-router-dom";
import cameraIcon from "../assets/camera.svg";
import mapIcon from "../assets/map.svg";
import reportsIcon from "../assets/reports-svgrepo-com.svg";
import ranksIcon from "../assets/ranks.svg";
import profileIcon from "../assets/profile.svg";

export function NavBar() {
    const itemBase =
        "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition-colors";

    const labelClass = "text-[11px] leading-none";
    const iconClass = "h-5 w-5";

    return (
        <header
            className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 pb-[env(safe-area-inset-bottom)] md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b md:pb-0 md:backdrop-blur-md"
            style={{ background: 'linear-gradient(180deg, #1A5C35 53.37%, #37C270 100%)' }}
        >
            {/* One straight row everywhere (en rak rad överallt) */}
            <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-1 md:px-3 md:py-0">

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `${itemBase} ${isActive ? "text-emerald-300" : "text-slate-300 hover:text-slate-200"}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <img
                                src={mapIcon}
                                alt="Map"
                                className={iconClass}
                                style={{
                                    filter: isActive ? "none" : "grayscale(1) brightness(1.6)",
                                }}
                            />
                            <span className={labelClass}>Map</span>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        `${itemBase} ${isActive ? "text-emerald-300" : "text-slate-300 hover:text-slate-200"}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <img
                                src={reportsIcon}
                                alt="Reports"
                                className={iconClass}
                                style={{
                                    filter: isActive ? "none" : "grayscale(1) brightness(1.6)",
                                }}
                            />
                            <span className={labelClass}>Reports</span>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/add-picture"
                    aria-label="Camera"
                    className={({ isActive }) =>
                        `${itemBase} ${isActive ? "text-emerald-300" : "text-slate-300 hover:text-slate-200"}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <span
                                className="grid h-11 w-11 place-items-center rounded-full bg-emerald-300"
                                aria-hidden="true"
                            >
                                <img
                                    src={cameraIcon}
                                    alt=""
                                    className="h-5 w-5"
                                    style={{
                                        filter: isActive ? "none" : "grayscale(1) brightness(1.6)",
                                    }}
                                />
                            </span>
                            <span className={labelClass}>Add Report</span>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/leaderboard"
                    className={({ isActive }) =>
                        `${itemBase} ${isActive ? "text-emerald-300" : "text-slate-300 hover:text-slate-200"}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <img
                                src={ranksIcon}
                                alt="Ranks"
                                className={iconClass}
                                style={{
                                    filter: isActive ? "none" : "grayscale(1) brightness(1.6)",
                                }}
                            />
                            <span className={labelClass}>Ranks</span>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `${itemBase} ${isActive ? "text-emerald-300" : "text-slate-300 hover:text-slate-200"}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <img
                                src={profileIcon}
                                alt="Profile"
                                className={iconClass}
                                style={{
                                    filter: isActive ? "none" : "grayscale(1) brightness(1.6)",
                                }}
                            />
                            <span className={labelClass}>Profile</span>
                        </>
                    )}
                </NavLink>
            </nav>
        </header>
    )
}