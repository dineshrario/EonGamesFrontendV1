import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/userContext';
import Button from '../components/Button';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';


const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login, error } = useUser();
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(name, email);
    if (success) {
      navigate('/choosegame');
    }
  };
  // console.log("this is user profile", profile);
  // console.log("this is user profile", user);

  // const responseMessage = (response) => {
  //   console.log(response);
  // };
  // const errorMessage = (error) => {
  //   console.log(error);
  // };
  useEffect(() => {
    if (localStorage.getItem('currentUser')) {
      navigate('/choosegame');
    }
  })

  const loginOAuth = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Login Failed:', error)
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

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

            login(res.data.name, res.data.email);
            // Save profile to localStorage
          })
          .catch((err) => console.log(err));

      }
    }, [user]);

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
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
            Login
          </button>

          <div>


          </div>
        </form> */}
        <button className='w-full bg-white text-black py-2 px-4 rounded-md font-semibold hover:bg-gray-200 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 my-0' onClick={loginOAuth}>Sign in with Google  </button>
        <div className='mt-4 text-center text-gray-400' >
          <p className='text-gray-400' >Don't have an account? {" "}
            <Link className="text-blue-500 hover:text-blue-400" to='/register' >Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


{/* <a href="http://localhost:3400/user/auth/google" className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-center block">
              Login with Google
            </a> */}
{/* <GoogleLogin onSuccess={responseMessage} onError={errorMessage} /> */ }