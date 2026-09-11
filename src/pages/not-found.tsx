import { useLocation } from 'wouter';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useSEO } from '@/lib/seo';

export default function NotFound() {
  const [, navigate] = useLocation();

  useSEO({
    title: '404 - Page Not Found | Jamia Portal',
    description: 'The page you requested could not be found on Jamia Portal.',
    noindex: true,
  });

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-4" style={{ background: 'var(--neu-bg)' }}>
      <div className="neu-raised rounded-3xl w-full max-w-xl p-8 md:p-10 text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-[#E4572E]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold tracking-wider text-[#E4572E] mb-2">ERROR 404</p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Page Not Found</h1>
        <p className="opacity-70 leading-relaxed mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="neu-btn-primary px-6 py-3 rounded-xl text-white font-semibold"
          >
            Go to Home
          </button>
          <button
            onClick={() => history.back()}
            className="neu-btn px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
