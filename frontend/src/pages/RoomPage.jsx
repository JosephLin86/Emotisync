import { useParams } from "react-router-dom";

export default function RoomPage() {
    const { roomID } = useParams();
    return <div>Room {roomID} coming soon</div>
}