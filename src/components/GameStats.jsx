import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../api/Api';

const GameStats = () => {
  const [results, setResults] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const currentUserId = currentUser?.id;

  console.log('Current User:', currentUser); // Debugging log
  console.log('Current User ID:', currentUserId); // Debugging log

  // Fetch the games data from local storage
  const gamesData = JSON.parse(localStorage.getItem('games')) || [];

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/game/result-card`);
        console.log('API response:', response.data);
        
        const allResults = response.data.data;
        console.log('All results:', allResults);
        
        const userResults = allResults.filter(result => result.user_id === currentUserId);
        console.log('Filtered user results:', userResults);

        setResults(userResults);
        setTotalGames(userResults.length);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to fetch game stats');
        setLoading(false);
      }
    };

    fetchResults();
  }, [currentUserId]);

  const getGameNameById = (gameId) => {
    const game = gamesData.find(g => g.GameId === gameId);
    return game ? game.Game : `Game ID: ${gameId}`;
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (results.length === 0) return <div className="flex justify-center items-center h-screen text-gray-500">No game stats available</div>;

  return (
    <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Game Leaderboard</h1>
        <h2 className="text-xl font-semibold mb-4 text-center">Total Games Played: {totalGames}</h2>

        <ul className="space-y-4">
          {results.map((result, index) => (
            <li 
              key={index} 
              className={`p-4 rounded-lg shadow-md ${result.user_id === currentUserId ? 'bg-blue-700' : 'bg-gray-700'}`}
            >
              <h3 className="font-extrabold text-lg mb-2">
                {getGameNameById(result.game_id)} {result.user_id === currentUserId && <span className="text-sm text-yellow-300"> (You) </span>}
              </h3>
              <p>Position: {result.user_position}</p>
              <p>Total Fantasy Points: {result.total_fantasy_points}</p>
              <p>Total Bid Amount: ₹{result.total_bid_amount?.toFixed(2) || '0.00'}</p>
              <p>Total Winnings: ₹{result.winnings?.toFixed(2) || '0.00'}</p>
              <p>Players Won: {result.players_won}</p>
              {result.platform_commission && (
                <p>Platform Commission: ${result.platform_commission.toFixed(2)}</p>
              )}
              {result.pot_after_commission && (
                <p>Pot After Commission: ${result.pot_after_commission.toFixed(2)}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GameStats;