import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

// Import components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import PromptsPage from './pages/PromptsPage';
import NewPromptPage from './pages/NewPromptPage';
import EditPromptPage from './pages/EditPromptPage';
import EvaluatePromptPage from './pages/EvaluatePromptPage';
import EvaluationsPage from './pages/EvaluationsPage';
import LoginPage from './pages/LoginPage';

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Google OAuth Client ID - replace with your actual client ID
const GOOGLE_CLIENT_ID = "634132806876-5il52io0496rekm39ok4aidjfnuiqfnb.apps.googleusercontent.com";

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <AppProvider>
              <Router>
                <Header />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/prompts" element={<PromptsPage />} />
                    <Route path="/prompts/new" element={<NewPromptPage />} />
                    <Route path="/prompts/edit/:id" element={<EditPromptPage />} />
                    <Route path="/prompts/evaluate/:id" element={<EvaluatePromptPage />} />
                    <Route path="/evaluations" element={<EvaluationsPage />} />
                  </Route>
                </Routes>
              </Router>
            </AppProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;