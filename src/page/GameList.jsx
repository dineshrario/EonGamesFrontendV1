import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../api/Api';

const GameList = () => {
    const [games, setGames] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get(`${API}/game/get-games`);
                console.log('game list', response.data.data);

                // Store the games data in localStorage
                localStorage.setItem('games', JSON.stringify(response.data.data));

                // Update the state with the games data
                setGames(response.data.data);
            } catch (error) {
                console.error('Failed to fetch games:', error);
            }
        };

        fetchGames();
    }, []);

    const handleClick = async (gameId) => {
        try {
            const response = await axios.get(`${API}/api/gamesContest`);
            const contestData = response.data;

            const selectedGames = contestData.filter(game => game.game_id === gameId);

            navigate('/groupList', { state: { selectedGames } });
        } catch (error) {
            console.error('Failed to fetch contest data:', error);
        }
    };

    return (
        <>
            <h1>List of Games</h1>
            <ul>
                {games.map(game => (
                    <li 
                        key={game.GameId} 
                        className='m-2 my-3 border-2 p-2'  
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleClick(game.GameId)}
                    >
                        <h2>{game.Game}</h2>
                        <p>Status: {game.Status_computed}</p>
                        <p>Max Users: {game["Max Users"]}</p>
                        <p>Join Count: {game.Join_Count}</p>
                        <p>Start Time: {game.start_time}</p>
                        <img src={game.image_url} alt={game.Game} />
                    </li>
                ))}
            </ul>
        </>
    );
};

export default GameList;
