import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import Login from './page/Login';
import PlayGround from './page/PlayGround';
import GameList from './page/GameList';
import Contest from './components/Contest';
import GroupList from './page/GroupList';
import CardGame from './components/CardGame';
import DoneGame from './components/DoneGame';
import Profile from './components/Profile';
import GameStats from './components/GameStats'
import Jursy from './page/Jursy';
import ChooseGame from './page/ChooseGame';
import RandomRoom from './components/RandomRoom';
import PlayWithCode from './components/PlayWithCode';
import Lobby from './components/Lobby';
import RoomPage from './components/Room';
import TableToJoin from './page/TableToJoin';
import PlayerCard from './components/PlayerCard';
import GameResults from './components/GameResults';
import Registration from './page/Registration';
import GameResultsTest from './components/GameResultTest';

const App = () => (
  <UserProvider>
    <div className='w-screen lg:h-screen h-full  flex flex-row justify-center items-center bg-gray-900'>
      <Router>
        <Routes>
          <Route path="/game-result-test" element={<GameResultsTest />} />
          <Route path="/" element={<Login />} />
          <Route path='/register' element={<Registration />} />
          <Route path="/playground" element={<PlayGround />} />
          <Route path='/gamelist' element={<GameList />} />
          {/* <Route path="/contest/:gameId" element={<Contest />} /> */}
          <Route path='/groupList' element={<GroupList />} />
          <Route path='/cardgame' element={<CardGame />} />
          <Route path='donegame' element={<DoneGame />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gameStats" element={<GameStats />} />
          <Route path="/jersey-game" element={<Jursy />} />
          <Route path='/choosegame' element={<ChooseGame />} />
          <Route path='/randomgame' element={<RandomRoom />} />
          <Route path='/playfriend' element={<PlayWithCode />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/tabletojoin" element={<TableToJoin />} />
          <Route path='/playcard' element={<PlayerCard />} />
          <Route path="/gameresults/:roomID" element={<GameResults />} />
        </Routes>
      </Router>
    </div>
  </UserProvider>
);

export default App;
