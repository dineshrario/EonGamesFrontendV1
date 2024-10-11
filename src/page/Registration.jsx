import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import { API } from '../api/Api';
import axios from 'axios';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';


const Registration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { register, error } = useUser();
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();
    const success = await register(name, email);
    if (success) {
      navigate('/choosegame');
    }

  };

  useEffect(() => {
    if (localStorage.getItem('currentUser')) {
      navigate('/choosegame');
    }
  })

  const singUnOAuth = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(
    () => {
      if (user) {
        const response = axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json'
          }
        })
          .then((res) => {
            setProfile(res.data);
            localStorage.setItem('userProfile', JSON.stringify(res.data));
            // console.log("this data ", res.data);

            register(res.data.name, res.data.email);
            // Save profile to localStorage
          })
          .catch((err) => console.log(err));

      }
    }, [user]);


  return (
    <div className="w-full h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {/* <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Register
          </button>
        </form> */}
        <button onClick={singUnOAuth} className='w-full bg-white text-black py-2 px-4 rounded-md font-semibold hover:bg-gray-200 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 my-2'  >Sign up with Google </button>
        <p className="mt-4 text-center text-gray-400">
          Already have an account?{' '}
          <a href="/" className="text-blue-500 hover:text-blue-400">
            Login
          </a>
        </p>


      </div>
    </div>
  );
};

export default Registration;