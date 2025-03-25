import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Container,
  VStack,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={10} align="center" textAlign="center">
        <Box>
          <Heading as="h1" size="2xl" mb={4}>
            LLM Evaluation Tool
          </Heading>
          <Text fontSize="xl" maxW="container.md">
            Compare responses and performance metrics across multiple language models
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} width="100%">
          <Box p={8} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading as="h3" size="lg" mb={4}>
              Create & Manage Prompts
            </Heading>
            <Text mb={6}>
              Create, edit, and organize prompts to evaluate across multiple LLM providers.
            </Text>
            <Button as={RouterLink} to="/prompts" colorScheme="blue" size="lg">
              Manage Prompts
            </Button>
          </Box>

          <Box p={8} borderRadius="lg" bg={cardBg} boxShadow="md">
            <Heading as="h3" size="lg" mb={4}>
              Run Evaluations
            </Heading>
            <Text mb={6}>
              Compare model responses, latency, token usage, and more across providers.
            </Text>
            <Button as={RouterLink} to="/evaluations" colorScheme="green" size="lg">
              View Evaluations
            </Button>
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default HomePage;
