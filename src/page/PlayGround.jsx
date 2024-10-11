import React, { useEffect, useState } from 'react';
import { useUser } from '../context/userContext';
import { Link, useNavigate } from 'react-router-dom';
import AddMoney from '../components/AddMoney';
import GameList from './GameList';

const PlayGround = () => {
  const { user, logout } = useUser();
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
      setUserList(savedUsers);
    };

    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  

  return (
    <div className='w-full h-full flex flex-col'>
      {user ? (
        <div className='flex flex-row justify-end items-center gap-10 p-3' >
          <h1 className='text-xl'>Welcome: {user.name}</h1>
          <button onClick={handleLogout} className='mt-4 px-4 py-2 bg-red-500 text-white'>
            Logout
          </button>
          <Link to="/profile" className="mt-4 text-gray-500 hover:text-white ">Profile</Link>
          <Link to="/gameStats" className="mt-4 text-gray-500 hover:text-white">Game Stats</Link>
        </div>
      ) : (
        <h1>Loading...</h1>
      )}
      <div className='mx-10'>
        <ul className='flex flex-row'>
          {userList.map((user, index) => (
            <li className='mx-3 font-bold text-red-500' key={index}>{user.name}</li>
          ))}
        </ul>
      </div>
      {/* <AddMoney /> */}
      <GameList />
    </div>
  );
};

export default PlayGround;
