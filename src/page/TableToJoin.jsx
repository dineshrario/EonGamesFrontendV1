import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/userContext';
import { useSocket } from "../context/socketProvider";
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API } from '../api/Api';
import { Socket } from 'socket.io-client';
import PublicTable from '../components/PublicTable';

const TableToJoin = () => {
    const { user, setUser } = useUser(null);
    const [tables, setTables] = useState([]);
    const socket = useSocket();

    const [publicTable, setPublicTable] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('public'); // State to manage active tab
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                setUser(currentUser);
            }
        }

        const fetchRoomDetails = async () => {
            try {
                const response = await axios.get(`${API}/jersey/table-details`);
                setTables(response.data.data);

                socket.emit("rooms:available");
                socket.on("rooms:available:response", (availableRooms) => {
                    // console.log("Available rooms are here:", availableRooms);
                    setPublicTable(availableRooms); // Assuming this event emits the list of rooms
                });

            } catch (err) {
                setError('Failed to fetch room details');
                console.error('Error fetching rooms:', err);
            }
        };

        fetchRoomDetails();
    }, [user, setUser, socket, setPublicTable]);


    const handleJoinTable = (tableId, entryFee) => {
        if (!user) {
            alert('User not found. Please log in again.');
            return;
        }

        if (user.current_wallet_balance < entryFee) {
            alert('Insufficient Balance!');
            return;
        }

        navigate('/lobby', {
            state: {
                tableId: tableId,
                entryFee: entryFee,
                userDetails: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        });
    };

    return (
        <div className='w-full lg:h-full h-screen flex flex-col justify-start items-center p-3'>
            <div className='flex-grow flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8'>
                {/* <div className='flex justify-center items-center lg:h-[67px] gap-5 lg:text-2xl my-[10px]  bg-blue-600 p-3 rounded-lg h-[60px] text-white '>
                    <h2 className={activeTab === 'public' ? 'text-blue-800 bg-white px-3 py-2 rounded-lg font-bold cursor-pointer' : 'cursor-pointer'}
                        onClick={() => setActiveTab('public')}>Public</h2>
                    <h2 className={activeTab === 'private' ? 'text-blue-800 bg-white px-3 py-2 rounded-lg font-bold cursor-pointer' : 'cursor-pointer'}
                        onClick={() => setActiveTab('private')}>Private</h2>
                </div> */}
                <h3 className='lg:text-3xl text-xl font-bold text-center mb-8 text-gray-100'>
                    Choose your table to enter the game
                </h3>
                {/* {activeTab === 'public' && (
                    <div className=' flex w-full h-full flex-wrap justify-center items-start gap-4'>
                        {publicTable && publicTable.length === 0 ? (
                            <h3 className='text-gray-300'>No Public Rooms Exist</h3>
                        ) : (
                            <PublicTable />
                        )}
                    </div>
                )}
                <div className='' >

                </div> */}
                {/* {activeTab === 'private' && (
                   
                )} */}
                 <div className="flex flex-wrap  justify-center items-center gap-8 max-w-7xl mx-auto">
                        {tables.map((table) => (
                            <div key={table.id} className="bg-gray-800 w-full sm:w-5/12 lg:w-3/12 rounded-lg shadow-lg overflow-hidden">
                                <div className="bg-gray-700 px-4">
                                    <h4 className="text-xl font-semibold text-gray-100">Entry Fee: ₹{table.entry_fee}</h4>
                                </div>
                                <div className="p-4">
                                    <button
                                        onClick={() => handleJoinTable(table.id, table.entry_fee)}
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
                                        disabled={table.status !== 'active'}
                                    >
                                        Join Table
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                {error && (
                    <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TableToJoin;
