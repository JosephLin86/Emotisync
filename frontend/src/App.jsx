import { useState } from 'react'
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>yummer</h1>
        <Login />
        <Register />
      </div>
    </AuthProvider>
  );
}

export default App;