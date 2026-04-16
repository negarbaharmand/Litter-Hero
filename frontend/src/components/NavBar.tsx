import { NavLink } from 'react-router-dom'

export function NavBar() {
    const baseClass = 'rounded-md px-2 py-2 text-xs font-medium transition-colors md:px-3 md:text-sm'

    return (
        <header className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b">
            <nav className="mx-auto flex max-w-4xl items-center justify-around px-2 py-2 md:justify-between md:px-6 md:py-4">
                <NavLink to="/" className="hidden font-bold text-blue-600 md:inline">
                    LitterHero
                </NavLink>

                <div className="flex w-full items-center justify-around gap-1 text-xs font-medium text-slate-600 md:w-auto md:gap-2 md:text-sm">
                    <NavLink to ="/reports" className={({ isActive }) => `${baseClass} ${isActive ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                        Reports
                    </NavLink>
                    <NavLink to="/add-picture" className={({ isActive }) => `${baseClass} ${isActive ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                        Add Photo
                    </NavLink>
                    <NavLink to="/leaderboard" className={({ isActive }) => `${baseClass} ${isActive ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                        Ranks
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `${baseClass} ${isActive ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                        Profile
                    </NavLink>
                </div>
            </nav>
        </header>
    )
}