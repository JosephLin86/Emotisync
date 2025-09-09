import { useState } from 'react'
import { AuthProvider } from './context/AuthContext';

function App() {

  return (
    <div>
      <h1>hello</h1>
      <AuthProvider>
        <h1>EmotiSync</h1>
      </AuthProvider>
    </div>
  );
}

export default App;