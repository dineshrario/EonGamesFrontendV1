import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/userContext'; // Adjust the import path
import { API } from '../api/Api';

const AddMoney = () => {
    const { user, refreshUserDetails } = useUser();
    const [amount, setAmount] = useState('');
    // console.log("user id of user", user.id);
    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    };

    const handlePredefinedAmountClick = (value) => {
        setAmount(value);
    };

    const handleAddMoney = async () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            // console.log('User detail while adding momey to twallet:', user);
            const insertWalletLedger = await axios.post(`${API}/jersey/insert-wallet-ledger`,
                {
                  userId:  user.id ,
                  transaction_source: 'deposit',
                  transaction_type: 'credit' ,
                  amount : Number(amount)
                }
              )

            const response = await axios.patch(`${API}/user/update-wallet`, {
                email: user.email,
                amount: Number(amount),

            });
            
            // console.log('Response of adding money:', response.data);
            

            if (response.status === 200) {
                alert('Money added successfully');
                await refreshUserDetails(); 
            } else {
                alert('Failed to add money');
            }
        } catch (error) {
            console.error('Error adding money:', error);
            alert('An error occurred while adding money');
        }
    };

    return (
        <div className='flex flex-col justify-center items-center m-3' >
            <div className='m-4 font-bold text-gray-300 flex flex-col items-start' >
                <p>Wallet Balance: ₹{user?.wallet_balance.toFixed(2)}</p>
                <p>Current Balance: ₹{user?.current_wallet_balance.toFixed(2)}</p>
            </div>
            {/* <input
                className='rounded-xl w-1/3 p-3 bg-gray-800 text-gray-200 placeholder-white'
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Add amount"
            />
            <div className='m-5' >
                <button className='m-3 bg-blue-500  text-white' onClick={() => handlePredefinedAmountClick('100')}>Add ₹100</button>
                <button className='m-3 bg-blue-500  text-white' onClick={() => handlePredefinedAmountClick('200')}>Add ₹200</button>
                <button className='m-3 bg-blue-500  text-white' onClick={() => handlePredefinedAmountClick('300')}>Add ₹300</button>
            </div>
            <button className='bg-blue-500 ' onClick={handleAddMoney}>Add Money</button> */}
        </div>
    );
};

export default AddMoney;
