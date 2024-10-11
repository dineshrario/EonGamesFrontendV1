import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AddMoney from '../components/AddMoney';
import { useUser } from '../context/userContext';

const ChooseGame = () => {
    const navigate = useNavigate();
    const { logout } = useUser();

    const navigateToBowli = () => {
        navigate('/playground');
    };

    const navigateToJusry = () => {
        navigate('/jersey-game');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="w-full h-screen bg-gray-900 text-white">
            <header className="p-3 flex justify-between items-center">
                <Link to="/profile" className="text-xl text-gray-300 hover:text-blue-400 transition duration-300">Profile</Link>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                    Logout
                </button>
            </header>
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8">Choose Your Game</h1>

                <div className="mb-8">
                    <AddMoney />
                </div>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* <GameCard title="Bowlee" onClick={navigateToBowli} /> */}
                    <GameCard title="Jersey Sure" onClick={navigateToJusry} />
                </div>
            </main>
        {/* <Link to="/game-result-test" >game result test</Link> */}

        </div>
    );
};

const GameCard = ({ title, onClick }) => (
    <div
        onClick={onClick}
        className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105"
    >
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-400">Click to play {title}</p>
        </div>
        <div className="bg-blue-500 p-4 text-center">
            <span className="font-bold">Play Now</span>
        </div>
    </div>
);

export default ChooseGame;