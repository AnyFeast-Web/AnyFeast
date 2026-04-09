import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { APP_NAME, APP_TAGLINE } from '../../utils/constants';
import { signInWithEmailAndPassword, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect result on mount
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          navigate('/');
        }
      } catch (err: any) {
        console.error('Redirect result error:', err);
        setError(`Google sign-in failed: ${err.code || err.message}`);
      }
    };
    checkRedirect();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
      // User will be redirected away from the page
    } catch (err: any) {
      console.error('Google redirect error:', err);
      setError(`Google sign-in failed: ${err.code || err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">{APP_NAME}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{APP_TAGLINE}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
            
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-600 uppercase ml-1">Password</label>
              <input 
                type={showPw ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-9 text-slate-400 hover:text-slate-600 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="text-[11px] font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 leading-relaxed">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-dim active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            Google
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-10 uppercase tracking-widest font-medium">
          Professional Access · AnyFeast 2026
        </p>
      </motion.div>
    </div>
  );
}
