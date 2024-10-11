import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const Profile = () => {
    const [data, setData] = useState([]);
    const [userId, setUserId] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // useEffect(() => {
    //     // Fetch data from the API
    //     const fetchData = async () => {
    //         try {
    //             // Fetch data from the API
    //             const response = await axios.get('http://10.4.20.148:3000/api/current');
    //             const fetchedData = response.data;

    //             // Get the current user's ID from local storage
    //             const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //             const currentUserId = currentUser?.id;

    //             setUserId(currentUserId);

    //             // Filter data based on the current user's ID
    //             const userData = fetchedData.filter(item => item.user_id === currentUserId);

    //             setData(userData);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData();
    // }, []); // Empty dependency array ensures this runs once on component mount

    // // Group data by game_id
    // const groupedByGame = data.reduce((acc, item) => {
    //     if (!acc[item.game_id]) {
    //         acc[item.game_id] = { Base: [], Earned: [] };
    //     }
    //     acc[item.game_id][item.card_type].push(item);
    //     return acc;
    // }, {});


    return (
        <>
            {/* <div className='p-4 max-w-screen-lg mx-auto'>
                <h2 className='text-2xl font-bold mb-6'>User Profile</h2>
                {Object.keys(groupedByGame).length > 0 ? (
                    Object.entries(groupedByGame).map(([game_id, cardTypes]) => (
                        <div key={game_id} className='mb-8'>
                            <h3 className='text-xl font-semibold mb-4'>Game ID: {game_id}</h3>
                            {Object.entries(cardTypes).map(([card_type, items]) => (
                                <div key={card_type} className='mb-6'>
                                    <h4 className='text-lg font-semibold mb-2'>{card_type} Cards</h4>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {items.length > 0 ? (
                                            items.map((item, index) => (
                                                <div key={index} className='border rounded-lg p-4  shadow-md'>
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.player_name}
                                                        className='w-full h-32 object-cover rounded mb-3'
                                                    />
                                                    <h5 className='text-lg font-medium text-white'>{item.player_name}</h5>
                                                    <p className=''>Card ID: {item.card_id}</p>
                                                    <p className=''>Group ID: {item.group_id}</p>
                                                    <p className=''>Fantasy Points: {item.fantasy_points}</p>
                                                    <p className=''>Bid Amount: {item.bid_amount}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No {card_type} cards available.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No data available for this user.</p>
                )}
            </div> */}

<div className='w-full h-screen flex flex-col justify-start items-center p-4 bg-gray-900'>
            <div className='w-full'>
                <Navbar />
            </div>
            <div className='w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg mt-20 flex flex-col items-center'>
                <h2 className='text-2xl font-bold text-white mb-6 text-center'>Profile</h2>
                <div className='space-y-4 font-bold w-full'>
                    <p className='text-gray-300 text-center'><strong className='text-white'>Name:</strong> {currentUser.name}</p>
                    <p className='text-gray-300 text-center'><strong className='text-white'>Email:</strong> {currentUser.email}</p>
                    <p className='text-gray-300 text-center'><strong className='text-white'>Wallet Balance:</strong> ₹ {currentUser.wallet_balance.toFixed(2)}</p>
                    <p className='text-gray-300 text-center'><strong className='text-white'>Current Wallet Balance:</strong> ₹ {currentUser.current_wallet_balance.toFixed(2)}</p>
                    <p className='text-gray-300 text-center'><strong className='text-white'>Games Played:</strong> {currentUser.games_played || "No games played yet"}</p>
                    {/* Add more fields as needed */}
                </div>
            </div>
        </div>
        </>

    );
};

export default Profile;
