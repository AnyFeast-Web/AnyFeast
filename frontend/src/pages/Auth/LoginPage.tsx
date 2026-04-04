import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { APP_NAME, APP_TAGLINE } from '../../utils/constants';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

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

  return (
    <div className="min-h-screen gradient-mesh-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-bg-surface/90 backdrop-blur-xl border border-border-subtle rounded-xl p-8 shadow-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="AnyFeast Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{APP_NAME}</h1>
          <p className="text-sm text-text-secondary mt-1">{APP_TAGLINE}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" required />
          <div className="relative">
            <Input label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {error && (
            <div className="text-sm text-accent-rose bg-accent-rose/10 p-3 rounded-md border border-accent-rose/20">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={isLoading}>Sign In</Button>
        </form>

        <p className="text-xs text-text-muted text-center mt-6">
          Invite-only platform. Contact admin for access.
        </p>
      </motion.div>
    </div>
  );
}
