import React, { useState } from 'react';
import { Box, Button, Center, Heading, Text, VStack, useToast, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface GoogleCredentialResponse {
  credential: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async (credentialResponse: GoogleCredentialResponse) => {
    try {
      // Decode the JWT to get user info
      const decodedUser = jwtDecode<{
        email: string;
        name: string;
        picture: string;
        sub: string;
      }>(credentialResponse.credential);
      
      // Send the credential to your backend for verification and to get your app's JWT
      const response = await axios.post('/api/auth/google', {
        credential: credentialResponse.credential
      });
      
      if (response.data && response.data.token) {
        // Create a user object from the decoded JWT
        const userData = {
          email: decodedUser.email,
          name: decodedUser.name,
          picture: decodedUser.picture,
          providerId: decodedUser.sub,
          provider: 'google' as const
        };
        
        // Login using our auth context
        login(response.data.token, userData);
        
        toast({
          title: 'Login successful',
          description: `Welcome, ${userData.name}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Login failed', error);
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
                  <Button 
                    mt={2} 
                    size="sm" 
                    colorScheme="red" 
                    onClick={() => setError(null)}
                  >
                    Try Again
                  </Button>
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={(errorResponse) => {
              console.error('Google login error:', errorResponse);
              setError('Google authentication failed. Please try again using a different browser or clear your cookies.');
              toast({
                title: 'Login failed',
                description: 'Google authentication failed. See troubleshooting info below.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            }}
            type="standard"
            theme="filled_blue"
            size="large"
            shape="rectangular"
            logo_alignment="center"
            text="signin_with"
          />
        </Box>
      </VStack>
    </Center>
  );
};

export default Login;