# EmotiSync  

A real-time collaborative journaling and therapy platform that empowers therapists and clients to reflect, share, and grow emotionally together.  

## Features  

- 🔑 **Role-based access** (therapist / client)  
- 📓 **Room-based journaling** (each client-therapist pair has a private “room”)  
- 💬 **Real-time messaging & session recaps**  
- 📝 **Shared journals** (client → therapist) & **private therapist notes**  
- 📊 **Weekly reflection prompts & emotional tagging with mood tracking**  
- 🔒 **Secure authentication** with JWT + bcrypt  
- ⚡ **Responsive UI** (React + Tailwind, Socket.io for realtime updates)  

### Planned / To Add  
- Graph of **emotional tagging history**  
- Dashboard views with **analytics & progress insights**  
- File sharing inside rooms  

## Tech Stack  

- **Frontend:** React, Tailwind CSS, Socket.io-client  
- **Backend:** Node.js, Express, MongoDB, Socket.io, JWT, bcrypt  

## Getting Started  

1. Clone the repo:  
   ```sh
   git clone https://github.com/yourusername/emotisync.git
   ```  

2. Install backend dependencies:  
   ```sh
   cd emotisync/server
   npm install
   ```  

3. Install frontend dependencies:  
   ```sh
   cd ../client
   npm install
   ```  

4. Set up environment variables (see `.env.example`).  

5. Run the backend:  
   ```sh
   npm run dev
   ```  

6. Run the frontend:  
   ```sh
   npm start
   ```  

## API Endpoints  

| Method | Endpoint                | Description                                |
|--------|--------------------------|--------------------------------------------|
| POST   | /api/auth/register       | Register a new user                        |
| POST   | /api/auth/login          | Login and get JWT token                    |
| POST   | /api/rooms               | Create a new therapy room                  |
| GET    | /api/rooms/:id           | Get room details                           |
| GET    | /api/rooms/:id/journal   | Get all journal entries in a room          |
| POST   | /api/rooms/:id/journal   | Create a new journal entry (shared)        |
| GET    | /api/rooms/:id/notes     | Get therapist’s private notes (therapist)  |
| POST   | /api/rooms/:id/notes     | Add a private therapist note               |
| GET    | /api/rooms/:id/checkins  | Get client check-ins                       |
| POST   | /api/rooms/:id/checkins  | Create a new check-in                      |

## Screenshots  

![Dashboard Screenshot](screenshots/dashboard.png)  

## Contributing  

Pull requests are welcome! For major changes, please open an issue first.  

## License  

[MIT](LICENSE)  
