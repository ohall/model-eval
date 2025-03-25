import React, { useState } from 'react';
import { Box, Container, Heading, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PromptService } from '../api';
import PromptForm from '../components/PromptForm';
import { Prompt } from 'shared/index';

const NewPromptPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (prompt: Omit<Prompt, 'id'>) => {
    setIsSubmitting(true);

    try {
      await PromptService.create(prompt);
      toast({
        title: 'Prompt created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/prompts');
    } catch (error) {
      toast({
        title: 'Error creating prompt',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading mb={6}>Create New Prompt</Heading>
      <Box p={6} borderWidth="1px" borderRadius="lg">
        <PromptForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Box>
    </Container>
  );
};

export default NewPromptPage;
