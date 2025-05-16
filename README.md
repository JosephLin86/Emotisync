# EmotiSync

A real-time collaborative journaling platform for therapists and clients to reflect, share, and grow emotionally together.

## Features

- Real-time collaborative journaling
- Role-based access (therapist/client)
- Weekly reflection prompts
- Emotional tagging and mood tracking
- Secure authentication (JWT, bcrypt)
- Clean, responsive UI

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

| Method | Endpoint           | Description                |
|--------|--------------------|----------------------------|
| POST   | /api/auth/register | Register a new user        |
| POST   | /api/auth/login    | Login and get JWT token    |
| GET    | /api/journal       | Get journal entries        |
| POST   | /api/journal       | Create a new journal entry |

## Screenshots

![Dashboard Screenshot](screenshots/dashboard.png)

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

[MIT](LICENSE)