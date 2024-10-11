import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Contest = () => {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [userJoined, setUserJoined] = useState(false);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const response = await fetch(`http://192.168.0.106:3000/api/games/${gameId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log("this is the user game data:", data);

                setGame(data);
            } catch (error) {
                console.error('Failed to fetch game:', error);
            }
        };


        fetchGame();
    }, [gameId]);

    const joinGame = async () => {
        try {
            const response = await fetch('http://192.168.0.106:3000/api/enter-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameId }),
            });
            console.log('this is the resopnse:', response);

            if (response.ok) {
                setUserJoined(true);
            } else {
                console.error('Failed to join game');
            }
        } catch (error) {
            console.error('Error joining game:', error);
        }
    };

    if (!game) return <div>Loading...</div>;

    return (
        <>
            <div className='m-3 border-2 ' >
                <h1>{game.Game}</h1>
                <p>Status: {game.status}</p>
                <p>Max Users: {game["Max Users"]}</p>
                <p>Join Count: {game.Join_Count}</p>
                <p>Start Time: {game.start_time}</p>
                <img src={game.image_url} alt={game.Game} style={{ width: '100px', height: 'auto' }} />
                <button onClick={joinGame} disabled={userJoined}>
                    {userJoined ? 'Joined' : 'Join Game'}
                </button>
            </div>
            <div>
                
            </div>
        </>
    );
};

export default Contest;
