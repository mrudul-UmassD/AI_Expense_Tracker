'use client';

import { useEffect } from 'react';
import { initializeStorage } from '../utils/storage';
import Dashboard from '../components/Dashboard';

export default function Home() {
  // Initialize local storage on component mount
  useEffect(() => {
    initializeStorage();
  }, []);

  return <Dashboard />;
} 