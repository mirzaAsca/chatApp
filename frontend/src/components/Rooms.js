import { Routes, Route} from "react-router-dom";
import RoomList from "./RoomList";
import CreateRoom from "./CreateRoom";
import ProtectedChatRoom from "./ProtectedChatRoom";
function Rooms({ user }) {
    return (
      <>
        <RoomList user={user} />
        <CreateRoom user={user} />
        <Routes>
          <Route path=":roomId" element={<ProtectedChatRoom />} />
        </Routes>
      </>
    );
  }
  export default Rooms;