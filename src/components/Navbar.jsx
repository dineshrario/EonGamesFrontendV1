import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <>
            <header className="p-4 flex justify-start items-center gap-5">
                <Link to="/choosegame" className="text-xl text-gray-300 hover:text-blue-400 transition duration-300">Home</Link>
                {window.location.pathname !== '/profile' && (
                    <Link to="/profile" className="text-xl text-gray-300 hover:text-blue-400 transition duration-300">Profile</Link>
                )}
                {window.location.pathname === '/lobby' && (
                    <Link to="/tabletojoin" className="text-xl text-gray-300 hover:text-blue-400 transition duration-300">Table</Link>
                )}
            </header >
        </>
    )
}

export default Navbar