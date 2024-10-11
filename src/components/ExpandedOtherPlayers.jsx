import React, { useState } from 'react';
import OtherPlayer from './OtherPlayer';

const ExpandedOtherPlayers = ({ players, currentPlayerTurn }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="bg-blue-500 text-white px-2 py-1 rounded mb-2"
            >
                {isExpanded ? 'Hide' : 'Show'} Other Players ({players.length})
            </button>
            {isExpanded && (
                <div className="absolute top-full left-0 z-10 bg-gray-800 p-2 rounded shadow-lg">
                    {players.map(player => (
                        <OtherPlayer
                            key={player.socketId}
                            player={player}
                            isCurrentTurn={currentPlayerTurn === player.socketId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpandedOtherPlayers;