import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/userContext';
import { useSocket } from "../context/socketProvider";
import { useNavigate } from 'react-router-dom';
import { API } from '../api/Api';

const PublicTable = () => {
  const { user, setUser } = useUser();
  const [roomID, setRoomID] = useState("");
  const [publicTable, setPublicTable] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('public');
  const socket = useSocket();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!user) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser) {
        setUser(currentUser);
      }
    }

    const fetchRoomDetails = async () => {
      try {
        socket.emit("rooms:available");
        socket.on("rooms:available:response", (availableRooms) => {
          // console.log("");
          setPublicTable(availableRooms); // Assuming this event emits the list of rooms
        });

      } catch (err) {
        setError('Failed to fetch room details');
        console.error('Error fetching rooms:', err);
      }
    };

    fetchRoomDetails();
  }, [user, setUser, socket]);

  // const handleJoinRoom = () => { 
  //   console.log("button clicked");
  //  }
  const handleJoinRoom = useCallback(async (e, table) => {
    if (!isJoining && roomID.trim() !== "") {
      setIsJoining(true);
      console.log("clicked ");
      try {
        // Join room workflow with API calls to get iteration ID, and updating wallet
        const contestIterationId = await axios.get(`${API}/jersey/get-contest-iteration_id`, {
          params: { master_room_id: table.masterRoomID }
        }).then(res => res.data.data);

        await axios.post(`${API}/jersey/insert-wallet-ledger`, {
          userId: user.id,
          transaction_source: 'game_fees',
          transaction_type: 'debit',
          amount: table.entryFee,
          fk_game: '2',
          fk_contest: table.id.toString(),
          roomId: contestIterationId
        });

        const response = await axios.patch(`${API}/user/update-wallet`, {
          email: user.email,
          amount: -table.entryFee
        });

        if (response.data.statusCode === 200) {
          const updatedUser = {
            ...user,
            current_wallet_balance: response.data.data.newCurrentWalletBalance,
            wallet_balance: response.data.data.newWalletBalance
          };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          socket.emit("room:join:request", {
            roomID: contestIterationId.toString(),
            contestRoomMasterId: table.masterRoomID,
            userDetails: {
              id: user.id,
              email: user.email,
              name: user.name
            },

            entryFee: table.entryFee
          });
        //   userDetails: {
        //     id: user.id,
        //     email: user.email,
        //     name: user.name
        // }
        }
      } catch (error) {
        console.error('Error Joining Room:', error);
        setError('Failed to join table. Please try again.');
        setIsJoining(false);
      }
    }
  }, [roomID, socket, user, setUser, isJoining]);

  useEffect(() => {
    socket.on("room:join:response", async ({ success, roomID, entryFee, error, contestRoomMasterId }) => {
      setIsJoining(false);
      console.log("did useEffect called");
      const userRoomJoinResponse = await axios.post(`${API}/jersey/join-room`, {
        roomId: roomID.toString(),
        userId: user.id
      })
      if (success) {
        console.log("user details", user);
        navigate(`/room/${roomID}`, { state: { roomIdLobby: roomID, entryFee, userDetails: user, contestRoomMasterId } });
      } else {
        switch (error) {
          case "Entry fee mismatch":
            alert("You cannot enter this room. Entry fee doesn't match.");
            break;
          case "User already in room":
            alert("You are already in this room.");
            break;
          case "User with this email already exists in the room":
            alert("A user with your email is already in this room.");
            break;
          default:
            alert(error || "Failed to join room");
        }
      }
    });

    return () => {
      socket.off("room:join:response");
    };
  }, [socket, navigate, user]);

  return (
    <div className='w-full flex flex-col justify-start items-center p-3'>
      <div className='w-full  flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8'>
        {activeTab === 'public' && (
          <div className='flex w-full flex-wrap lg:flex-row justify-center gap-4'>
            {publicTable && publicTable.length === 0 ? (
              <h3 className='text-gray-300'>No Public Rooms Exist</h3>
            ) : (
              publicTable && publicTable.map((table) => (
                <div key={table.id} className="bg-gray-800 w-[300px] rounded-lg shadow-lg overflow-hidden flex flex-col justify-center items-center">
                  <div className="bg-gray-700 flex flex-col justify-center items-start w-full px-4 py-3">
                    <h4 className="text-xl font-semibold text-gray-100">Room ID: {table.id}</h4>
                    <p className="text-gray-300">Entry Fee: ₹{table.entryFee}</p>
                    <p className="text-gray-300">Master roomId: {table.masterRoomID}</p>
                    <p className="text-gray-300">Participants: {Object.keys(table.participants).length}/{table.participantLimit}</p>
                    <p className="text-gray-300">Room Type: {table.roomType}</p>
                    <button className='w-full m-1 bg-blue-500 text-white font-extrabold' onClick={(e) => {
                      setRoomID(table.id);
                      handleJoinRoom(e, table);
                    }} >Join Table</button>


                  </div>
                </div>
              ))
            )}
          </div>
        )}

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

export default PublicTable;
