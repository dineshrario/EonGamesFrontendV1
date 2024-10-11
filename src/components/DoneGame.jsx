import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API } from '../api/Api';

const DoneGame = () => {
    const [baseCards, setBaseCards] = useState([]);
    const [earnedCards, setEarnedCards] = useState([]);
    const [userData, setUserData] = useState([]);
    const location = useLocation();
    const { group_id, game_id } = location.state || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data from the 'current' API
                const currentResponse = await axios.get(`${API}/api/current`);
                const currentData = currentResponse.data;

                // Fetch data from the 'result-card' API
                const resultResponse = await axios.get(`${API}/result-card`);
                const resultData = resultResponse.data;

                // Filter result data based on group_id and game_id
                const filteredResultData = resultData.filter(item =>
                    item.group_id === Number(group_id) &&
                    item.game_id === Number(game_id)
                );
                // console.log('filtered data:', filteredResultData);

                // Extract user_ids from result data
                const userIds = filteredResultData.map(item => item.user_id);

                // Filter current data based on group_id, game_id, and user_ids
                const filteredCurrentData = currentData.filter(item =>
                    item.group_id === Number(group_id) &&
                    item.game_id === Number(game_id) &&
                    userIds.includes(item.user_id)
                );
                // console.log('filtered data:', filteredCurrentData);



                // Separate base and earned cards
                const baseCards = filteredCurrentData.filter(item => item.card_type === 'Base');
                const earnedCards = filteredCurrentData.filter(item => item.card_type === 'Earned');

                setBaseCards(baseCards);
                setEarnedCards(earnedCards);
                setUserData(filteredResultData);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [group_id, game_id]);

    const renderUserCards = (user) => {
        const userBaseCards = baseCards.filter(card => card.user_id === user.user_id);
        const userEarnedCards = earnedCards.filter(card => card.user_id === user.user_id);

        return (
            <div key={user.user_id} className='border rounded-lg p-4 shadow-md mb-6'>
                <div className='mb-4'>
                    <h3 className='text-xl font-semibold mb-2'>User Info</h3>
                    {/* <p><strong>User ID:</strong> {user.user_id}</p> */}
                    <p><strong>Name: </strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Winning Percentage:</strong> {user.winpercentage}%</p>
                </div>
                <div className='mb-4'>
                    <h4 className='text-lg font-semibold mb-2'>Base Cards</h4>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {userBaseCards.length > 0 ? (
                            userBaseCards.map((card, index) => (
                                <div key={index} className='border rounded-lg p-4 shadow-md '>
                                    <img
                                        src={card.image_url}
                                        alt={card.player_name}
                                        className='w-full h-32 object-cover rounded mb-3'
                                    />
                                    <h5 className='text-lg text-white font-medium'>{card.player_name}</h5>
                                    <p className=' text-white'>Card ID: {card.card_id}</p>
                                    <p className=' text-white'>Bid Amount: {card.bid_amount}</p>
                                    <p className=' text-white'>Fantasy Points: {card.fantasy_points}</p>
                                </div>
                            ))
                        ) : (
                            <p>No base cards available for this user.</p>
                        )}
                    </div>
                </div>
                {userEarnedCards.length > 0 && (
                    <div>
                        <h4 className='text-lg font-semibold mb-2'>Earned Cards</h4>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {userEarnedCards.map((card, index) => (
                                <div key={index} className='border rounded-lg p-4 shadow-md '>
                                    <img
                                        src={card.image_url}
                                        alt={card.player_name}
                                        className='w-full h-32 object-cover rounded mb-3'
                                    />
                                    <h5 className='text-lg font-medium'>{card.player_name}</h5>
                                    <p className='text-gray-600'>Card ID: {card.card_id}</p>
                                    <p className='text-gray-600'>Bid Amount: {card.bid_amount}</p>
                                    <p className='text-gray-600'>Fantasy Points: {card.fantasy_points}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className='p-4 max-w-screen-lg mx-auto'>
            <h2 className='text-2xl font-bold mb-6'>Completed Game</h2>
            {userData.length > 0 ? (
                userData
                    .sort((a, b) => b.winpercentage - a.winpercentage) // Sort by winning percentage
                    .map(user => renderUserCards(user))
            ) : (
                <p>No user data available for this group and game.</p>
            )}
        </div>
    );
}

export default DoneGame;
