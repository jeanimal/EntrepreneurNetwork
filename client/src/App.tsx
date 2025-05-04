import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "./lib/auth.tsx";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Network from "./pages/Network";
import Projects from "./pages/Projects";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { DebugAuthState } from "./utils/debug";

function AuthenticatedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to the Replit Auth login
      window.location.href = "/api/login";
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Determine if we should show the standard navbar and footer
  const showNavbarFooter = isAuthenticated || location === "/login" || location === "/register";
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Only show Navbar on authenticated routes or certain public pages */}
      {showNavbarFooter && <Navbar />}
      
      <div className="flex-grow">
        <Switch>
          {/* Home route - conditionally render Landing or Home based on auth state */}
          <Route path="/">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : isAuthenticated ? (
              <Home />
            ) : (
              <Landing />
            )}
          </Route>
          
          {/* Auth routes */}
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          {/* Protected routes */}
          <Route path="/network">
            <AuthenticatedRoute component={Network} path="/network" />
          </Route>
          <Route path="/projects">
            <AuthenticatedRoute component={Projects} path="/projects" />
          </Route>
          <Route path="/messages">
            <AuthenticatedRoute component={Messages} path="/messages" />
          </Route>
          <Route path="/profile/:id">
            {(params) => <AuthenticatedRoute component={Profile} path={`/profile/${params.id}`} />}
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Only show Footer on authenticated routes or certain public pages */}
      {showNavbarFooter && <Footer />}
      
      {/* Landing page has its own footer, so we don't need to render the standard Footer */}
      
      {/* Add debug component in development */}
      {process.env.NODE_ENV !== 'production' && <DebugAuthState />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
