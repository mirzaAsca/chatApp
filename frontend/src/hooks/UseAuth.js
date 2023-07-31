// Importing the necessary libraries and modules
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// UseAuth is a custom hook that enables any component in our application 
// to access the authentication context. This is useful for determining 
// if a user is authenticated, obtaining the current user's information, etc.
const UseAuth = () => {
  // useContext is a React hook that allows you to access context data. 
  // Here we are using it to access the data in AuthContext.
  return useContext(AuthContext);
};

// Exporting the UseAuth hook so it can be used in other parts of the application.
export default UseAuth;
