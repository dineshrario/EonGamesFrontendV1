import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/socketProvider';
import BgGround from '../img/PlayGroundBg.png'



const GameResultsTest = ({ scores = "13", totalPot = 10, firstPlaceWinnings = 10, secondPlaceWinnings = 6, currentUser = "Dinesh", roomID = 200, entryFee = 10 }) => {

    console.log("rematch details:", roomID, entryFee);
    const [rematchRequested, setRematchRequested] = useState(false);
    const [rematchResponses, setRematchResponses] = useState({});
    const socket = useSocket();
    const navigate = useNavigate();

    const sortedScores = [...scores].sort((a, b) => a.finalScore - b.finalScore);
    const commission = totalPot * 0.05;
    const potAfterCommission = totalPot - commission;

    useEffect(() => {
        // console.log("GameResultsTest useEffect called");
        socket.on("rematch:request", ({ requesterId }) => {
            console.log(  "request id"  ,requesterId);
            setRematchResponses(prev => ({ ...prev, [requesterId]: "pending" }));
            setRematchRequested(true);
        });

        socket.on("rematch:response", ({ responderId, response }) => {
            setRematchResponses(prev => ({ ...prev, [responderId]: response }));
        });


        socket.on("rematch:accepted", ({ newRoomID }) => {
            console.log("Rematch accepted, navigating to new room:", newRoomID);
            navigate(`/room/${newRoomID}`, {
                state: {
                    roomIdLobby: newRoomID,
                    entryFee,
                    userDetails: currentUser,
                    isRematch: true
                }
            });
        });

        return () => {
            socket.off("rematch:request");
            socket.off("rematch:response");
            socket.off("rematch:accepted");
        };
    }, [socket, navigate, entryFee, currentUser]);


    const handlePlayAgain = () => {
        socket.emit("rematch:request", { roomID });
        setRematchRequested(true);
        setRematchResponses(prev => ({ ...prev, [currentUser.socketId]: "yes" }));
    };

    const handleRematchResponse = (response) => {
        socket.emit("rematch:response", { roomID, response });
        setRematchResponses(prev => ({ ...prev, [currentUser.socketId]: response }));
    };

    const showPlayAgainButton = !rematchRequested && rematchResponses[currentUser.socketId] === undefined;
    const showRematchOptions = rematchRequested && rematchResponses[currentUser.socketId] === undefined;

    return (
        <div className="lg:w-full lg:h-full h-full flex flex-col items-center justify-center"
            style={{
                backgroundImage: `url(${BgGround})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <Link to='/' > Home </Link>
            <h2 className="text-2xl font-bold mb-4 text-blue-800">Game Results</h2>
            {/* <div className="mb-4">
                <p>Total Pot: ₹{totalPot.toFixed(2)}</p>
                <p>Platform Commission (5%): ₹{commission.toFixed(2)}</p>
                <p>Pot After Commission: ₹{potAfterCommission.toFixed(2)}</p>
            </div> */}
            <div className="w-full max-w-md p-1 ">
                <table className="w-full rounded-lg" style={{ background: '#4E496C1F' }} >
                    <thead>
                        <tr className="bg-gray-800 text-white " style={{ background: '#2054C4' }}>
                            <th className="p-2 text-left">Rank</th>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Score</th>
                            <th className="p-2 text-left">Winnings</th>
                        </tr>
                    </thead>
                    <tbody className='text-white ' >
                        {sortedScores.map((player, index) => (
                            <tr key={player.socketId} className={index % 2 === 0 ? 'bg-gray-700 ' : 'bg-gray-600'} style={{ background: '#2054C4' }}>
                                <td className="p-2  ">{index + 1}</td>
                                <td className="p-2  ">{player.name} {player.socketId === currentUser?.socketId && '(You)'}</td>
                                <td className="p-2  ">{player.finalScore}</td>
                                <td className="p-2  ">
                                    {index === 0 && `₹${parseFloat(firstPlaceWinnings).toFixed(2)}`}
                                    {index === 1 && `₹${parseFloat(secondPlaceWinnings).toFixed(2)}`}
                                    {index > 1 && '0'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                {showPlayAgainButton && (
                    <button
                        onClick={handlePlayAgain}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Play Again
                    </button>
                )}
                {showRematchOptions && (
                    <div>
                        <p>Do you want to play again?</p>
                        <button
                            onClick={() => handleRematchResponse("yes")}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded mr-2"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => handleRematchResponse("no")}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
                        >
                            No
                        </button>
                    </div>
                )}
            </div>

            {Object.entries(rematchResponses).map(([playerId, response]) => (
                playerId !== currentUser.socketId && (
                    <div key={playerId} className="mt-2">
                        <p>
                            {scores.find(s => s.socketId === playerId)?.name}
                            {response === "pending" ? " wants to play again" :
                                response === "yes" ? " agreed to play again" :
                                    " declined to play again"}
                        </p>
                    </div>
                )
            ))}
        </div>
    );
};

export default GameResultsTest;

// Use this code for GameResults if the code get messed up

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSocket } from '../context/socketProvider';
// import BgGround from '../img/PlayGroundBg.png'
// import Vertical from '../img/Vertical.png'


// const GameResults = ({ scores, totalPot, firstPlaceWinnings, secondPlaceWinnings, currentUser, roomID, entryFee }) => {

//     // console.log("rematch details:", roomID, entryFee);
//     const [rematchRequested, setRematchRequested] = useState(false);
//     const [rematchResponses, setRematchResponses] = useState({});
//     const socket = useSocket();
//     const navigate = useNavigate();

//     const sortedScores = [...scores].sort((a, b) => a.finalScore - b.finalScore);
//     const commission = totalPot * 0.05;
//     const potAfterCommission = totalPot - commission;

//     useEffect(() => {
//         // console.log("GameResults useEffect called");
//         socket.on("rematch:request", ({ requesterId }) => {
//             // console.log(  "request id"  ,requesterId);
//             // setRematchResponses(prev => ({ ...prev, [requesterId]: "pending" }));
//             // setRematchRequested(true);
//         });

//         socket.on("rematch:response", ({ responderId, response }) => {
//             // setRematchResponses(prev => ({ ...prev, [responderId]: response }));
//         });


//         socket.on("rematch:accepted", ({ newRoomID }) => {
//             console.log("Rematch accepted, navigating to new room:", newRoomID);
//             navigate(`/room/${newRoomID}`, {
//                 state: {
//                     roomIdLobby: newRoomID,
//                     entryFee,
//                     userDetails: currentUser,
//                     isRematch: true
//                 }
//             });
//         });

//         return () => {
//             socket.off("rematch:request");
//             socket.off("rematch:response");
//             socket.off("rematch:accepted");
//         };
//     }, [socket, navigate, entryFee, currentUser]);


//     const handlePlayAgain = () => {
//         socket.emit("rematch:request", { roomID });
//         setRematchRequested(true);
//         setRematchResponses(prev => ({ ...prev, [currentUser.socketId]: "yes" }));
//     };

//     const handleRematchResponse = (response) => {
//         socket.emit("rematch:response", { roomID, response });
//         setRematchResponses(prev => ({ ...prev, [currentUser.socketId]: response }));
//     };

//     const showPlayAgainButton = !rematchRequested && rematchResponses[currentUser.socketId] === undefined;
//     const showRematchOptions = rematchRequested && rematchResponses[currentUser.socketId] === undefined;

//     return (
//         <div className="lg:w-full lg:h-full h-full flex flex-col items-center justify-center"
//         style={{
//             backgroundImage: `url(${BgGround})`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat'
//         }}
//         >
//             <h2 className="text-2xl font-bold mb-4 text-blue-800">Game Results</h2>
//             {/* <div className="mb-4">
//                 <p>Total Pot: ₹{totalPot.toFixed(2)}</p>
//                 <p>Platform Commission (5%): ₹{commission.toFixed(2)}</p>
//                 <p>Pot After Commission: ₹{potAfterCommission.toFixed(2)}</p>
//             </div> */}
//             <div className="w-full max-w-md p-1 ">
//                 <table className="w-full rounded-lg" style={{ background:'#4E496C1F'}} >
//                     <thead>
//                         <tr className="bg-gray-800 text-white "  style={{ background:'#2054C4'}}>
//                             <th className="p-2 text-left">Rank</th>
//                             <th className="p-2 text-left">Name</th>
//                             <th className="p-2 text-left">Score</th>
//                             <th className="p-2 text-left">Winnings</th>
//                         </tr>
//                     </thead>
//                     <tbody className='text-white ' >
//                         {sortedScores.map((player, index) => (
//                             <tr key={player.socketId} className={index % 2 === 0 ? 'bg-gray-700 ' : 'bg-gray-600'}  style={{ background:'#2054C4'}}>
//                                 <td className="p-2  ">{index + 1}</td>
//                                 <td className="p-2  ">{player.name} {player.socketId === currentUser?.socketId && '(You)'}</td>
//                                 <td className="p-2  ">{player.finalScore}</td>
//                                 <td className="p-2  ">
//                                     {index === 0 && `₹${parseFloat(firstPlaceWinnings).toFixed(2)}`}
//                                     {index === 1 && `₹${parseFloat(secondPlaceWinnings).toFixed(2)}`}
//                                     {index > 1 && '0'}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//             {/* <div className="mt-4">
//                 {showPlayAgainButton && (
//                     <button
//                         onClick={handlePlayAgain}
//                         className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//                     >
//                         Play Again
//                     </button>
//                 )}
//                 {showRematchOptions && (
//                     <div>
//                         <p>Do you want to play again?</p>
//                         <button
//                             onClick={() => handleRematchResponse("yes")}
//                             className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded mr-2"
//                         >
//                             Yes
//                         </button>
//                         <button
//                             onClick={() => handleRematchResponse("no")}
//                             className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
//                         >
//                             No
//                         </button>
//                     </div>
//                 )}
//             </div> */}

//             {/* {Object.entries(rematchResponses).map(([playerId, response]) => (
//                 playerId !== currentUser.socketId && (
//                     <div key={playerId} className="mt-2">
//                         <p>
//                             {scores.find(s => s.socketId === playerId)?.name}
//                             {response === "pending" ? " wants to play again" :
//                                 response === "yes" ? " agreed to play again" :
//                                     " declined to play again"}
//                         </p>
//                     </div>
//                 )
//             ))} */}
//         </div>
//     );
// };

// export default GameResults;