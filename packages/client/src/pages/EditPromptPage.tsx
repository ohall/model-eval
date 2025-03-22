import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, Spinner, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { PromptService } from '../api';
import PromptForm from '../components/PromptForm';
import { Prompt } from '@model-eval/shared';

const EditPromptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const fetchedPrompt = await PromptService.getById(id);
        setPrompt(fetchedPrompt);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prompt');
        toast({
          title: 'Error loading prompt',
          description: err instanceof Error ? err.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [id]);

  const handleSubmit = async (updatedPrompt: Omit<Prompt, 'id'>) => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      await PromptService.update(id, updatedPrompt);
      toast({
        title: 'Prompt updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/prompts');
    } catch (err) {
      toast({
        title: 'Error updating prompt',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8} textAlign="center">
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error || !prompt) {
    return (
      <Container maxW="container.md" py={8} textAlign="center">
        <Heading size="lg" color="red.500">Error: {error || 'Prompt not found'}</Heading>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6}>Edit Prompt</Heading>
      <Box p={6} borderWidth="1px" borderRadius="lg">
        <PromptForm 
          initialValues={prompt} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </Box>
    </Container>
  );
};

export default EditPromptPage;
