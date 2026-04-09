import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { APP_NAME, APP_TAGLINE } from '../../utils/constants';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-text-primary">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-brand-primary/20">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary">{APP_NAME}</h1>
          <p className="text-text-secondary text-sm mt-1">{APP_TAGLINE}</p>
        </div>

        <div className="bg-white border border-border-subtle rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase ml-1">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none transition-all"
                placeholder="name@company.com"
                required
              />
            </div>
            
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-text-secondary uppercase ml-1">Password</label>
              <input 
                type={showPw ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-9 text-text-muted hover:text-text-secondary transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="text-xs font-medium text-accent-rose bg-accent-rose/5 p-3 rounded-lg border border-accent-rose/20">
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
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-bold text-text-muted uppercase tracking-widest">OR</span>
            </div>
          </div>

          {/* Social Login */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-border-subtle text-text-primary font-semibold py-3.5 rounded-xl hover:bg-bg-surface active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <p className="text-[10px] text-text-muted text-center mt-10 uppercase tracking-widest">
          Professional Access · Secure Encryption Enabled
        </p>
      </motion.div>
    </div>
  );
}
