import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GroupList = () => {
    const location = useLocation();
    const { selectedGames } = location.state || {};
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser?.id;
    const currentUserName = currentUser?.name;
    const currentUserEmail = currentUser?.email;

    const [groupedData, setGroupedData] = useState({});
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        const groupData = selectedGames.reduce((acc, game) => {
            const { group_id, user_id, name, status, game_id } = game;
            if (!acc[group_id]) {
                acc[group_id] = { users: [], status, game_id };
            }
            acc[group_id].users.push({ user_id, name });
            return acc;
        }, {});

        setGroupedData(groupData);

        // Filter the groups where the current user is a member
        const groupsForUser = Object.entries(groupData).filter(([_, group]) =>
            group.users.some(user => user.user_id === currentUserId)
        );

        setUserGroups(groupsForUser);
    }, [selectedGames, currentUserId]);

    const handleGroupClick = async (group_id) => {
        const group = groupedData[group_id];
        const isUserInGroup = group.users.some(user => user.user_id === currentUserId);

        if (group.status === 'completed') {
            navigate('/donegame', { state: { group_id, game_id: group.game_id } });
        } else if (group.status === 'ongoing') {
            navigate('/cardgame', { state: { group_id, game_id: group.game_id } });
        } else if (isUserInGroup) {
            alert('You are already in this group.');
            navigate('/cardgame', { state: { group_id, game_id: group.game_id } });
        } else {
            try {
                await axios.post(`${API}/api/joinContest`, {
                    game_id: group.game_id,
                    user_id: currentUserId,
                    name: currentUserName,
                    email: currentUserEmail
                });

                alert('Successfully joined the contest!');
                navigate('/cardgame', { state: { group_id, game_id: group.game_id } });
            } catch (error) {
                console.error('Error joining the contest:', error);
                alert('Failed to join the contest.');
            }
        }
    };

    const handleCreateParty = () => {
        if (selectedGames && selectedGames.length > 0) {
            const game = selectedGames[0]; // Assuming you want to use the first game in the selectedGames array
            const { game_id } = game;

            // Redirect to the card game page with the required data
            navigate('/cardgame', {
                state: {
                    game_id,
                    user_id: currentUserId,
                    name: currentUserName,
                    email: currentUserEmail,
                },
            });
        } else {
            alert('No games selected to create a party.');
        }
    };

    return (
        <>
            <div className='flex flex-col'>
                <h1>Group List</h1>
                <button
                    className='mt-4 mb-6 bg-blue-500 text-white p-2 rounded self-center'
                    onClick={handleCreateParty}
                >
                    Join or Create a Party
                </button>
                <ul>
                    {userGroups.length > 0 ? (
                        userGroups.map(([group_id, group]) => (
                            <li
                                key={group_id}
                                className={`m-2 my-3 border-2 rounded-lg p-2 ${group.status === 'completed' || group.status === 'ongoing' ? 'bg-gray-500 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                onClick={() => handleGroupClick(group_id)}
                            >
                                <h2>Group: {group_id}</h2>
                                <p>Status: <strong>{group.status}</strong></p>
                                <p>Users:</p>
                                <ul className='flex flex-col justify-center items-center'>
                                    {group.users.map((user, index) => (
                                        <li key={index}>{user.name}</li>
                                    ))}
                                </ul>
                                <button
                                    className={`mt-2 ${group.status === 'completed' || group.status === 'ongoing' ? 'bg-gray-800 cursor-not-allowed' : 'bg-blue-500 cursor-pointer'
                                        }`}
                                    onClick={() => handleGroupClick(group_id)}
                                    disabled={group.status === 'completed' || group.status === 'ongoing'}
                                >
                                    {group.status === 'completed' ? 'View Completed Game' : 'Start Playing'}
                                </button>
                            </li>
                        ))
                    ) : (
                        <p>You are not part of any group.</p>
                    )}
                </ul>
            </div>
        </>
    );
};

export default GroupList;
