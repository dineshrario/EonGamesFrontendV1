import React from 'react';

const UserDetail = ({ tokens }) => {
  // Retrieve user details from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (!currentUser) {
    return <p>No user details available.</p>;
  }

  const { name: username } = currentUser;
  // console.log("These are the tokens", tokens);

  return (
    <div className="w-full h-16 rounded-lg mb-2 flex flex-col justify-center items-center ">
      {/* <h2 className="text-xl  font-bold mb-2">{username}</h2> */}
      <p className="text-lg font-extrabold text-purple-300">{tokens}</p>
    </div>
  );
};

export default UserDetail;