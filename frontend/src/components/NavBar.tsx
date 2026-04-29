import { NavLink } from 'react-router-dom'
import cameraIcon from '../assets/camera.svg'
import mapIcon from '../assets/map.svg'
import ranksIcon from '../assets/ranks.svg'
import profileIcon from '../assets/profile.svg'

export function NavBar() {
    const baseClass = 'rounded-md px-2 py-2 text-xs font-medium transition-colors md:px-3 md:text-sm'

    return (
        <header className="fixed inset-x-0 bottom-0 z-30 border-t border-emerald-200 bg-emerald-50/95 backdrop-blur-md md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b">
            <nav className="mx-auto flex max-w-4xl items-center justify-around px-2 py-2 md:justify-between md:px-6 md:py-4">
                <NavLink to="/" className="hidden font-bold text-emerald-700 md:inline">
                    LitterHero
                </NavLink>

                <div className="flex w-full items-center justify-around gap-1 text-xs font-medium text-emerald-800 md:w-auto md:gap-2 md:text-sm">
                    <NavLink to="/reports" className={({ isActive }) => `${baseClass} flex items-center gap-2 ${isActive ? 'text-emerald-700' : 'hover:text-emerald-700'}`}>
                        <img src={mapIcon} alt="Reports" className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only">Reports</span>
                    </NavLink>
                    <NavLink to="/add-picture" className={({ isActive }) => `${baseClass} flex items-center gap-2 ${isActive ? 'text-emerald-700' : 'hover:text-emerald-700'}`}>
                        <img src={cameraIcon} alt="Add photo" className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only">Add Photo</span>
                    </NavLink>
                    <NavLink to="/leaderboard" className={({ isActive }) => `${baseClass} flex items-center gap-2 ${isActive ? 'text-emerald-700' : 'hover:text-emerald-700'}`}>
                        <img src={ranksIcon} alt="Ranks" className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only">Ranks</span>
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `${baseClass} flex items-center gap-2 ${isActive ? 'text-emerald-700' : 'hover:text-emerald-700'}`}>
                        <img src={profileIcon} alt="Profile" className="h-4 w-4" />
                        <span className="sr-only md:not-sr-only">Profile</span>
                    </NavLink>
                </div>
            </nav>
        </header>
    )
}
