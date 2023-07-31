// Importing necessary hooks and context from React
import { useContext } from 'react';
import { ChatContext } from '../contexts/ChatContext';

// This is a custom hook that wraps the useContext hook from React.
// It provides access to the ChatContext which contains chat messages.
const useChat = () => {
  // useContext is a hook that returns the context value.
  // In this case, the context value is an object that contains the "messages" state and its updater function "setMessages".
  return useContext(ChatContext);
};

export default useChat;

// Importing necessary hooks and context from React
import React, { createContext, useState } from 'react';

// Creating a Context object. When React renders a component that subscribes to this Context object,
// it will read the current context value from the closest matching Provider above it in the tree.
export const ChatContext = createContext();

// The ChatProvider component wraps its children with a context provider that allows them to access the "messages" state.
// Any child component can read or update the "messages" state if it's wrapped with this Provider.
export const ChatProvider = ({ children }) => {
  // "messages" state is initialized as an empty array. It's meant to hold chat messages.
  // setMessages is the updater function for the "messages" state.
  const [messages, setMessages] = useState([]);

  // The Provider component allows child components to subscribe to context changes.
  return (
    <ChatContext.Provider value={{ messages, setMessages }}>
      {/* children represents the inner content of this component. In other words, any elements/components between the opening and closing tags of this component. */}
      {children}
    </ChatContext.Provider>
  );
};
