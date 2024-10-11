import React, { useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PlayerCard from "./PlayerCard";
import UserDetail from "./UserDetail";
import Navbar from "./Navbar";
import axios from "axios";
import infoButton from '../img/infoButton.png'
import gameInfo from '../img/Rules.png'
import { API } from "../api/Api";

const RoomPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const { roomIdLobby, entryFee, userDetails, isRematch, contestRoomMasterId, tableId } = location.state || {};
  const [roomID, setRoomID] = useState(roomId || roomIdLobby);
  const socket = useSocket();
  const navigate = useNavigate();
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [roomEntryFee, setRoomEntryFee] = useState(entryFee);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(null);
  const [isGameInfoVisible, setIsGameInfoVisible] = useState(false);


  // console.log("Room component rendered. roomId:", roomId, "isRematch:", isRematch);
  const firstPlayer = roomParticipants[0] || null;
  // console.log("this is first player", firstPlayer);
  // console.log("room participants", roomParticipants);
  // console.log("contest room master Id:", contestRoomMasterId);
  const configData = async () => {
    const gameConfigResponse = await axios.get(`${API}/jersey/game-config`);
    // const gameConfigData = Array.isArray(gameConfigResponse.data) ? gameConfigResponse.data : [];
    // const gameConfig = gameConfigData.reduce((acc, config) => {
    //   acc[config.rule] = config.config_param;
    //   return acc;
    // }, {});
    // console.log("gameConfig: ", gameConfigResponse.data.data);
    const response = gameConfigResponse.data.data
    return response
  }
  useEffect(() => {
    configData()
  })



  const handleExitRoom = () => {
    socket.emit("room:exit:request", {
      roomId: roomID,
      socketId: socket.id
    });
    navigate("/jersey-game");
  };

  useEffect(() => {
    if (roomID) {
      socket.emit("room:getAllUsers", { clientRoomId: roomID });
    }

    socket.on("room:getAllUsers:response", ({ roomId, participants, entryFee }) => {
      // console.log("Received room:getAllUsers:response:", { roomId, participants, entryFee });
      setRoomParticipants(participants);
      setRoomID(roomId);
      setRoomEntryFee(entryFee);
    });

    socket.on("user:joined", () => {
      socket.emit("room:getAllUsers", { clientRoomId: roomID });
    });

    socket.on("room:exit:response", ({ success, message }) => {
      if (success) {
        navigate("/jersey-game");
      } else {
        alert(message);
      }
    });

    socket.on("game:start", ({ firstPlayer }) => {
      setGameStarted(true);
      setCurrentPlayerTurn(firstPlayer);
    });

    socket.on("user:left", () => {
      socket.emit("room:getAllUsers", { clientRoomId: roomID });
    });

    socket.on("game:end", ({ scores, totalPot, firstPlaceWinnings, secondPlaceWinnings }) => {
      setGameStarted(false);
      // Navigate to GameResults component
      navigate(`/game-results/${roomID}`, {
        state: {
          roomID,
          entryFee: roomEntryFee,
          userDetails,
          scores,
          totalPot,
          firstPlaceWinnings,
          secondPlaceWinnings
        }
      });
    });
    socket.on("game:updated", ({ currentPlayer }) => {
      setCurrentPlayerTurn(currentPlayer);
    });

    if (isRematch) {
      // console.log("This is a rematch. Emitting room:rematch:ready. Room ID:", roomID);
      socket.emit("room:rematch:ready", { roomID });
    }


    return () => {
      socket.off("room:getAllUsers:response");
      socket.off("user:joined");
      socket.off("room:exit:response");
      socket.off("user:left");
      socket.off("game:start");
      socket.off("game:end");
      socket.off("game:updated");
    };
  }, [socket, roomID, navigate, roomEntryFee, userDetails, isRematch]);
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const showInfoStyle = showInfo ? 'block' : 'none';

  // console.log("Current roomParticipants:", roomParticipants);

  return (
    <div className=" lg:w-full w-full lg:h-[790px] h-[900px] overflow-auto bg-gray-900 text-white lg:flex lg:flex-col lg:my-0 my-2 z-10">
      {/* <Navbar/> */}
      <div className=" bg-gray-900 lg:p-4 px-4 flex justify-between items-center  ">
        <h1 className="lg:text-2xl text-lg font-bold ">Room: {contestRoomMasterId || "Not available"}</h1>
        <div className="flex flex-col justify-center items-center relative"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onClick={toggleInfo}> 
          <img className="w-9 h-9 cursor-pointer" src={infoButton} alt="Info Button" />
          <div id="gameInfo" className="lg:h-[600px] lg:w-[400px] w-[360px] absolute top-[100px] z-20"
            style={{ display: showInfoStyle }}>
            <img className="ml-[10px] rounded-lg border-2 border-gray-950" src={gameInfo} alt="Game Info" />
          </div>
        </div>

        {/* {add here that image which will hover over the this whole div of the component, get hidden when curser will be removed} */}
        <button
          onClick={handleExitRoom}
          className="bg-red-500 hover:bg-red-600 text-white lg:font-bold lg:py-2 lg:px-4 rounded transition duration-300"
        >
          Exit Room
        </button>
      </div>

      {/* Main content */}
      <div className="flex-grow lg:flex ">
        {/* Left sidebar */}
        <div className={`lg:w-1/5  bg-gray-900 p-4 overflow-x-auto  max-sm:hidden ${!gameStarted ? 'max-sm:hidden' : ''}`}>
          <h2 className="flex flex-row text-xl font-semibold mb-4">Players</h2>
          <ul className="lg:space-y-2">
            {roomParticipants.length > 0 ? (
              roomParticipants.map((participant) => {
                const isCurrentPlayer = participant.socketId === currentPlayerTurn;
                const isFirstPlayer = !currentPlayerTurn && participant === firstPlayer;
                return (
                  <li
                    key={participant.socketId}
                    className={`p-2 m-1 rounded transition-all duration-300 ${isCurrentPlayer || isFirstPlayer
                      ? 'bg-green-600 text-white font-bold'
                      : 'bg-gray-700'
                      }`}
                  >
                    <div className="flex items-center">
                      {(isCurrentPlayer || isFirstPlayer) && (
                        <span className="mr-2">▶</span>
                      )}
                      <span>{participant.name || 'Unknown Player'}</span>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="bg-gray-700 p-2 rounded">No players yet</li>
            )}
          </ul>
        </div>

        {/* Game area */}
        <div className="lg:flex-grow h-[700px] lg:h-full lg:flex lg:flex-col lg:items-center lg:bg-gray-900 lg:justify-center "
        // style={{
        //   backgroundImage: `url(https://drive.google.com/uc?export=view&id=1pt7u9y1J55K7QbSUoiwayZuf2XQSwxxG)`,
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        //   backgroundRepeat: 'no-repeat',
        // }}
        >
          <div className="lg:w-full lg:h-full h-full lg:max-w-4xl lg:aspect-[16/9] lg:border bg-gray-800  border-gray-600 rounded-lg  m-2">
            <PlayerCard
              roomID={roomID}
              playerCount={roomParticipants.length}
              canStartGame={roomParticipants.length >= 3 && roomParticipants.length <= 7}
              entryFee={roomEntryFee}
              userDetails={userDetails}
              firstPlayer={firstPlayer}
              roomParticipants={roomParticipants}
              contestRoomMasterId={contestRoomMasterId}
              tableId={tableId}

            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:w-1/5 lg:bg-gray-900 lg:p-4 rounded-lg p-2 bg-gray-800 my-5 m-1  max-sm:hidden">
          <h2 className="text-xl font-semibold mb-4 ">Game Info</h2>
          <div className="space-y-2 ">
            <p>Entry Fee: ₹{roomEntryFee}</p>
            <p>Players: {roomParticipants.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;