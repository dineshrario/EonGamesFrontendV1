import {createContext, useContext, useEffect, useMemo, userContext} from 'react';
import { io } from 'socket.io-client'; 
import { API } from '../api/Api';

const SocketContext = createContext(null)

export const useSocket = ()=>{
    const socket = useContext(SocketContext)
    return socket;
}

export const SocketProvider = (props)=>{
    const socket = useMemo(()=>io(`${API}`), [])

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}