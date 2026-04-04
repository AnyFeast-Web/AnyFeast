import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center">
        <h1 className="mono-number text-6xl text-brand-primary mb-4">404</h1>
        <p className="text-xl font-display font-semibold text-text-primary mb-2">Page Not Found</p>
        <p className="text-text-secondary mb-6">The page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    </div>
  );
}
