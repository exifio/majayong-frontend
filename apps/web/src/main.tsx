import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes, Providers } from './app/App';
import { canonicalVercelUrl } from './app/google-oauth';
import './styles/tokens.css';
import './styles/base.css';

async function start() {
  const canonicalUrl = canonicalVercelUrl(window.location.href);
  if (canonicalUrl) {
    window.location.replace(canonicalUrl);
    return;
  }

  // API가 오기 전에는 MSW가 응답한다(.env의 VITE_USE_MOCK=true)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Providers>
          <AppRoutes />
        </Providers>
      </BrowserRouter>
    </StrictMode>,
  );
}

void start();
