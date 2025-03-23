import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading size="4xl">404</Heading>
        <Heading size="xl">Page Not Found</Heading>
        <Text fontSize="xl" color="gray.600">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button
          colorScheme="blue"
          size="lg"
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </VStack>
    </Container>
  );
}; 