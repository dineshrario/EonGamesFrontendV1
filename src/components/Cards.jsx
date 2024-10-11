import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../api/Api';

const Card = () => {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [groupedByGame, setGroupedByGame] = useState({});
    const [groupedByGroup, setGroupedByGroup] = useState({});
    const [userId, setUserId] = useState(null); // State to store user ID

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const fetchedUserId = currentUser?.id; // Get user ID from currentUser object
                if (!fetchedUserId) {
                    throw new Error('User ID not found in local storage');
                }
                setUserId(fetchedUserId);

                const response = await axios.get(`${API}/game/get-base-card`);
                // console.log('Response data:', response.data);

                const filteredCards = response.data.filter(card => card.user_id === fetchedUserId);

                // Group cards by game_id
                const groupedByGame = filteredCards.reduce((acc, card) => {
                    if (!acc[card.game_id]) {
                        acc[card.game_id] = [];
                    }
                    acc[card.game_id].push(card);
                    return acc;
                }, {});

                // Group cards by group_id
                const groupedByGroup = filteredCards.reduce((acc, card) => {
                    if (!acc[card.group_id]) {
                        acc[card.group_id] = [];
                    }
                    acc[card.group_id].push(card);
                    return acc;
                }, {});

                setGroupedByGame(groupedByGame);
                setGroupedByGroup(groupedByGroup);
            } catch (err) {
                console.error('Error fetching cards:', err);
                setError('Failed to load card data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, []); // Empty dependency array means this effect runs once on mount

    if (loading) {
        return <p className="text-center text-lg mt-8">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-lg text-red-500 mt-8">{error}</p>;
    }

    return (
        <div className="p-6 lg:p-12">
            <h1 className="text-2xl font-bold mb-6 text-center">Player Cards</h1>
            <div className="flex flex-wrap gap-8">
                {/* Section for grouping by game_id */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4 text-center">By Game</h2>
                    {Object.keys(groupedByGame).map((gameId) => (
                        <div key={gameId} className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Game {gameId}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {groupedByGame[gameId].slice(0, 2).map((card) => (
                                    <div
                                        key={card.id}
                                        className="border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden"
                                    >
                                        <img
                                            src={card.image_url}
                                            alt={card.player_name}
                                            className="w-full h-35 object-cover"
                                        />
                                        <div className="p-4">
                                            <h2 className="text-xl font-semibold mb-2 truncate">{card.player_name}</h2>
                                            <p className="text-lg text-gray-700 mb-2">Points: {card.fantasy_points}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section for grouping by group_id */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-4 text-center">By Group</h2>
                    {Object.keys(groupedByGroup).map((groupId) => (
                        <div key={groupId} className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Group {groupId}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {groupedByGroup[groupId].slice(0, 2).map((card) => (
                                    <div
                                        key={card.id}
                                        className="border border-gray-300 rounded-lg shadow-lg bg-white overflow-hidden"
                                    >
                                        <img
                                            src={card.image_url}
                                            alt={card.player_name}
                                            className="w-full h-35 object-cover"
                                        />
                                        <div className="p-4">
                                            <h2 className="text-xl font-semibold mb-2 truncate">{card.player_name}</h2>
                                            <p className="text-lg text-gray-700 mb-2">Points: {card.fantasy_points}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Card;
