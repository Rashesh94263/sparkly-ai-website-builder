import { useEffect, useRef, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Lazy-load pages to keep initial bundle lean
const ChatInterface = React.lazy(() => import("./ChatInterface"));
const WebsitePreviewExplorer = React.lazy(() => import("./WebsitePreviewExplorer"));


const Loading: React.FC = () => (
  <div className="min-h-[40vh] grid place-items-center text-slate-600">
    Loading…
  </div>
);


function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

// Router-aware shell (so we can navigate programmatically)
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  // Accessibility: focus main region on navigation
  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  const handleStartBuild = (prompt : string) => navigate("/build", { state: { prompt } }  );
  const handleBackToChat = () => navigate("/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ScrollToTop />
      <div
        ref={mainRef}
        tabIndex={-1}
        className="outline-none"
        aria-live="polite"
        aria-busy={false}
      >
        <AnimatePresence mode="wait">
          
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Suspense fallback={<Loading />}>
                    <ChatInterface onStartBuild={handleStartBuild} />
                  </Suspense>
                </PageTransition>
              }
            />
            <Route
              path="/build"
              element={
                <PageTransition>
                  <Suspense fallback={<Loading />}>
                    <WebsitePreviewExplorer onBackToChat={handleBackToChat} />
                  </Suspense>
                </PageTransition>
              }
            />
          
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}


