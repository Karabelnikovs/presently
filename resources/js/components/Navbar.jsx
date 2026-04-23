import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCsrfToken, getCookie } from '../utils/csrf';

const NavLink = ({ to, children, onClick }) => (
    // Vienots stils navigācijas saitēm.
    <Link
        to={to}
        onClick={onClick}
        className="block rounded-xl px-3 py-2 text-base font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 md:inline-block md:text-sm"
    >
        {children}
    </Link>
);

const Navbar = ({ user, setUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const closeMenu = () => setIsOpen(false);

    const handleLogout = async () => {
        // Droša izlogošanās ar CSRF aizsardzību.
        await getCsrfToken();
        const xsrfToken = decodeURIComponent(getCookie('XSRF-TOKEN') || '');
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            setUser(null);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white rounded-lg m-4">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 ">
                <Link
                    to={user ? "/generate" : "/"}
                    onClick={closeMenu}
                    className="mr-4 shrink-0"
                >
                    <img
                        src="/presently-logo.svg"
                        className="h-11 w-auto"
                        alt="Presently Logo"
                    />
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                    {user ? (
                        <>
                            <NavLink to="/generate">Generate</NavLink>
                            <NavLink to="/my-presentations">
                                My Presentations
                            </NavLink>
                            <NavLink to="/profile">Profile</NavLink>
                            <button
                                onClick={handleLogout}
                                className="cursor-pointer rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <NavLink to="/register">Register</NavLink>
                        </>
                    )}
                </div>

                <div className="md:hidden">
                    {/* Mobilās izvēlnes poga ar hamburgera animāciju. */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                        className="relative z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm focus:outline-none"
                        aria-controls="mobile-menu"
                        aria-expanded={isOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        <div className="absolute w-6 h-6 transform transition-transform duration-300 ease-in-out cursor-pointer">
                            <span
                                className={`block absolute h-0.5 w-full bg-slate-700 transform transition-all duration-300 ease-in-out ${
                                    isOpen ? "rotate-45 top-2.5" : "top-1"
                                }`}
                            ></span>
                            <span
                                className={`block absolute h-0.5 w-full bg-slate-700 transform transition-all duration-300 ease-in-out ${
                                    isOpen ? "opacity-0" : "top-2.5"
                                }`}
                            ></span>
                            <span
                                className={`block absolute h-0.5 w-full bg-slate-700 transform transition-all duration-300 ease-in-out ${
                                    isOpen ? "-rotate-45 top-2.5" : "top-4"
                                }`}
                            ></span>
                        </div>
                    </button>
                </div>
            </div>

            <div
                className={`
                    md:hidden transition-all duration-300 ease-in-out overflow-hidden
                    ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                `}
                id="mobile-menu"
            >
                <div className="space-y-1 border-t border-slate-200 px-3 pb-3 pt-2 sm:px-6">
                    {user ? (
                        <>
                            <NavLink to="/generate" onClick={closeMenu}>
                                Generate
                            </NavLink>
                            <NavLink to="/my-presentations" onClick={closeMenu}>
                                My Presentations
                            </NavLink>
                            <NavLink to="/profile" onClick={closeMenu}>
                                Profile
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="block w-full rounded-xl bg-slate-100 px-3 py-2 text-left text-base font-medium text-slate-700 transition hover:bg-slate-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" onClick={closeMenu}>
                                Login
                            </NavLink>
                            <NavLink to="/register" onClick={closeMenu}>
                                Register
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
