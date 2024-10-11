import React, { useState, useEffect, useRef } from 'react';

const Timer = () => {
    const [time, setTime] = useState(10); // Initialize timer with 10 seconds
    const [isRunning, setIsRunning] = useState(false); // Timer status
    const [buttonEnabled, setButtonEnabled] = useState(true); // Button state
    const intervalRef = useRef(null); // Ref to store interval ID

    // Function to start the timer
    const startTimer = () => {
        if (isRunning) return; // Do nothing if timer is already running

        setIsRunning(true); // Set timer as running
        setButtonEnabled(false); // Disable the button

        intervalRef.current = setInterval(() => {
            setTime(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(intervalRef.current); // Stop timer when it reaches 0
                    setIsRunning(false);
                    setButtonEnabled(true); // Enable the button after timer completes
                    return 10; // Reset timer to 10 seconds
                }
                return prevTime - 1;
            });
        }, 1000); // Update every second
    };

    // Cleanup function to clear the interval if the component unmounts
    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <>
            <h1>Card Game</h1>
            <div>
                <h2>Timer: {time} seconds</h2>
                <button onClick={startTimer} disabled={isRunning || !buttonEnabled}>Start Timer</button>
            </div>
        </>
    );
};

export default Timer;
