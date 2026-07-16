import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-white flex flex-col bg-[#050505]">
        {/* Subtle indigo ambient light for Obsidian Theme */}
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/5 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] right-[-20%] w-[50vw] h-[50vw] bg-indigo-400/5 rounded-full blur-[120px]" />
        </div>

        <Navbar />
        <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin/orderlist" element={<AdminDashboardPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer position="bottom-right" theme="dark" toastStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#e5e5e5', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }} />
    </Router>
  );
}

export default App;
