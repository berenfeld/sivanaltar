import '@/i18n';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider, useLang, readStorage } from '@/lib/LanguageContext';
import { useEffect } from 'react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Syncs URL :lang param into LanguageContext (no DB write, just apply)
function LangSync() {
  const { lang } = useParams();
  const { applyLang } = useLang();

  useEffect(() => {
    if (lang === 'he' || lang === 'en') {
      applyLang(lang);
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

// Renders the correct page component from URL :pageName param
function DynamicPage() {
  const { pageName } = useParams();
  const Page = Pages[pageName];
  if (!Page) return <PageNotFound />;
  return (
    <LayoutWrapper currentPageName={pageName}>
      <Page />
    </LayoutWrapper>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const defaultLang = readStorage();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Root redirect to user's preferred language */}
      <Route path="/" element={<Navigate to={`/${defaultLang}/${mainPageKey}`} replace />} />

      {/* Lang-prefixed home (/:lang with no page segment) */}
      <Route
        path="/:lang"
        element={
          <>
            <LangSync />
            <LayoutWrapper currentPageName={mainPageKey}>
              <MainPage />
            </LayoutWrapper>
          </>
        }
      />

      {/* Lang-prefixed pages (/:lang/:pageName) */}
      <Route
        path="/:lang/:pageName"
        element={
          <>
            <LangSync />
            <DynamicPage />
          </>
        }
      />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
