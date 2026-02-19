import api from './api';

//list all rooms that Therapist owns
export const getTherapistRoom = async() => {
    const res = await api.get("/api/room");
    return res.data;
};

//client gets their room
export const getMyRoom = async() => {
    const res = await api.get("/api/room/my");
    return res.data;
};

//get journal entries for a room
export const getJournal = async(roomId) => {
    if(!roomId) throw new Error("roomId is required");
    const res = await api.get(`/api/room/${roomId}/journal`);
    return res.data;
};

//add journal entry
export const addJournal = async(roomId, content) => {
    if(!roomId) throw new Error("roomId is required");
    if (!content || !content.trim()) throw new Error("content is required");

    const res = await api.post(`/api/room/${roomId}/journal`, {
        content: content.trim(),
    });

    return res.data;
};

//therapist creates room with client
export const createRoom = async(clientId) => {
    if(!clientId) throw new Error("clientId is required");
    const res = await api.post("/api/room", { clientId });
    return res.data;
};