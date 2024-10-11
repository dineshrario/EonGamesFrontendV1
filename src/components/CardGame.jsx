import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API } from '../api/Api';

const CardGame = () => {
    const location = useLocation();
    const { game_id, user_id, name, email } = location.state || {};
    const [status, setStatus] = useState('');
    const [userData, setUserData] = useState([]);

    const handlePlayClick = async () => {
        try {
            setStatus('Fetching user data...');
            
            // Fetch user data with the given game_id and user_id
            const response = await axios.get(`${API}/api/joinContest`, {
                params: { game_id, user_id }
            });

            const existingUsers = response.data;
            setUserData(existingUsers);
            setStatus('User data fetched successfully.');

            //here user with game_id and group_id exist then, check what is the max group_id, increment that group_id with +1 then insert that user with under that new group_id with this api-> 


        } catch (error) {
            if (error.response?.status === 404) {
                setStatus('User not found.');
            } else {
                console.error('Error fetching user data:', error);
                setStatus('Error occurred while fetching user data.');
            }
        }
    };

    return (
        <>
            <h2>Card to Play</h2>
            <div>
                <p><strong>Game ID:</strong> {game_id}</p>
                <p><strong>User ID:</strong> {user_id}</p>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
            </div>
            <button
                className='mt-4 bg-blue-500 text-white p-2 rounded'
                onClick={handlePlayClick}
            >
                Play
            </button>
            {status && <p>{status}</p>}
            {userData.length > 0 && (
                <div>
                    <h3>User Data</h3>
                    <pre>{JSON.stringify(userData, null, 2)}</pre>
                </div>
            )}
        </>
    );
};

export default CardGame;

//now if user does exist, so Insert user in the database with in new group_id. Now go through all game_id & group_id, in which the user exist. If user does not exist then insert user, with incrementing group_id +1, and with the same group_id.