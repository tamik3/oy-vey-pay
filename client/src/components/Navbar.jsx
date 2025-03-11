import { useState } from 'react'
import '../styles/Navbar.css'
import { NavLink, Link } from 'react-router'
import { logout } from '../api/auth'

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <nav className='navbar'>
            <Link to="/" className='navbar-logo'>
                <img src="/images/logo.jpg" alt="logo" width={30} height={50} />
            </Link>
            <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
                <NavLink
                    to="/"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={() => setIsOpen(false)}
                >
                    Home
                </NavLink>
                <NavLink
                    to="/Incomes"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={() => setIsOpen(false)}
                >
                    Incomes
                </NavLink>
                <NavLink
                    to="/Expenses"
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={() => setIsOpen(false)}
                >
                    Expenses
                </NavLink>

                <NavLink
                    to="#"
                    className={() => { }}
                    onClick={(e) => {
                        e.preventDefault();
                        logout();
                    }}
                >
                    Logout
                </NavLink>

            </div>
            <div className='hamburger' onClick={() => setIsOpen(!isOpen)}>
                <span className='bar'></span>
                <span className='bar'></span>
                <span className='bar'></span>
            </div>
        </nav>
    )
}
