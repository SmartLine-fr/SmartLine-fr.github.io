import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import SplashScreen from './screens/SplashScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen('auth');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = (role) => {
    setUserRole(role);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentScreen('auth');
  };

  return (
    <PaperProvider>
      <StatusBar style="light" />
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'auth' && <AuthScreen onAuth={handleAuth} />}
      {currentScreen === 'home' && (
        <HomeScreen userRole={userRole} onLogout={handleLogout} />
      )}
    </PaperProvider>
  );
}