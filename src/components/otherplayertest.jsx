    const renderOtherPlayers = () => {
        const currentUserEmail = JSON.parse(localStorage.getItem('currentUser'))?.email;
        const otherParticipants = roomParticipants.filter(participant => participant.email !== currentUserEmail);

        // Find the index of the initialFirstPlayer
        const initialFirstPlayerIndex = otherParticipants.findIndex(participant => participant.socketId === initialFirstPlayer?.socketId);

        // If initialFirstPlayerIndex is -1, set it to 0 to avoid errors
        const validIndex = initialFirstPlayerIndex === -1 ? 0 : initialFirstPlayerIndex;

        const currentUserIndex = roomParticipants.findIndex(participant => participant.email === currentUserEmail);
        let orderedParticipants = []
        // Rearrange the participants to start with the next player after the current user


        if (roomParticipants.length < 6) {

            orderedParticipants = [
                ...roomParticipants.slice(currentUserIndex + 1), // Next players
                ...roomParticipants.slice(0, currentUserIndex + 1) // Previous players including current user
            ];

        }
        else if (roomParticipants.length === 6) {
            orderedParticipants = [
                ...roomParticipants.slice((currentUserIndex + 2) % roomParticipants.length),
                ...roomParticipants.slice(0, (currentUserIndex + 2) % roomParticipants.length)
            ];


        }

        orderedParticipants = orderedParticipants.filter(participant => participant.email !== currentUserEmail);
        // console.log(orderedParticipants);

        // Rearrange the participants to start with the initialFirstPlayer and go clockwise
        // const orderedParticipants = [
        //     ...otherParticipants.slice(validIndex),
        //     ...otherParticipants.slice(0, validIndex)
        // ];

        if (orderedParticipants.length === 0) {
            return null; // or return some placeholder UI
        }

        return (
            <div className='w-full flex flex-row flex-wrap gap-4'>
                {orderedParticipants.length === 3 ? (
                    <div className='flex justify-between w-full'>
                        {orderedParticipants.map(participant => (
                            <OtherPlayer
                                className="w-1/3"
                                key={participant.socketId}
                                player={{
                                    ...participant,
                                    ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
                                }}
                                isCurrentTurn={currentPlayerTurn === participant.socketId}
                                isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className='flex justify-between  w-full'>
                            {orderedParticipants.slice(0, 3).map(participant => (
                                <OtherPlayer
                                    key={participant.socketId}
                                    player={{
                                        ...participant,
                                        ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
                                    }}
                                    isCurrentTurn={currentPlayerTurn === participant.socketId}
                                    isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
                                />
                            ))}
                        </div>
                        {orderedParticipants.length > 3 && (
                            <div className='flex flex-row-reverse justify-between  w-full'>
                                <OtherPlayer
                                    key={orderedParticipants[3].socketId}
                                    player={{
                                        ...orderedParticipants[3],
                                        ...otherPlayers.find(p => p.socketId === orderedParticipants[3].socketId) || {}
                                    }}
                                    isCurrentTurn={currentPlayerTurn === orderedParticipants[3].socketId}
                                    isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[3].socketId}
                                />
                                {orderedParticipants.length > 4 && (
                                    <OtherPlayer
                                        key={orderedParticipants[4].socketId}
                                        player={{
                                            ...orderedParticipants[4],
                                            ...otherPlayers.find(p => p.socketId === orderedParticipants[4].socketId) || {}
                                        }}
                                        isCurrentTurn={currentPlayerTurn === orderedParticipants[4].socketId}
                                        isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[4].socketId}
                                    />
                                )}
                            </div>
                        )}
                        {orderedParticipants.length > 5 && (
                            <div className='flex flex-row justify-between  w-full'>
                                {orderedParticipants.slice(5).map(participant => (
                                    <OtherPlayer
                                        key={participant.socketId}
                                        player={{
                                            ...participant,
                                            ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
                                        }}
                                        isCurrentTurn={currentPlayerTurn === participant.socketId}
                                        isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            // <div className='w-full grid grid-cols-3 gap-4'>
            //     {orderedParticipants.length === 2 ? (
            //         <>
            //             <OtherPlayer
            //                 key={orderedParticipants[0].socketId}
            //                 player={{
            //                     ...orderedParticipants[0],
            //                     ...otherPlayers.find(p => p.socketId === orderedParticipants[0].socketId) || {}
            //                 }}
            //                 isCurrentTurn={currentPlayerTurn === orderedParticipants[0].socketId}
            //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[0].socketId}
            //             />
            //             <div></div> {/* Empty div for the second column */}
            //             <OtherPlayer
            //                 key={orderedParticipants[1].socketId}
            //                 player={{
            //                     ...orderedParticipants[1],
            //                     ...otherPlayers.find(p => p.socketId === orderedParticipants[1].socketId) || {}
            //                 }}
            //                 isCurrentTurn={currentPlayerTurn === orderedParticipants[1].socketId}
            //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[1].socketId}
            //             />
            //         </>
            //     ) : (
            //         orderedParticipants.slice(0, 3).map(participant => (
            //             <OtherPlayer
            //                 key={participant.socketId}
            //                 player={{
            //                     ...participant,
            //                     ...otherPlayers.find(p => p.socketId === participant.socketId) || {}
            //                 }}
            //                 isCurrentTurn={currentPlayerTurn === participant.socketId}
            //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === participant.socketId}
            //             />
            //         ))
            //     )}
            //     {orderedParticipants.length > 3 && (
            //         <div className='col-span-3 flex justify-between'>
            //             <OtherPlayer
            //                 key={orderedParticipants[3].socketId}
            //                 player={{
            //                     ...orderedParticipants[3],
            //                     ...otherPlayers.find(p => p.socketId === orderedParticipants[3].socketId) || {}
            //                 }}
            //                 isCurrentTurn={currentPlayerTurn === orderedParticipants[3].socketId}
            //                 isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[3].socketId}
            //             />
            //             {orderedParticipants.length > 4 && (
            //                 <>
            //                     <OtherPlayer
            //                         key={orderedParticipants[4].socketId}
            //                         player={{
            //                             ...orderedParticipants[4],
            //                             ...otherPlayers.find(p => p.socketId === orderedParticipants[4].socketId) || {}
            //                         }}
            //                         isCurrentTurn={currentPlayerTurn === orderedParticipants[4].socketId}
            //                         isInitialFirstPlayer={!firstTurnPassed && initialFirstPlayer && initialFirstPlayer.socketId === orderedParticipants[4].socketId}
            //                     />
            //                     {orderedParticipants.length === 5 && <div></div>} {/* Empty div for the second column */}
            //                 </>
            //             )}
            //         </div>
            //     )}
            // </div>
        );
    };
