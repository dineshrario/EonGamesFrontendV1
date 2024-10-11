import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/socketProvider';
import BgGround from '../img/PlayGroundBg.png'
import Vertical from '../img/Vertical.png'
import Celebration from '../sounds/Winning.mp3'
// import useWindowSize from "react-use/lib/useWindowSize";
// import Confetti from "react-confetti";


const GameResults = ({ scores, totalPot, firstPlaceWinnings, secondPlaceWinnings, currentUser, roomID, entryFee, contestRoomMasterId }) => {

    // console.log("rematch details:", roomID, entryFee);
    // console.log("Game rsults score:", Scores);
    //const [rematchRequested, setRematchRequested] = useState(false);
    //const [rematchResponses, setRematchResponses] = useState({});
    const socket = useSocket();
    const navigate = useNavigate();

    const sortedScores = [...scores].sort((a, b) => a.finalScore - b.finalScore);
    const commission = totalPot * 0.05;
    const potAfterCommission = totalPot - commission;

    useEffect(() => {
        const audio = new Audio(Celebration);
        audio.play();

        // console.log("GameResults useEffect called");
        // socket.on("rematch:requested", ({ requesterId }) => {
        //     setRematchRequested(true);
        //     setRematchResponses(prev => ({ ...prev, [requesterId]: true }));
        // });

        // socket.on("rematch:response", ({ responderId, response }) => {
        //     setRematchResponses(prev => ({ ...prev, [responderId]: response }));
        // });

        // socket.on("rematch:accepted", ({ roomID }) => {
        //     navigate(`/room/${roomID}`, {
        //         state: {
        //             roomIdLobby: roomID,
        //             entryFee,
        //             userDetails: currentUser,
        //             isRematch: true,
        //             contestRoomMasterId
        //         }
        //     });
        // });

        // socket.on("rematch:rejected", () => {
        //     setRematchRequested(false);
        //     setRematchResponses({});
        //     // Optionally show a message that rematch was rejected
        // });

        // return () => {
        //     socket.off("rematch:requested");
        //     socket.off("rematch:response");
        //     socket.off("rematch:accepted");
        //     socket.off("rematch:rejected");
        // };
    }, [socket, navigate, roomID, entryFee, currentUser, contestRoomMasterId]);


    // const handlePlayAgain = () => {
    //     if (rematchRequested) {
    //         socket.emit("rematch:response", { roomID, response: true });
    //     } else {
    //         socket.emit("rematch:request", { roomID });
    //     }
    // };
    // const handleReject = () => {
    //     socket.emit("rematch:response", { roomID, response: false });
    // };


    //const showPlayAgainButton = !rematchRequested && rematchResponses[currentUser.socketId] === undefined;
    //const showRematchOptions = rematchRequested && rematchResponses[currentUser.socketId] === undefined;

    return (
        <div className="lg:w-full lg:h-full h-full flex flex-col items-center justify-center"
            style={{
                backgroundImage: `url(${BgGround})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
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
            {/* {rematchRequested ? (
                <div>
                    <p>Rematch requested. Do you want to play again?</p>
                    <button onClick={handlePlayAgain}>Yes</button>
                    <button onClick={handleReject}>No</button>
                </div>
            ) : (
                <button onClick={handlePlayAgain}>Play Again</button>
            )} */}

            {/* Display rematch responses */}
            {/* {Object.entries(rematchResponses).map(([playerId, response]) => (
                <p key={playerId}>{playerId} has {response ? 'accepted' : 'rejected'} the rematch</p>
            ))} */}
        </div>
    );
};

export default GameResults;