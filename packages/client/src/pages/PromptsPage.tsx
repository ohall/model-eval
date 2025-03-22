import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Heading, SimpleGrid, Spinner, Text, useToast } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Prompt } from 'shared/index';
import { PromptService } from '../api';
import PromptCard from '../components/PromptCard';

const PromptsPage: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();

  const fetchPrompts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedPrompts = await PromptService.getAll();
      setPrompts(fetchedPrompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
      toast({
        title: 'Error loading prompts',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleDeletePrompt = async (id: string) => {
    try {
      await PromptService.delete(id);
      setPrompts(prompts.filter(prompt => prompt.id !== id));
      toast({
        title: 'Prompt deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error deleting prompt',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>Prompts</Heading>
        <Button as={RouterLink} to="/prompts/new" colorScheme="blue">
          Add New Prompt
        </Button>
      </Box>

      {isLoading ? (
        <Box textAlign="center" my={10}>
          <Spinner size="xl" />
        </Box>
      ) : error ? (
        <Box textAlign="center" my={10}>
          <Text color="red.500">{error}</Text>
        </Box>
      ) : prompts.length === 0 ? (
        <Box textAlign="center" my={10} p={6} borderWidth="1px" borderRadius="lg">
          <Text mb={4}>No prompts found. Create your first prompt to get started.</Text>
          <Button as={RouterLink} to="/prompts/new" colorScheme="blue">
            Create Prompt
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {prompts.map((prompt, index) => (
            <PromptCard 
              key={prompt.id || `prompt-${index}`} 
              prompt={prompt} 
              onDelete={handleDeletePrompt}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default PromptsPage;
