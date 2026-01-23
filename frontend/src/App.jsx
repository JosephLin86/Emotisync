import { useState } from 'react'
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>yummer</h1>
        <Login />
      </div>
    </AuthProvider>
  );
}

export default App;