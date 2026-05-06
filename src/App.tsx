/**
 * @license MIT
 * Copyright (c) 2026 Ahmed Sulaiman
 *
 * Root app + routes.
 */
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Signup from './routes/Signup';
import Login from './routes/Login';
import Welcome from './routes/Welcome';
import Dashboard from './routes/Dashboard';
import ProductsNew from './routes/ProductsNew';
import ProductsCreated from './routes/ProductsCreated';
import ProductsContentPlaceholder from './routes/ProductsContentPlaceholder';
import ProductsList from './routes/ProductsList';
import ProductDetail from './routes/ProductDetail';
import DemoReset from './routes/DemoReset';
import { getUserId, verifySession } from './lib/auth';

/** Root: async session check → dashboard or login */
function Root(): JSX.Element {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getUserId()) {
      navigate('/login', { replace: true });
      setChecking(false);
      return;
    }
    verifySession().then((user) => {
      navigate(user ? '/dashboard' : '/login', { replace: true });
      setChecking(false);
    });
  }, [navigate]);

  if (checking) return <div className="min-h-screen bg-bg-page" />;
  return <Navigate to="/login" replace />;
}

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductsList />} />
      <Route path="/products/new" element={<ProductsNew />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/products/:id/created" element={<ProductsCreated />} />
      <Route path="/products/:id/content" element={<ProductsContentPlaceholder />} />
      <Route path="/demo-reset" element={<DemoReset />} />
    </Routes>
  );
}
