import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/socketProvider";
import { useUser } from "../context/userContext";
import axios from 'axios';
import { API } from "../api/Api";

const Lobby = () => {
  const [room, setRoom] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { entryFee, userDetails, tableId } = location.state || {};
  const { user, setUser } = useUser();
  const [error, setError] = useState(null);
  // console.log("user details: ", user.id);


  const handleJoinRoom = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isCreatingRoom && room.trim() !== "") {
        setIsJoining(true);
        try {
          // console.log("room id to get master id:", room.trim());
          const master_room_id = room.trim();
          const iterationResponse = await axios.get(`${API}/jersey/get-contest-iteration_id`, {
            params: {
              master_room_id
            }
          });
          // console.log("Room Id user us joining", iterationResponse.data.data.id);
          const contestIterationId = iterationResponse.data.data;
          //console.log(iterationResponse.data)
          // console.log('rooom id for join', contestIterationId);
          const contestRoomMasterId = room.trim(); // This is the master room ID entered by the user
          const insertWalletLedger = await axios.post(`${API}/jersey/insert-wallet-ledger`,
            {
              userId:  user.id ,
              transaction_source: 'game_fees',
              transaction_type: 'debit' ,
              amount : entryFee,
              fk_game :'2' , 
              fk_contest : tableId.toString() ,  
              roomId: contestIterationId
            }
          )

          const response = await axios.patch(`${API}/user/update-wallet`, {
            email: user.email,
            amount: -entryFee
          });
          // console.log("does error realy occur");

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
              contestRoomMasterId: contestRoomMasterId,
              userDetails: userDetails,
              entryFee: entryFee
            });

          }
        } catch (error) {
          console.error('Error Joining Room:', error);
          setError('Failed to join table. Please try again.');
          setIsJoining(false);
        }
      }
    },
    [isCreatingRoom, room, socket, userDetails, entryFee, user, setUser]
  );

  const handleCreateNewRoom = useCallback(async () => {
    if (!isCreatingRoom) {
      setIsCreatingRoom(true);
      try {
        // First, update the wallet
        const walletResponse = await axios.patch(`${API}/user/update-wallet`, {
          email: user.email,
          amount: -entryFee
        });

       
        if (walletResponse.data.statusCode === 200) {
          const updatedUser = {
            ...user,
            current_wallet_balance: walletResponse.data.data.newCurrentWalletBalance,
            wallet_balance: walletResponse.data.data.newWalletBalance
          };
          setUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          // Now, create the room entry in the database
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          const roomCreateResponse = await axios.post(`${API}/jersey/create-room`, {
            room_type: "private",
            created_by: currentUser.id.toString(),
            fk_contest: tableId.toString()
          });

          const insertWalletLedger = await axios.post(`${API}/jersey/insert-wallet-ledger`,
            {
              userId:  user.id ,
              transaction_source: 'game_fees',
              transaction_type: 'debit' ,
              amount : entryFee,
              fk_game :'2' , 
              fk_contest : tableId.toString() ,  
              roomId: roomCreateResponse.data.data.contestRoomIteration.id
            }
          )
          if (roomCreateResponse.data && roomCreateResponse.data.data) {
            const contestRoomIterationId = roomCreateResponse.data.data.contestRoomIteration.id;
            const contestRoomMasterId = roomCreateResponse.data.data.contestRoomMaster.id;

            // console.log("this is contestRoomIterationId", contestRoomIterationId);
            // Emit socket event with the created room ID
            console.log("this is user details:", userDetails);
            socket.emit("room:create", {
              entryFee,
              userDetails,
              contestRoomIterationId,
              contestRoomMasterId,
              roomType: "private",
              participantLimit: "7",
            });
          } else {
            throw new Error('Failed to create room in database');
          }
        }
      } catch (error) {
        console.error('Error updating wallet:', error);
        setError('Failed to create room. Please try again.');
        setIsCreatingRoom(false);
      }
    }
  }, [isCreatingRoom, socket, entryFee, userDetails, user, setUser]);

  useEffect(() => {

    socket.on("room:created:response", ({ RoomExists, roomID, contestRoomMasterId }) => {
      if (RoomExists) {
        setIsCreatingRoom(false);
        // console.log("roomMaster Id", contestRoomMasterId);
        navigate(`/room/${roomID}`, { state: { roomIdLobby: roomID, entryFee, userDetails, contestRoomMasterId , tableId} });
      } else {
        alert("Failed to create room");
      }
    });

    socket.on("room:join:response", async ({ success, roomID, roomEntryFee, error, contestRoomMasterId }) => {


      setIsJoining(false);
      if (success) {
        // console.log("room id for joining", roomID);

        const userRoomJoinResponse = await axios.post(`${API}/jersey/join-room`, {
          roomId: roomID.toString(),
          userId: user.id
        })
        // console.log("response for joining room:", userRoomJoinResponse);
        navigate(`/room/${roomID}`, { state: { roomIdLobby: roomID, entryFee: roomEntryFee, userDetails, contestRoomMasterId, tableId } });


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
      socket.off("room:created:response");
      socket.off("room:join:response");
    };
  }, [socket, navigate, entryFee, userDetails]);

  return (
<div className="lg:w-full lg:h-full h-screen bg-gray-900 text-white flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Game Lobby</h1>
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
         
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-300 mb-2">
                Room Number
              </label>
              <input
                type="text"
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter room number"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <button
                type="submit"
                disabled={isCreatingRoom || isJoining}
                className="w-full sm:w-1/2 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? "Joining..." : "Join Room"}
              </button>
              <button
                onClick={handleCreateNewRoom}
                disabled={isCreatingRoom}
                className="w-full sm:w-1/2 bg-green-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingRoom ? "Creating..." : "Create Room"}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default Lobby;