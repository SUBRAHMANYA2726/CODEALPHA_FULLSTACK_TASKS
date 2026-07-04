import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WishlistPage from './pages/WishlistPage';

const AuroraBg = () => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Generate random particles
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      width: `${Math.random() * 4 + 1}px`,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `-${Math.random() * 20}s`
    }));
    setParticles(p);
  }, []);

  return (
    <div className="aurora-bg">
      <div className="aurora-orb orb-1"></div>
      <div className="aurora-orb orb-2"></div>
      <div className="aurora-orb orb-3"></div>
      {particles.map(p => (
        <div key={p.id} className="particle" style={{
          left: p.left,
          width: p.width,
          height: p.width,
          animationDuration: p.animationDuration,
          animationDelay: p.animationDelay
        }} />
      ))}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen text-slate-200 selection:bg-blue-500/30 selection:text-white" style={{ display: 'flex', flexDirection: 'column' }}>
        <AuroraBg />
        <Navbar />
        <main style={{ flex: 1, zIndex: 10, position: 'relative' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<HomePage />} />
            <Route path="/search/:keyword" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderSuccessPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          background: '#0F172A',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '12px',
          color: '#E2E8F0'
        }}
      />
    </Router>
  );
}

export default App;
