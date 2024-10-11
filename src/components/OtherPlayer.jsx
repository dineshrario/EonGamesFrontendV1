import React, { useEffect, useState } from 'react';
import Cardback from '../img/CardBack.png'


const OtherPlayer = ({ player, isCurrentTurn, isInitialFirstPlayer, lastAction }) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserEmail = currentUser?.email;
    const [showAction, setShowAction] = useState(false);
    const [totalScore, setTotalScore] = useState(0);


    if (player.email === currentUserEmail) {
        return null;
    }
    const sortedCards = player.cards ? [...player.cards].sort((a, b) => a - b) : [];
    // console.log("this is the sorted cards:", sortedCards);

    const groupSequentialCards = (cards) => {
        if (cards.length === 0) return [];
        const groups = [];
        let currentGroup = [cards[0]];

        for (let i = 1; i < cards.length; i++) {
            if (cards[i] === cards[i - 1] + 1) {
                currentGroup.push(cards[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [cards[i]];
            }
        }
        groups.push(currentGroup);
        return groups;
    };

    const cardGroups = groupSequentialCards(sortedCards);

    useEffect(() => {
        // Calculate total score
        const newTotalScore = cardGroups.reduce((acc, group) => acc + Math.min(...group), 0);
        setTotalScore(newTotalScore);

        if (player.lastAction) {
            setShowAction(true);
            const timer = setTimeout(() => {
                setShowAction(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [player.lastAction, player.cards]);  // Recalculate when cards or lastAction changes


    return (
        <div className="lg:w-[310px] flex justify-center  items-start w-[160px] lg:m-2 lg:h-22 h-[80px] p-0 m-0 text-sm lg:text-base relative">
            <div className={`  lg:w-[209px] w-[150px] h-[] flex flex-col justify-center items-start   rounded-lg lg:p-0 ${isCurrentTurn
                ? ''
                : isInitialFirstPlayer
                    ? ' '
                    : ''}`}>
                <div className='h-[40px] w-full flex flex-row items-center justify-center' >
                    <p className={`text-center flex justify-center items-center  bg-BgName w-full font-bold rounded-lg lg:text-[14px] text-[12px] p-1   ${isCurrentTurn
                        ? 'shadow-[0_0_10px_9px_rgba(212,255,0,1)]'
                        : isInitialFirstPlayer
                            ? ' shadow-[0_0_12px_12px_rgba(212,255,0,1)]'
                            : ''}`}>
                        {player.name.split(' ')[0]}
                        <img src={Cardback} alt="Card" className="lg:w-[20px] lg:h-[25px] w-[18px] h-[20px] rounded-full m-0" />
                        {totalScore}
                        <p className=' lg:text-[8px]  text-[7px]' >
                            pts
                        </p>
                        {/* <p className='bg-blue-900  flex flex-row justify-center text-center mx-1 w-1/2 p-[1px] lg:p-[0px]   font-bold rounded-lg lg:text-[12px] text-[10px]' >

                        </p> */}
                    </p>

                </div>

                {showAction && player.lastAction && (
                    <div className="text-white p-1 font-bold  m-0 bg-BgName rounded-lg text-center text-sm">
                        {player.lastAction.action === 'pass' ? 'Passed' : ''}
                        {player.lastAction.action === 'take' ? 'Took a card' : ''}
                    </div>
                )}
                {player.cards && player.cards.length > 0 && (
                    <div className="p-1 flex flex-wrap w-full h-full justify-center items-center">
                        <div className="flex w-full h-[90px] flex-wrap justify-start m-1"> {/* Added a wrapper div for flex properties */}
                            {cardGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="flex flex-col items-center m-1"> {/* Stack cards in sequence */}
                                    {group.map((card, cardIndex) => {
                                        const isLowest = card === Math.min(...group);
                                        return (
                                            <span
                                                key={card}
                                                className={`flex items-center justify-center text-center mx-[-3px] p-1 lg:h-[25px] h-[23px] lg:w-[19px] w-[16px] border-[1px] flex-shrink-0 my-[-4px] lg:text-[10px] font-bold text-BgName text-[9px] ${isLowest ? 'bg-yellow-300' : ''}`} // Highlight if it's the lowest
                                                style={{
                                                    background: isLowest ? 'linear-gradient( #F0D4FF 0%, #FFFFFF 100%)' : 'linear-gradient(#FFFFFF 0%, #D3D3D3 100%)',
                                                    borderRadius: '2px',
                                                }}
                                            >
                                                {card}
                                            </span>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default OtherPlayer;
