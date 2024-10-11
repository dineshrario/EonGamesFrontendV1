import Lobby from '../components/Lobby';
import { useNavigate } from 'react-router-dom';
import TableToJoin from './TableToJoin';
import Navbar from '../components/Navbar';

const Jursy = () => {


  return (
    <div className='lg:w-full lg:h-full  bg-gray-900 flex flex-col justify-center items-center'>
      <div className='lg:w-full' >
        <Navbar />
      </div>
      <h1 className='text-gray-20 flex flex-col justify-start' >Jersey Sure</h1>
      {/* <Lobby /> */}
      <TableToJoin />
    </div>
  );
};

export default Jursy;
