import React, { useState } from "react";
import { Link } from "react-router-dom";

const NavLink = ({ to, children, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700 md:text-sm md:inline-block md:p-0 md:hover:bg-transparent md:hover:underline"
    >
        {children}
    </Link>
);

const Navbar = ({ user, setUser }) => {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    const handleLogout = async () => {
        closeMenu();
        const token = document.querySelector('meta[name="csrf-token"]').content;
        const res = await fetch("/logout", {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": token,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        if (res.ok) {
            setUser(null);
            window.location.href = "/";
        }
    };

    return (
        <nav className="bg-blue-600 sticky top-0 shadow-md z-50 rounded-lg">
            <div className="container mx-auto flex items-center justify-between p-4">
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="text-white text-xl font-bold mr-4 shrink-0"
                >
                    Presently
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
                                className="text-white hover:underline text-sm font-medium cursor-pointer"
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
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                        className="relative z-50 w-8 h-8 flex justify-center items-center text-white focus:outline-none"
                        aria-controls="mobile-menu"
                        aria-expanded={isOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        <div className="absolute w-6 h-6 transform transition-transform duration-300 ease-in-out cursor-pointer">
                            <span
                                className={`block absolute h-0.5 w-full bg-white transform transition-all duration-300 ease-in-out ${
                                    isOpen ? "rotate-45 top-2.5" : "top-1"
                                }`}
                            ></span>
                            <span
                                className={`block absolute h-0.5 w-full bg-white transform transition-all duration-300 ease-in-out ${
                                    isOpen ? "opacity-0" : "top-2.5"
                                }`}
                            ></span>
                            <span
                                className={`block absolute h-0.5 w-full bg-white transform transition-all duration-300 ease-in-out ${
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
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700 cursor-pointer"
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
