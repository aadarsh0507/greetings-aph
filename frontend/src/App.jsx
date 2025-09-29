import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthApp from './components/AuthApp';

function App() {
  return (
    <AuthProvider>
      <AuthApp />
    </AuthProvider>
  );
}

export default App;