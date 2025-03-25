import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Heading,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

interface GoogleCredentialResponse {
  credential: string;
}

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const toast = useToast();

  const handleGoogleLogin = async (credentialResponse: GoogleCredentialResponse) => {
    try {
      // Decode the JWT to get user info
      const decodedUser = jwtDecode(credentialResponse.credential) as any;

      // Send the credential to our backend
      const response = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential,
      });

      // Login using our auth context
      login(response.data.token, response.data.user);

      toast({
        title: 'Login successful',
        description: `Welcome, ${response.data.user.name}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      logger.error('Login failed', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Center h="100vh">
      <VStack spacing={8} p={8} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
        <Heading>Model Eval Platform</Heading>
        <Text>Sign in to continue</Text>

        <Box>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button mt={2} size="sm" colorScheme="red" onClick={() => setError(null)}>
                    Try Again
                  </Button>
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              setError('Google Sign-In failed. Please try again.');
            }}
            useOneTap
            theme="outline"
            size="large"
            width="100%"
          />

          {error && (
            <Box mt={5} pt={4} borderTopWidth="1px">
              <Text fontSize="sm" mb={3} fontWeight="bold">
                Having trouble with Google Sign-In?
              </Text>
              <Text fontSize="sm" color="gray.600">
                Please make sure cookies are enabled and try again. If the problem persists, please
                contact support.
              </Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Center>
  );
};

export default Login;
