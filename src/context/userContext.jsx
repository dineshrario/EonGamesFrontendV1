import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API } from '../api/Api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const savedUser = JSON.parse(localStorage.getItem('currentUser'));
      if (savedUser) {
        try {
          const response = await axios.post(`${API}/user/login`, {
            name: savedUser.name,
            email: savedUser.email,
          });
          if (response.status === 200) {
            setUser(response.data.data);
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      }
    };

    fetchUser();
  }, []);
  const register = async (name, email) => {
    try {
      const response = await axios.post(`${API}/user/register`, { name, email });


      if (response.status === 201) {
        const userData = response.data.data;
        // console.log("User registration", userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        const insertWalletLedger = await axios.post(`${API}/jersey/insert-wallet-ledger`,
          {
            userId:  userData.id ,
            transaction_source: 'joining_deposit',
            transaction_type: 'credit' ,
            amount : '2000'
          }
        )


        setUser(userData);
        setError('');
        return true;
      } else {
        setError('Registration failed');
        return false;
      }


    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      console.error('Registration error:', err);
      return false;
    }
  };
  const login = async (name, email) => {
    try {
      const response = await axios.post(`${API}/user/login`, { name, email });

      if (response.status === 200) {
        const userData = response.data.data;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);
        setError('');
        return true;
      } else {
        setError('Invalid credentials');
        return false;
      }
    } catch (err) {
      setError('An error occurred');
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    setUser(null);
  };

  const refreshUserDetails = async () => {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
      try {
        const response = await axios.post(`${API}/user/login`, {
          name: savedUser.name,
          email: savedUser.email,
        });
        if (response.status === 200) {
          const userData = response.data.data;
          localStorage.setItem('currentUser', JSON.stringify(userData));
          setUser(userData);
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      }
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
  };

  return (
    <UserContext.Provider value={{ user, register, setUser: updateUser, login, logout, refreshUserDetails, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
