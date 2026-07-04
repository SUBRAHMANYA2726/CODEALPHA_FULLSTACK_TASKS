import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { clearCartItems } from '../slices/cartSlice';
import { FaMapMarkerAlt, FaCreditCard, FaShoppingBag, FaCheck, FaLock } from 'react-icons/fa';

const STEPS = ['Shipping', 'Payment', 'Review'];

const CheckoutPage = () => {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) navigate('/login?redirect=/checkout');
  }, [userInfo, navigate]);

  const itemsPrice = cart.cartItems.reduce((a, c) => a + c.price * c.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

  const goToStep1 = () => {
    if (!address.trim()) return toast.error('Please enter your address');
    if (!city.trim()) return toast.error('Please enter your city');
    if (!postalCode.trim()) return toast.error('Please enter your postal code');
    if (!country.trim()) return toast.error('Please enter your country');
    setStep(1);
  };

  const placeOrderHandler = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post('/api/orders', {
        orderItems: cart.cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.thumbnail || item.image,
          price: item.price,
          product: item._id,
        })),
        shippingAddress: { address: address.trim(), city: city.trim(), postalCode: postalCode.trim(), country: country.trim() },
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch(clearCartItems());
      toast.success('Order placed successfully!');
      navigate(`/order/${data._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-10">
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Order Flow</p>
            <h1 className="text-3xl font-black text-white">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white glow-blue' : 'bg-dark-card border border-white/10 text-slate-500'}`}>
                    {i < step ? <FaCheck /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 ${i === step ? 'text-blue-400 font-semibold' : 'text-slate-500'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 mb-4 transition-colors duration-500 ${i < step ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step Content */}
            <div className="lg:col-span-2">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Shipping Address</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1.5 block">Street Address</label>
                      <input type="text" className="input-premium" placeholder="123 Main Street, Apt 4B" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">City</label>
                        <input type="text" className="input-premium" placeholder="New York" value={city} onChange={(e) => setCity(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1.5 block">Postal Code</label>
                        <input type="text" className="input-premium" placeholder="10001" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1.5 block">Country</label>
                      <input type="text" className="input-premium" placeholder="United States" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                    <button onClick={goToStep1} className="btn-primary-premium w-full py-4 text-base flex items-center justify-center gap-2 relative z-10 mt-2">
                      Continue to Payment →
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                      <FaCreditCard className="text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Payment Method</h2>
                  </div>
                  <div className="space-y-3 mb-6">
                    {['PayPal', 'Stripe', 'Credit Card'].map((method) => (
                      <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === method ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 glass hover:border-white/20'}`}>
                        <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="accent-blue-500" />
                        <div>
                          <p className="text-white font-medium">{method}</p>
                          <p className="text-xs text-slate-400">{method === 'PayPal' ? 'Pay securely via PayPal' : method === 'Stripe' ? 'Cards, Apple Pay, Google Pay' : 'Visa, Mastercard, Amex'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="btn-secondary-premium py-3 px-6">← Back</button>
                    <button onClick={() => setStep(2)} className="btn-primary-premium flex-1 py-3 relative z-10">Review Order →</button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                      <FaShoppingBag className="text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Review Your Order</h2>
                  </div>

                  <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
                    {cart.cartItems.map((item) => (
                      <div key={item._id} className="flex items-center gap-4 py-3 border-b border-white/5">
                        <img src={item.thumbnail || item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" onError={(e) => { e.target.src='https://placehold.co/60x60/1A2235/60A5FA?text=P'; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">Qty: {item.qty}</p>
                        </div>
                        <span className="text-sm font-bold text-white">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass rounded-xl p-4 mb-6 text-sm space-y-1">
                    <p className="text-slate-400"><span className="text-white font-medium">Address:</span> {address}, {city}, {postalCode}, {country}</p>
                    <p className="text-slate-400"><span className="text-white font-medium">Payment:</span> {paymentMethod}</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary-premium py-3 px-6">← Back</button>
                    <button
                      onClick={placeOrderHandler}
                      disabled={isLoading}
                      className="btn-primary-premium flex-1 py-4 text-base flex items-center justify-center gap-2 relative z-10 disabled:opacity-60"
                    >
                      <FaLock className="text-sm" />
                      {isLoading ? 'Placing Order...' : `Place Order • $${totalPrice}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="glass rounded-2xl p-5 border border-white/10 h-fit sticky top-24">
              <h3 className="text-base font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                {[['Items', `$${itemsPrice.toFixed(2)}`], ['Shipping', shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`], ['Tax', `$${taxPrice.toFixed(2)}`]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-slate-400">{l}</span>
                    <span className={v === 'FREE' ? 'text-green-400 font-medium' : 'text-white'}>{v}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="gradient-text text-lg">${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
