// Importing necessary libraries and hooks from React
import { createContext, useState } from 'react';

// Create a context for Rooms
// This context will be used to share rooms state across different components
export const RoomsContext = createContext();

// Create a context provider component
// This component will wrap other components and provide them access to the rooms state
export const RoomsProvider = ({ children }) => {

  // Define a state variable for rooms with its setter function
  // Initial value of rooms is an empty array
  const [rooms, setRooms] = useState([]);

  // The provider component returns a RoomsContext.Provider component
  // The value prop of the provider is an object with the rooms state and its setter function
  // This makes the rooms state and the function to update it available to all child components
  // The children prop is used to render the child components that this provider will wrap
  return (
    <RoomsContext.Provider value={{ rooms, setRooms }}>
      {children}
    </RoomsContext.Provider>
  );
};
