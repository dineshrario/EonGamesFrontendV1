import React, { useState, useEffect, useRef } from 'react';
import TakenCards from './TakenCard';
import UserDetail from './UserDetail';
import { useSocket } from '../context/socketProvider';
import axios from 'axios';
import GameResults from './GameResults';
import { useNavigate } from 'react-router-dom';
import OtherPlayer from './OtherPlayer';
import Navbar from './Navbar';
import BallImg from '../img/ball.png'
import jersey1 from '../img/1.png'
import BgGround from '../img/PlayGroundBg.png'
import { ImageMap } from '../json/imagemap';
import Cardback from '../img/CardBack.png'
import Vertical from '../img/Vertical.png'
import { API } from '../api/Api';
import TakeSound from '../sounds/TakeCardSound.mp3'
import PassSound from '../sounds/PassSound.mp3'
import Vertical2 from '../img/toDines.png'


const PlayerCard = ({ roomID, playerCount, entryFee, canStartGame, userDetails, currentTurn, participants, firstPlayer, roomParticipants, contestRoomMasterId, tableId }) => {
    // console.log("Image URL:", ImageMap[currentCard]);
    // console.log("user deatils:", userDetails);
    const socket = useSocket();
    const navigate = useNavigate();
    const [totalScore, setTotalScore] = useState(0);
    const [currentCard, setCurrentCard] = useState(null);
    const [takenCards, setTakenCards] = useState([]);
    const [tokens, setTokens] = useState(11);
    const [isCurrentPlayer, setIsCurrentPlayer] = useState(false);
    const [tokensOnCard, setTokensOnCard] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameEnded, setGameEnded] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [waitingForStart, setWaitingForStart] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [gameResults, setGameResults] = useState(null);
    const [shouldUpdateWallet, setShouldUpdateWallet] = useState(false);
    const [playerAction, setPlayerAction] = useState(null);
    const [otherPlayers, setOtherPlayers] = useState([]);
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState(null);
    const [remainingCards, setRemainingCards] = useState(24);
    const [initialFirstPlayer, setInitialFirstPlayer] = useState(null);
    const [firstTurnPassed, setFirstTurnPassed] = useState(false);
    const [lastInsertedCard, setLastInsertedCard] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);
    const [showTokensOnCardTooltip, setShowTokensOnCardTooltip] = useState(false);
    const [showRemainingCardsTooltip, setShowRemainingCardsTooltip] = useState(false);
    const tokensOnCardTooltipRef = useRef(null);
    const remainingCardsTooltipRef = useRef(null);
    const [lastCardTaker, setLastCardTaker] = useState(null);
    const [pickedIndicator, setPickedIndicator] = useState(false)
    const [delayedCurrentCard, setDelayedCurrentCard] = useState(null);
    const [delayedTimeLeft, setDelayedTimeLeft] = useState(null);
    const [showScoreTooltip, setShowScoreTooltip] = useState(false);
    // console.log('Last card taker:', lastCardTaker);
    useEffect(() => {
        if (lastCardTaker && lastCardTaker.socketId !== socket.id) {
            setPickedIndicator(true);
            const timer = setTimeout(() => {
                setPickedIndicator(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [lastCardTaker, socket.id]);

    const calculateUserScore = ({ cards, tokens }) => {
        if (!cards || cards.length === 0) return 0;

        const sortedCards = [...cards].sort((a, b) => a - b);
        const sequences = [];
        let currentSequence = [sortedCards[0]];

        for (let i = 1; i < sortedCards.length; i++) {
            if (sortedCards[i] === sortedCards[i - 1] + 1) {
                currentSequence.push(sortedCards[i]);
            } else {
                sequences.push(currentSequence);
                currentSequence = [sortedCards[i]];
            }
        }
        sequences.push(currentSequence);

        const calculateSequenceScore = (seq) => seq.length > 1 ? seq[0] : seq.reduce((a, b) => a + b, 0);

        const totalScore = sequences.reduce((sum, seq) => sum + calculateSequenceScore(seq), 0);

        return totalScore - tokens; // Subtract tokens from the total score
    }
    useEffect(() => {
        const score = calculateUserScore({ cards: takenCards, tokens });
        setTotalScore(score);
    }, [takenCards, tokens]);

    useEffect(() => {
        if (currentCard) {
            const timer = setTimeout(() => {
                setDelayedCurrentCard(currentCard);
                setDelayedTimeLeft(15);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [currentCard]);

    useEffect(() => {
        const userFromStorage = JSON.parse(localStorage.getItem('currentUser'));
        if (userFromStorage) {
            setCurrentUser(userFromStorage);
            socket.emit('user:details', { roomID, email: userFromStorage.email, name: userFromStorage.name });
        }
    }, [socket, roomID, userDetails]);

    const updateWallet = async (winnings) => {
        if (!winnings || isNaN(winnings) || !currentUser) {
            console.error('Invalid winnings amount or currentUser not set:', { winnings, currentUser });
            return;
        }
        try {
            // console.log("this tableId", tableId);
            const insertWalletLedger = await axios.post(`${API}/jersey/insert-wallet-ledger`,
                {
                    userId: userDetails.id,
                    transaction_source: 'winnings',
                    transaction_type: 'credit',
                    amount: winnings,
                    fk_game: '2',
                    fk_contest: tableId.toString(),
                    roomId: roomID,
                }
            )

            const response = await axios.patch(`${API}/user/update-wallet`, {
                email: currentUser.email,
                amount: winnings,
            });


            if (response.data.statusCode === 200) {
                const updatedUser = {
                    ...currentUser,
                    current_wallet_balance: response.data.data.newCurrentWalletBalance,
                    wallet_balance: response.data.data.newWalletBalance
                };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
            }
        } catch (error) {
            console.error('Error updating wallet:', error);
        }
    };

    useEffect(() => {
        if (firstPlayer && !initialFirstPlayer) {
            setInitialFirstPlayer(firstPlayer);
        }
    }, [firstPlayer]);

    useEffect(() => {
        if (shouldUpdateWallet && gameResults && currentUser) {
            const playerScore = gameResults.scores.find(score => score.socketId === socket.id);
            if (playerScore) {
                if (playerScore === gameResults.scores[0]) {
                    updateWallet(gameResults.firstPlaceWinnings);
                } else if (playerScore === gameResults.scores[1]) {
                    updateWallet(gameResults.secondPlaceWinnings);
                }
            }
            // 
            setShouldUpdateWallet(false);
        }
    }, [shouldUpdateWallet, gameResults, currentUser, socket.id]);

    useEffect(() => {
        if (!socket) return;

        const handleError = (error) => {
            console.error("Socket error:", error);
        };

        socket.on("error", handleError);

        socket.on("game:waiting", () => {
            setWaitingForStart(true);
        });

        socket.on("game:started", async ({ currentCard, currentPlayer, remainingCards, players }) => {
            // console.log("Game started:", { currentCard, currentPlayer, remainingCards, players });
            // console.log('current card:', currentCard);
            setGameStarted(true);
            setCurrentCard(currentCard);
            setWaitingForStart(false);
            setIsCurrentPlayer(currentPlayer === socket.id);
            setTimeLeft(15);
            setRemainingCards(remainingCards);
            setOtherPlayers(players.filter(p => p.socketId !== socket.id));

            // const insertCardNumber = await axios.post(`${API}/jersey/insert-new-card`,
            //     { roomId: roomID, cardNumber: currentCard }
            // )
            // console.log("response for insert at start:", insertCardNumber);

        });

        socket.on("game:updated", async ({ currentCard, currentPlayer, tokensOnCard, playerTokens, playerCards, remainingCards, lastTaker }) => {
            // console.log("Game updated event received. Last taker:", lastTaker);

            setCurrentCard(currentCard);
            setIsCurrentPlayer(currentPlayer === socket.id);
            setTokensOnCard(tokensOnCard);
            setTimeLeft(15);
            setCurrentPlayerTurn(currentPlayer);
            setRemainingCards(remainingCards);
            setFirstTurnPassed(true);

            if (lastTaker && lastTaker.socketId !== socket.id) {
                setLastCardTaker(lastTaker);
                // console.log("Last card taker set:", lastTaker);
            } else {
                setLastCardTaker(null);
                // console.log("Last card taker not set or reset. Current socket id:", socket.id);
            }

            if (Array.isArray(playerTokens)) {
                const playerData = playerTokens.find(p => p.socketId === socket.id);
                if (playerData) {
                    setTokens(playerData.tokens);
                }
            }

            if (Array.isArray(playerCards)) {
                const playerCardData = playerCards.find(p => p.socketId === socket.id);
                if (playerCardData && Array.isArray(playerCardData.cards)) {
                    setTakenCards(playerCardData.cards);
                }
            }

            const updatedOtherPlayers = playerTokens
                .filter(p => p.socketId !== socket.id)
                .map(p => ({
                    socketId: p.socketId,
                    name: p.name,
                    tokens: p.tokens,
                    cards: playerCards.find(pc => pc.socketId === p.socketId)?.cards || [],
                    lastAction: p.lastAction || null
                }));
            setOtherPlayers(updatedOtherPlayers);
        });

        socket.on("player:action", (action) => {
            // console.log("Player action:", action);
            if (action) {
                setPlayerAction(action);
                if (action.remainingCards !== undefined) {
                    setRemainingCards(action.remainingCards);
                }
                setOtherPlayers(prevPlayers =>
                    prevPlayers.map(player =>
                        player.socketId === action.socketId
                            ? { ...player, lastAction: action }
                            : player
                    )
                );
                setTimeout(() => setPlayerAction(null), 3000);
            }
        });

        socket.on("game:ended", (data) => {
            // console.log("Game ended:", data);
            setGameEnded(true);
            if (Array.isArray(data.scores)) {
                const calculatedScores = data.scores.map(player => ({
                    ...player,
                    finalScore: player.score
                }));
                setGameResults({
                    scores: calculatedScores,
                    totalPot: data.totalPot || 0,
                    platformCommission: data.platformCommission || 0,
                    potAfterCommission: data.potAfterCommission || data.totalPot || 0,
                    firstPlaceWinnings: data.firstPlaceWinnings || 0,
                    secondPlaceWinnings: data.secondPlaceWinnings || 0
                });
                setShouldUpdateWallet(true);
            }
        });

        return () => {
            socket.off("game:started");
            socket.off("game:waiting");
            socket.off("game:updated");
            socket.off("player:action");
            socket.off("game:ended");
            socket.off("error", handleError);
        };
    }, [socket, roomID]);

    const handlePass = async () => {
        if (isCurrentPlayer && tokens > 0 && socket && !actionInProgress) {
            const audio = new Audio(PassSound); // Create a new audio object
            audio.play(); // Play the sound

            setActionInProgress(true);
            try {
                console.log("data at user interaction", userDetails);
                console.log("roomID:", roomID)
                console.log("currentCard:", currentCard)
                console.log("timeleft:", timeLeft)
                console.log("userTokensleft:", tokens)
                console.log("Token On Jursey:", tokensOnCard)


                axios.post(`${API}/jersey/insert-user-input`, {
                    roomId: roomID,
                    userId: userDetails.id,
                    cardNumber: currentCard,
                    actionType: "pass",
                    timeLeft: timeLeft,
                    userTokenLeft: tokens,
                    TokenOnJersey: tokensOnCard
                });

                socket.emit("game:pass", roomID);

            } catch (error) {
                console.error("Error handling pass action:", error);
            } finally {
                setDelayedTimeLeft(15)
                setActionInProgress(false);

            }
        }
    };

    const handleTake = async () => {
        if (isCurrentPlayer && socket && !actionInProgress) {

            const audio = new Audio(TakeSound); // Create a new audio object
            audio.play(); // Play the sound

            setActionInProgress(true);
            try {
                axios.patch(`${API}/jersey/update-card-status`, {
                    roomId: roomID,
                    cardNumber: currentCard
                });
                // console.log("user details:", roomID, userId, cardNumber, actionType, timeLeft, userTokenLeft, TokenOnJersey);
                console.log("data at user interaction", userDetails);
                const responseonTake = axios.post(`${API}/jersey/insert-user-input`, {
                    roomId: roomID,
                    userId: userDetails.id,
                    cardNumber: currentCard,
                    actionType: "take",
                    timeLeft: timeLeft,
                    userTokenLeft: tokens,
                    TokenOnJersey: tokensOnCard
                });
                // console.log("this take response:", responseonTake);
                socket.emit("game:take", roomID, contestRoomMasterId);

                setLastCardTaker(socket.id); // Reset lastCardTaker when current player takes a card
            } catch (error) {
                console.error("Error handling take action:", error);
            } finally {
                setActionInProgress(false);
            }
        }
    };

    const handleStartGame = () => {
        if (socket && roomID && canStartGame) {
            socket.emit("game:start", roomID);
            setWaitingForStart(true);
            // console.log("update details:", roomID, contestRoomMasterId);
            const updateRoomStatus = axios.patch(`${API}/jersey/start-room-status`, {
                roomId: roomID,
                master_room_id: contestRoomMasterId
            })
            // console.log("updateRoomStatus", updateRoomStatus);
        } else {
            console.error("Cannot start game:", { socket: !!socket, roomID, canStartGame });
        }
    };

    useEffect(() => {
        let timer;
        if (isCurrentPlayer && delayedTimeLeft !== null && delayedTimeLeft > 0) {
            timer = setInterval(() => {
                setDelayedTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (isCurrentPlayer && delayedTimeLeft === 0) {
            handleTake();
        }
        return () => clearInterval(timer);
    }, [isCurrentPlayer, delayedTimeLeft]);

    // const renderOtherPlayers = () => {
    //     const currentUserEmail = JSON.parse(localStorage.getItem('currentUser'))?.email;
    //     const otherParticipants = roomParticipants.filter(participant => participant.email !== currentUserEmail);

    //     // Find the index of the initialFirstPlayer
    //     const initialFirstPlayerIndex = otherParticipants.findIndex(participant => participant.socketId === initialFirstPlayer?.socketId);

    //     // If initialFirstPlayerIndex is -1, set it to 0 to avoid errors
    //     const validIndex = initialFirstPlayerIndex === -1 ? 0 : initialFirstPlayerIndex;

    //     const currentUserIndex = roomParticipants.findIndex(participant => participant.email === currentUserEmail);
    //     let orderedParticipants = []
    //     // Rearrange the participants to start with the next player after the current user


    //     if (roomParticipants.length < 6) {

    //         orderedParticipants = [
    //             ...roomParticipants.slice(currentUserIndex + 1), // Next players
    //             ...roomParticipants.slice(0, currentUserIndex + 1) // Previous players including current user
    //         ];

    //     }
    //     else if (roomParticipants.length === 6) {
    //         orderedParticipants = [
    //             ...roomParticipants.slice((currentUserIndex + 2) % roomParticipants.length),
    //             ...roomParticipants.slice(0, (currentUserIndex + 2) % roomParticipants.length)
    //         ];


    //     }

    //     orderedParticipants = orderedParticipants.filter(participant => participant.email !== currentUserEmail);
    //     // console.log(orderedParticipants);

    //     // Rearrange the participants to start with the initialFirstPlayer and go clockwise
    //     // const orderedParticipants = [
    //     //     ...otherParticipants.slice(validIndex),
    //     //     ...otherParticipants.slice(0, validIndex)
    //     // ];

    //     if (orderedParticipants.length === 0) {
    //         return null; // or return some placeholder UI
    //     }

    //     return (
    //         <div className='w-full flex flex-row flex-wrap gap-4'>
    //             {orderedParticipants.length === 3 ? (
    //                 <div className='flex justify-between w-full'>
    //                     {orderedParticipants.map(participant => (
    //                         <OtherPlayer
    //                             key={participant.socketId}
    //                             player={{
    //                                 ...participant,
    //                                 ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
    //                             }}
    //                             isCurrentTurn={currentPlayerTurn === participant.socketId}
    //                             isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
    //                         />
    //                     ))}
    //                 </div>
    //             ) : (
    //                 <>
    //                     <div className='flex justify-between  w-full'>
    //                         {orderedParticipants.slice(0, 3).map(participant => (
    //                             <OtherPlayer
    //                                 key={participant.socketId}
    //                                 player={{
    //                                     ...participant,
    //                                     ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
    //                                 }}
    //                                 isCurrentTurn={currentPlayerTurn === participant.socketId}
    //                                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
    //                             />
    //                         ))}
    //                     </div>
    //                     {orderedParticipants.length > 3 && (
    //                         <div className='flex flex-row-reverse justify-between  w-full'>
    //                             <OtherPlayer
    //                                 key={orderedParticipants[3].socketId}
    //                                 player={{
    //                                     ...orderedParticipants[3],
    //                                     ...otherPlayers.find(p => p.socketId === orderedParticipants[3].socketId) || {}
    //                                 }}
    //                                 isCurrentTurn={currentPlayerTurn === orderedParticipants[3].socketId}
    //                                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[3].socketId}
    //                             />
    //                             {orderedParticipants.length > 4 && (
    //                                 <OtherPlayer
    //                                     key={orderedParticipants[4].socketId}
    //                                     player={{
    //                                         ...orderedParticipants[4],
    //                                         ...otherPlayers.find(p => p.socketId === orderedParticipants[4].socketId) || {}
    //                                     }}
    //                                     isCurrentTurn={currentPlayerTurn === orderedParticipants[4].socketId}
    //                                     isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[4].socketId}
    //                                 />
    //                             )}
    //                         </div>
    //                     )}
    //                     {orderedParticipants.length > 5 && (
    //                         <div className='flex flex-row justify-between  w-full'>
    //                             {orderedParticipants.slice(5).map(participant => (
    //                                 <OtherPlayer
    //                                     key={participant.socketId}
    //                                     player={{
    //                                         ...participant,
    //                                         ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
    //                                     }}
    //                                     isCurrentTurn={currentPlayerTurn === participant.socketId}
    //                                     isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
    //                                 />
    //                             ))}
    //                         </div>
    //                     )}
    //                 </>
    //             )}
    //         </div>
    //         // <div className='w-full grid grid-cols-3 gap-4'>
    //         //     {orderedParticipants.length === 2 ? (
    //         //         <>
    //         //             <OtherPlayer
    //         //                 key={orderedParticipants[0].socketId}
    //         //                 player={{
    //         //                     ...orderedParticipants[0],
    //         //                     ...otherPlayers.find(p => p.socketId === orderedParticipants[0].socketId) || {}
    //         //                 }}
    //         //                 isCurrentTurn={currentPlayerTurn === orderedParticipants[0].socketId}
    //         //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[0].socketId}
    //         //             />
    //         //             <div></div> {/* Empty div for the second column */}
    //         //             <OtherPlayer
    //         //                 key={orderedParticipants[1].socketId}
    //         //                 player={{
    //         //                     ...orderedParticipants[1],
    //         //                     ...otherPlayers.find(p => p.socketId === orderedParticipants[1].socketId) || {}
    //         //                 }}
    //         //                 isCurrentTurn={currentPlayerTurn === orderedParticipants[1].socketId}
    //         //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[1].socketId}
    //         //             />
    //         //         </>
    //         //     ) : (
    //         //         orderedParticipants.slice(0, 3).map(participant => (
    //         //             <OtherPlayer
    //         //                 key={participant.socketId}
    //         //                 player={{
    //         //                     ...participant,
    //         //                     ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
    //         //                 }}
    //         //                 isCurrentTurn={currentPlayerTurn === participant.socketId}
    //         //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
    //         //             />
    //         //         ))
    //         //     )}
    //         //     {orderedParticipants.length > 3 && (
    //         //         <div className='col-span-3 flex justify-between'>
    //         //             <OtherPlayer
    //         //                 key={orderedParticipants[3].socketId}
    //         //                 player={{
    //         //                     ...orderedParticipants[3],
    //         //                     ...otherPlayers.find(p => p.socketId === orderedParticipants[3].socketId) || {}
    //         //                 }}
    //         //                 isCurrentTurn={currentPlayerTurn === orderedParticipants[3].socketId}
    //         //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[3].socketId}
    //         //             />
    //         //             {orderedParticipants.length > 4 && (
    //         //                 <>
    //         //                     <OtherPlayer
    //         //                         key={orderedParticipants[4].socketId}
    //         //                         player={{
    //         //                             ...orderedParticipants[4],
    //         //                             ...otherPlayers.find(p => p.socketId === orderedParticipants[4].socketId) || {}
    //         //                         }}
    //         //                         isCurrentTurn={currentPlayerTurn === orderedParticipants[4].socketId}
    //         //                         isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[4].socketId}
    //         //                     />
    //         //                     {orderedParticipants.length === 5 && <div></div>} {/* Empty div for the second column */}
    //         //                 </>
    //         //             )}
    //         //         </div>
    //         //     )}
    //         // </div>
    //     );
    // };

    const renderOtherPlayers = () => {
        const currentUserEmail = JSON.parse(localStorage.getItem('currentUser'))?.email;
        const otherParticipants = roomParticipants.filter(participant => participant.email !== currentUserEmail);
        const currentUserIndex = roomParticipants.findIndex(participant => participant.email === currentUserEmail);
        let orderedParticipants = roomParticipants.filter(participant => participant.email !== currentUserEmail);
        const lasaction = roomParticipants.playerAction
        // console.log("last action: " , playerAction);

        if (otherParticipants.length === 3) {
            orderedParticipants = [
                roomParticipants[(currentUserIndex + 2) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 1) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 3) % roomParticipants.length]
            ].filter(participant => participant.email !== currentUserEmail);
        } else if (otherParticipants.length === 2) {
            orderedParticipants = [
                roomParticipants[(currentUserIndex + 1) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 2) % roomParticipants.length]
            ].filter(participant => participant.email !== currentUserEmail);
            // console.log();
        } else if (otherParticipants.length === 4) {
            orderedParticipants = [
                roomParticipants[(currentUserIndex + 2) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 3) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 1) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 4) % roomParticipants.length]
            ].filter(participant => participant.email !== currentUserEmail);
        } else if (otherParticipants.length === 5) {
            orderedParticipants = [
                roomParticipants[(currentUserIndex + 3) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 2) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 4) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 1) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 5) % roomParticipants.length]
            ].filter(participant => participant.email !== currentUserEmail);
        } else if (otherParticipants.length === 6) {
            orderedParticipants = [
                roomParticipants[(currentUserIndex + 3) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 4) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 2) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 5) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 1) % roomParticipants.length],
                roomParticipants[(currentUserIndex + 6) % roomParticipants.length]
            ].filter(participant => participant.email !== currentUserEmail);
        }

        if (orderedParticipants.length === 0) {
            return <div>No other participants</div>;
        }

        const createPlayerDivs = () => {
            const divs = [];
            let index = 0;

            if (orderedParticipants.length === 2 || orderedParticipants.length === 4 || orderedParticipants.length === 6) {
                // Groups of two players
                while (index < orderedParticipants.length) {
                    divs.push(
                        <div key={index} className="flex justify-between w-full  h-[80px] lg:mb-0 mb-[13px] mt-[10px] ">
                            {orderedParticipants.slice(index, index + 2).map(participant => (
                                <OtherPlayer
                                    key={participant.socketId}
                                    player={{
                                        ...participant,
                                        ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
                                    }}
                                    isCurrentTurn={currentPlayerTurn === participant.socketId}
                                    isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
                                    lastAction={participant.action}


                                />
                            ))}
                        </div>
                    );
                    index += 2;
                }
            } else if (orderedParticipants.length === 3 || orderedParticipants.length === 5) {
                // Special case for single player in the first row
                divs.push(
                    <div key={index} className="flex justify-center w-full h-[111px] lg:mb-0  my-[0px]">
                        <OtherPlayer
                            className="lg:h-[20px] bg-red-50"
                            key={orderedParticipants[0].socketId}
                            player={{
                                ...orderedParticipants[0],
                                ...otherPlayers.find(p => p.socketId === orderedParticipants[0].socketId) || {}
                            }}
                            isCurrentTurn={currentPlayerTurn === orderedParticipants[0].socketId}
                            isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[0].socketId}
                        // lastAction={orderedParticipants.lastaction.action}



                        />
                    </div>
                );
                index += 1;
                // Remaining players in groups of two
                while (index < orderedParticipants.length) {
                    divs.push(
                        <div key={index} className="flex justify-between w-full lg:mb-0 mb-4">
                            {orderedParticipants.slice(index, index + 2).map(participant => (
                                <OtherPlayer
                                    key={participant.socketId}
                                    player={{
                                        ...participant,
                                        ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
                                    }}
                                    isCurrentTurn={currentPlayerTurn === participant.socketId}
                                    isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
                                // lastAction={participant.lastaction.action}


                                />
                            ))}
                        </div>
                    );
                    index += 2;
                }
            }

            return divs;
        };

        return <div className="w-full flex flex-col items-center">{createPlayerDivs()}</div>;
    };

    if (!gameStarted) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <p className='text-xl font-bold' >Players in room: {playerCount}</p>
                {playerAction && (
                    <div className="mb-4 p-2 bg-gray-700 rounded-lg">
                        {playerAction.action === "pass" ? (
                            <p>{playerAction.player} passed. Tokens on card: {playerAction.tokensOnCard}</p>
                        ) : (
                            <p>{playerAction.player} took card {playerAction.card}</p>
                        )}
                    </div>
                )}
                {waitingForStart ? (
                    <p className="text-xl font-semibold">Waiting for game to start...</p>
                ) : canStartGame ? (
                    <button
                        onClick={handleStartGame}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Start Game
                    </button>
                ) : (
                    <p className="text-xl font-semibold">
                        {playerCount < 3
                            ? `Need at least ${3 - playerCount} more player(s) to start`
                            : "Room is full. Cannot add more players."}
                    </p>
                )}
            </div>
        );
    }

    if (gameEnded && gameResults) {
        return <GameResults
            scores={gameResults.scores}
            totalPot={gameResults.totalPot}
            platformCommission={gameResults.platformCommission}
            potAfterCommission={gameResults.potAfterCommission}
            firstPlaceWinnings={gameResults.firstPlaceWinnings}
            secondPlaceWinnings={gameResults.secondPlaceWinnings}
            currentUser={currentUser}
            roomID={roomID}
            entryFee={entryFee}
            contestRoomMasterId={contestRoomMasterId}

        />;
    }

    return (
        // Parent div
        <div className="h-full w-full flex flex-col items-center gap-3 "
            style={{
                backgroundImage: `url(${Vertical2})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Other players in room Cards */}
            <div className='w-full  flex flex-row justify-between lg:h- h-[] lg:m-2  lg:p-0 p-2'>
                {renderOtherPlayers()}
            </div>

            {/* CurrentCards, TokensOnCards, PickedBy indicator */}
            <div className='w-full flex  flex-col justify-center items-center h-[233px]  mt-[-60px] mb-[-48px]  relative' >
                <div className='h-[34px]'   >
                    {pickedIndicator && lastCardTaker && lastCardTaker.socketId !== socket.id && (
                        <div className='bg-green-600 flex flex-col justify-center items-center ml-[0px] h-[30px] text-[10px] mb-1 p-2 rounded-lg' >
                            <h4 className="text-white font-normal">Picked by:</h4>
                            <p className="text-white font-extrabold">{lastCardTaker.name}</p>
                        </div>
                    )}
                </div>

                {/* card and tokens  */}
                <div className='flex flex-col items-center  h-34 relative'>
                    {delayedCurrentCard && (
                        <div className='relative'>
                            <div className="lg:w-20 w-[90px] lg:h-  bg-blue-600 text-gray-300 border-2 border-gray-300 rounded-lg shadow-md flex justify-center items-center">
                                <img
                                    src={ImageMap[delayedCurrentCard]}
                                    alt={`Card ${delayedCurrentCard}`}
                                    className=" w-full h-full  lg:h-full object-cover rounded-lg"
                                />
                            </div>
                            <div className='absolute top-1/2 left-full transform -translate-y-1/2 ml-2 flex items-center'>
                                <div className="relative w-24">
                                    <img
                                        className='w-9 h-9 mr-1'
                                        src={BallImg}
                                        alt="Ball"
                                    />
                                    <p
                                        className='absolute top-1 left-2 text-white text-base font-extrabold '
                                        onMouseEnter={() => setShowTokensOnCardTooltip(true)}
                                        onMouseLeave={() => setShowTokensOnCardTooltip(false)}
                                    >
                                        x{tokensOnCard}
                                    </p>
                                </div>
                                {showTokensOnCardTooltip && (
                                    <div
                                        ref={tokensOnCardTooltipRef}
                                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-[9px] lg:text-xs rounded shadow-lg whitespace-nowrap"
                                    >
                                        Tokens on card
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Card and TokensOnCard */}
            <div className='flex w-40  justify-center items-center h-[30px] p-0 mt-[42px] font-bold'>
                <div className='relative flex items-center'>
                    {remainingCards > 0 ? (
                        <img
                            src={Cardback}
                            alt="Card Back"
                            className='left-0 relative z-10 lg:w-[60px] lg:mt-[8px]  mt-[10px] w-[55px]  lg:h-[68px] object-cover'
                        />
                    ) : (
                        <div className='left-0 relative z-10 w-[34px] h-[48px] bg-blue-200 rounded-lg shadow-lg border-2 border-gray-400 mx-[10px]  '></div>
                    )}
                    <div
                        className='absolute left-12 z-10 flex items-center justify-center w-[46px] h-[46px] rounded-full overflow-hidden'
                        onMouseEnter={() => setShowRemainingCardsTooltip(true)}
                        onMouseLeave={() => setShowRemainingCardsTooltip(false)}
                    >
                        <span className='lg:text-xl z-20  ml-[-14px] font-extrabold text-blue-900 text-xl'>
                            x{remainingCards}
                            {/* {showRemainingCardsTooltip && (
                                <div
                                    ref={remainingCardsTooltipRef}
                                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap"
                                >
                                    Remaining cards in deck
                                </div>
                            )} */}
                        </span>
                    </div>
                </div>
            </div>

            {/* Timer, Pass and take button */}
            <div className='h-[87px] m-2  '>
                {isCurrentPlayer && delayedTimeLeft <= 15 && delayedCurrentCard === currentCard && (
                    <div className='w-full flex flex-col h-24 items-center gap-2'>
                        <div className="mb-2  w-full flex flex-col">
                            <div className="flex w-full justify-center items-center mb-1 text-black font-extrabold ">
                                <span  >Seconds Left {delayedTimeLeft}</span>
                            </div>
                            <div className="w-full bg-gray-600 border border-green-500 rounded-full h-2.5 overflow-hidden relative">
                                <div
                                    className={`h-full transition-all duration-1000 ease-linear  rounded-full ${delayedTimeLeft <= 5 ? 'bg-red-500' :
                                        delayedTimeLeft <= 10 ? 'bg-amber-500' :
                                            'bg-green-500'
                                        }`}
                                    style={{
                                        width: `${(delayedTimeLeft / 15) * 100}%`
                                    }}
                                ></div>

                            </div>
                        </div>
                        <div className='flex flex-row justify-center items-center gap-2 h-8'>
                            <button
                                style={{
                                    width: "90px",
                                    height: "45px",
                                    padding: "0",
                                    gap: "10.05px",
                                    borderRadius: "60px",
                                    borderTop: "0.5px solid",
                                    borderRight: "none",
                                    borderBottom: "none",
                                    borderLeft: "none",
                                    opacity: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onClick={handlePass}
                                disabled={tokens === 0 || !isCurrentPlayer || actionInProgress}
                                // disabled
                                className="bg-white hover:bg-gray-200 text-blue-800 font-extrabold rounded disabled:bg-gray-400"
                            >
                                <img className='h-5 p-0 m-[-6px]' src={BallImg} alt="" />
                                Pass
                            </button>
                            <button
                                style={{
                                    width: "80px",
                                    height: "45px",
                                    padding: "0",
                                    gap: "10.05px",
                                    borderRadius: "60px",
                                    borderTop: "0.5px solid",
                                    borderRight: "none",
                                    borderBottom: "none",
                                    borderLeft: "none",
                                    opacity: 1,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onClick={handleTake}
                                disabled={!isCurrentPlayer || actionInProgress}
                                className="bg-green-700 hover:bg-green-900 text-white font-bold rounded disabled:opacity-50"
                            >
                                Take
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Remaing Tokens and Card image */}
            <div className="flex justify-center items-center w-full space-x-4">
                {/* Cricket Ball Token Component */}
                <div
                    className="flex justify-center items-center lg:w-[90px] w-[80px] h-[35px] rounded-full relative bg-gradient-to-b from-[#1E4391] to-[#0B204F] p-2"
                    style={{
                        borderImageSource: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(153, 153, 153, 0.2) 100%)',
                        borderImageSlice: 1,
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <img src={BallImg} alt="Cricket Ball" className="lg:w-[20px] lg:h-[20px] h-5 w-5 rounded-full" />
                    <span className="text-white lg:text-base text-sm font-bold ml-2">
                        {tokens}
                    </span>
                </div>

                {/* Card with Points Component */}
                <div
                    className="flex justify-center items-center lg:w-[90px] w-[90px] h-[35px] rounded-full relative bg-gradient-to-b from-[#1E4391] to-[#0B204F] p-2"
                    style={{
                        borderImageSource: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(153, 153, 153, 0.2) 100%)',
                        borderImageSlice: 1,
                    }}
                    onMouseEnter={() => setShowScoreTooltip(true)}
                    onMouseLeave={() => setShowScoreTooltip(false)}
                >
                    <div className="relative  ">
                        <img src={Cardback} alt="Card" className="lg:w-[30px] lg:h-[38px] w-15 h-9 rounded-full" />
                        {/* <span className="absolute lg:bottom-[-6px] bottom-[-15px] lg:left-[-10px] left-[-9px] bg-blue-500 text-yellow-500 text-xs rounded-full w-7 h-7 flex items-center justify-center"
                            style={{
                                background: `linear-gradient(0deg, #111D61, #111D61), radial-gradient(37.5% 37.5% at 41.67% 41.67%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)
        `,
                                backgroundBlendMode: 'overlay, normal'
                            }}>
                            {takenCards.length}
                        </span> */}
                    </div>
                    <span className="text-white font-bold">
                        <span className="lg:text-[15px] text-base">{totalScore}</span>
                        <span className="lg:text-[10px] text-[8px]">pts</span>
                    </span>
                </div>
            </div>

            {/* Taken cards */}
            <div className='w-full flex flex-col justify-center items-center m-0'>
                <TakenCards cards={takenCards} tokens={tokens} />
            </div>
        </div>
    );
};

export default PlayerCard;