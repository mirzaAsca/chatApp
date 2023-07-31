// Importing the necessary dependencies
import { useContext } from "react"; // React's useContext hook is used for accessing the context
import { ChatContext } from "../contexts/ChatContext"; // Importing ChatContext to use it in our custom hook

// A custom hook called useChat that uses the useContext hook to access the ChatContext
const useChat = () => {
  return useContext(ChatContext); // Using useContext to access the ChatContext and returning it
};

export default useChat; // Exporting the useChat custom hook for use in other components
