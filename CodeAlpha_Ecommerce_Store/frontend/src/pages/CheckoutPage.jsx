import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveShippingAddress, savePaymentMethod, clearCartItems } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import { MapPin, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { shippingAddress, paymentMethod, cartItems } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');
  const [payment, setPayment] = useState(paymentMethod || 'PayPal');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Shipping', icon: MapPin },
    { title: 'Payment', icon: CreditCard },
    { title: 'Review', icon: CheckCircle2 }
  ];

  const handleNext = () => {
    if (step === 0) {
      if (!address || !city || !postalCode || !country) {
        toast.error('Please fill in all shipping fields');
        return;
      }
      dispatch(saveShippingAddress({ address, city, postalCode, country }));
    } else if (step === 1) {
      dispatch(savePaymentMethod(payment));
    }
    setStep(s => Math.min(2, s + 1));
  };

  const placeOrderHandler = async () => {
    try {
      setIsLoading(true);
      const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      }, config);
      
      dispatch(clearCartItems());
      navigate(`/order/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between relative mb-12 max-w-3xl mx-auto">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#171717] rounded-full" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
          style={{ width: `${(step / 2) * 100}%` }}
        />
        
        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${i <= step ? 'bg-indigo-600 text-white border border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-[#0a0a0a] border border-white/5 text-slate-500'}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`absolute -bottom-8 text-xs font-bold uppercase tracking-widest ${i <= step ? 'text-indigo-400' : 'text-slate-600'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      <div className="mt-16">
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0a0a] rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl font-bold text-slate-100 mb-8">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-400 mb-2">Street Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Postal Code</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-400 mb-2">Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={handleNext} className="group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/50">
                <span>Continue to Payment</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0a0a] rounded-[2rem] p-8 md:p-12 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl font-bold text-slate-100 mb-8">Payment Method</h2>
            <div className="space-y-4">
              {['PayPal', 'Stripe', 'Crypto'].map(method => (
                <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${payment === method ? 'border-indigo-500 bg-indigo-600/10' : 'border-white/10 bg-[#050505] hover:border-white/20'}`}>
                  <input type="radio" value={method} checked={payment === method} onChange={(e) => setPayment(e.target.value)} className="accent-indigo-500" />
                  <span className="text-white font-medium">{method}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(0)} className="px-8 py-3 rounded-xl font-bold text-slate-400 bg-[#050505] border border-white/10 hover:bg-[#171717] hover:text-white transition-all">Back</button>
              <button onClick={handleNext} className="group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/50">
                <span>Review Order</span> <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Shipping</h3>
                <p className="text-slate-400 font-medium">
                  {cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                </p>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Payment Method</h3>
                <p className="text-slate-400 font-medium">{cart.paymentMethod}</p>
              </div>
              <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl bg-[#050505] border border-white/5 object-contain p-2" />
                      <div className="flex-1">
                        <p className="text-slate-200 font-bold line-clamp-1">{item.name}</p>
                        <p className="text-indigo-400 font-medium text-sm">{item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-fit sticky top-28">
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 pb-6 border-b border-white/5 text-slate-400 font-medium">
                <div className="flex justify-between"><span>Items</span><span>${cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>${cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) > 100 ? 0 : 10}</span></div>
                <div className="flex justify-between"><span>Tax (15%)</span><span>${(0.15 * cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)).toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between text-slate-100 text-xl font-black mb-8">
                <span>Total</span>
                <span className="text-amber-400">
                  ${(cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) * 1.15 + (cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) > 100 ? 0 : 10)).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={placeOrderHandler} 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-400/50 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </button>
                <button onClick={() => setStep(1)} className="w-full px-8 py-3 rounded-xl font-bold text-slate-400 bg-[#050505] border border-white/10 hover:bg-[#171717] hover:text-white transition-all">Back</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
