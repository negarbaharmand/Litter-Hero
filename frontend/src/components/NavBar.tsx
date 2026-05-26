import { NavLink, useNavigate } from "react-router-dom";
import cameraIcon from "../assets/camera.svg";
import mapIcon from "../assets/map.svg";
import reportsIcon from "../assets/reports-svgrepo-com.svg";
import ranksIcon from "../assets/ranks.svg";
import profileIcon from "../assets/profile.svg";
import logoRaw from "../assets/litter-hero-logo.svg?raw";
import { useAuth } from "../hooks/useAuth";

type NavItemProps = {
    to: string;
    icon: string;
    label: string;
    end?: boolean;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

function MobileNavItem({ to, icon, label, end, onClick }: NavItemProps) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={({ isActive }) =>
                [
                    "flex w-16 flex-col items-center justify-end gap-1 transition-colors",
                    isActive
                        ? "font-semibold text-white dark:text-[var(--nav-active)]"
                        : "font-normal text-white hover:text-white/80",
                ].join(" ")
            }
        >
            {({ isActive }) => (
                <>
                    <img
                        src={icon}
                        alt=""
                        aria-hidden="true"
                        className={
                            "h-6 w-6 " +
                            (isActive
                                ? "[filter:brightness(0)_invert(1)_drop-shadow(0_0_0.5px_white)_drop-shadow(0_0_0.5px_white)] dark:[filter:brightness(0)_saturate(100%)_invert(78%)_sepia(58%)_saturate(2700%)_hue-rotate(73deg)_brightness(101%)_contrast(101%)_drop-shadow(0_0_0.5px_#14F000)_drop-shadow(0_0_0.5px_#14F000)]"
                                : "[filter:brightness(0)_invert(1)]")
                        }
                    />
                    <span className="text-base leading-[1.2]">{label}</span>
                </>
            )}
        </NavLink>
    );
}

function DesktopNavLink({
    to,
    label,
    end,
    onClick,
}: {
    to: string;
    label: string;
    end?: boolean;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onClick}
            className={({ isActive }) =>
                [
                    "relative px-1 py-2 text-sm transition-colors",
                    isActive
                        ? "font-semibold text-[var(--color-text-primary)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[var(--color-green-normal)]"
                        : "font-normal text-[var(--color-text-body)] hover:text-[var(--color-text-primary)]",
                ].join(" ")
            }
        >
            {label}
        </NavLink>
    );
}

export function NavBar() {
    const navigate = useNavigate();
    const { authState } = useAuth();

    const onProfileClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        if (authState.status === 'authenticated') {
            navigate('/profile');
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            {/* Mobile bottom navbar (< md) */}
            <header className="fixed inset-x-0 bottom-0 z-30 h-[94px] pb-[env(safe-area-inset-bottom)] md:hidden">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[image:var(--nav-gradient)] shadow-lg [mask-image:radial-gradient(circle_40px_at_calc(50%_-_0px)_22px,transparent_98%,black_100%)] [-webkit-mask-image:radial-gradient(circle_40px_at_calc(50%_-_0px)_22px,transparent_98%,black_100%)]"
                />
                <nav className="relative mx-auto flex h-full max-w-2xl items-end justify-around px-4 pb-9">
                    <MobileNavItem to="/" icon={mapIcon} label="Map" end />
                    <MobileNavItem to="/reports" icon={reportsIcon} label="Reports" />

                    <NavLink
                        to="/add-picture"
                        aria-label="Add Report"
                        className="flex h-18 w-18 -translate-y-[1px] items-center justify-center rounded-full bg-[var(--nav-camera-bg)] transition-colors"
                    >
                        <img
                            src={cameraIcon}
                            alt=""
                            aria-hidden="true"
                            className="h-7 w-7 [filter:brightness(0)_invert(1)] dark:[filter:brightness(0)_saturate(100%)_invert(78%)_sepia(58%)_saturate(2700%)_hue-rotate(73deg)_brightness(101%)_contrast(101%)]"
                        />
                    </NavLink>

                    <MobileNavItem to="/leaderboard" icon={ranksIcon} label="Ranks" />
                    <MobileNavItem to="/profile" icon={profileIcon} label="Profile" onClick={onProfileClick} />
                </nav>
            </header>

            {/* Desktop top navbar (md+) */}
            <header className="sticky top-0 z-30 hidden h-20 border-b border-[var(--color-border)] bg-[var(--color-surface)] md:block">
                <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
                    <NavLink
                        to="/"
                        end
                        aria-label="Litter Hero — Home"
                        className="flex h-16 shrink-0 items-center [&_svg]:h-full [&_svg]:w-auto"
                        dangerouslySetInnerHTML={{ __html: logoRaw }}
                    />

                    <div className="flex items-center gap-8">
                        <DesktopNavLink to="/" label="Map" end />
                        <DesktopNavLink to="/reports" label="Reports" />
                        <DesktopNavLink to="/add-picture" label="Add Report" />
                        <DesktopNavLink to="/leaderboard" label="Ranks" />
                        <DesktopNavLink to="/profile" label="Profile" onClick={onProfileClick} />
                    </div>
                </nav>
            </header>
        </>
    );
}
