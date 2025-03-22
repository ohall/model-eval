import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, Spinner, Text, Select, SimpleGrid, Button, VStack } from '@chakra-ui/react';
import { EvaluationResult, Prompt } from 'shared/index';
import { EvaluationService, PromptService } from '../api';
import EvaluationResultCard from '../components/EvaluationResult';
import { Link as RouterLink } from 'react-router-dom';

const EvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prompts on component mount
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const fetchedPrompts = await PromptService.getAll();
        setPrompts(fetchedPrompts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prompts');
      }
    };

    fetchPrompts();
  }, []);

  // Fetch all evaluations or filtered by prompt ID
  useEffect(() => {
    const fetchEvaluations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let fetchedEvaluations;
        
        if (selectedPromptId) {
          fetchedEvaluations = await EvaluationService.getByPromptId(selectedPromptId);
        } else {
          fetchedEvaluations = await EvaluationService.getAll();
        }
        
        setEvaluations(fetchedEvaluations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load evaluations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluations();
  }, [selectedPromptId]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPromptId(e.target.value);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>Evaluations</Heading>
        <Button as={RouterLink} to="/prompts" colorScheme="blue">
          Create New Evaluation
        </Button>
      </Box>

      <Box mb={6}>
        <Text fontWeight="bold" mb={2}>Filter by Prompt:</Text>
        <Select
          placeholder="All prompts"
          value={selectedPromptId}
          onChange={handlePromptChange}
        >
          {prompts.map((prompt, index) => (
            <option key={prompt.id || `prompt-${index}`} value={prompt.id || ''}>
              {prompt.title}
            </option>
          ))}
        </Select>
      </Box>

      {isLoading ? (
        <Box textAlign="center" my={10}>
          <Spinner size="xl" />
        </Box>
      ) : error ? (
        <Box textAlign="center" my={10}>
          <Text color="red.500">{error}</Text>
        </Box>
      ) : evaluations.length === 0 ? (
        <Box textAlign="center" my={10} p={6} borderWidth="1px" borderRadius="lg">
          <Text mb={4}>No evaluations found. Run evaluations on your prompts to get started.</Text>
          <Button as={RouterLink} to="/prompts" colorScheme="blue">
            Go to Prompts
          </Button>
        </Box>
      ) : (
        <VStack spacing={4} align="stretch">
          {evaluations.map((evaluation, index) => (
            <EvaluationResultCard key={evaluation.id || `evaluation-${index}`} evaluation={evaluation} />
          ))}
        </VStack>
      )}
    </Container>
  );
};

export default EvaluationsPage;
