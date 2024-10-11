import React from 'react'
import { useLocation } from 'react-router-dom';

const RandomRoom = () => {
    const location = useLocation();
    const { roomId, name, email } = location.state || {};

    return (
        <div>
            <h2>Room ID: {roomId}</h2>
            <p>Name: {name}</p>
            <p>Email: {email}</p>
        </div>
    )
}

export default RandomRoom