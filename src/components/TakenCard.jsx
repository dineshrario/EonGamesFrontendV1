import React from 'react';
import { ImageMap } from '../json/imagemap';

const TakenCards = ({ cards, tokens }) => {
    if (!cards || cards.length === 0) {
        return <div className="mt-4 text-xs text-white bg-blue-950 p-2 rounded-lg font-bold">No cards taken yet</div>;
    }

    const sortedCards = [...cards].sort((a, b) => a - b);
    // console.log("Sorting cards", sortedCards);
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

    const calculateScore = (seq) => seq.length > 1 ? seq[0] : seq.reduce((a, b) => a + b, 0);
    // console.log("this is the final card sequence:", calculateScore);

    return (
        <div className=" h-full">
            <div className="flex flex-row">
                {sequences.map((sequence, index) => (
                    <div key={index} className="flex flex-col items-center m-1">
                        {sequence.map((card, cardIndex) => (
                            <div
                                key={cardIndex}
                                className={`w-10 h-14 my-3 bg-blue-500 border border-blue-400 rounded flex items-center justify-center text-sm font-bold ${cardIndex > 0 ? '-mt-8' : ''}`}
                            >
                                {card}
                            </div>
                        ))}
                        {/* <div className=" text-sm font-semibold">
                             {calculateScore(sequence)}
                        </div> */}
                    </div>
                ))}
            </div>
            {/* <div className="text-lg h-10 text-white bg-blue-950 p-2 border-2 rounded-lg font-bold flex flex-row justify-center items-center w-full">
                Total Score : {sequences.reduce((total, seq) => total + calculateScore(seq), 0) - tokens}
            </div> */}
        </div>
    );
};

export default TakenCards