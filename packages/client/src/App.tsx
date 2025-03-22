import React from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppProvider } from './context/AppContext';

// Import components
import Header from './components/Header';

// Import pages
import HomePage from './pages/HomePage';
import PromptsPage from './pages/PromptsPage';
import NewPromptPage from './pages/NewPromptPage';
import EditPromptPage from './pages/EditPromptPage';
import EvaluatePromptPage from './pages/EvaluatePromptPage';
import EvaluationsPage from './pages/EvaluationsPage';

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Router>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/prompts" element={<PromptsPage />} />
              <Route path="/prompts/new" element={<NewPromptPage />} />
              <Route path="/prompts/edit/:id" element={<EditPromptPage />} />
              <Route path="/prompts/evaluate/:id" element={<EvaluatePromptPage />} />
              <Route path="/evaluations" element={<EvaluationsPage />} />
            </Routes>
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default App;