import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Divider, 
  Heading, 
  Spinner, 
  Text, 
  VStack,
  useToast 
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { EvaluationResult, Prompt } from '@model-eval/shared';
import { PromptService, EvaluationService } from '../api';
import ProviderSelector from '../components/ProviderSelector';
import SelectedProviders from '../components/SelectedProviders';
import EvaluationResultCard from '../components/EvaluationResult';
import { useAppContext } from '../context/AppContext';

const EvaluatePromptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedProviders } = useAppContext();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  
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

  const handleEvaluate = async () => {
    if (!id || selectedProviders.length === 0) return;
    
    setIsEvaluating(true);
    setResults([]);
    
    try {
      const evalResults = await EvaluationService.evaluateWithMultipleProviders({
        promptId: id,
        providers: selectedProviders.map(p => ({
          provider: p.provider,
          model: p.model,
          temperature: p.temperature,
          maxTokens: p.maxTokens,
          topP: p.topP,
        })),
      });
      
      setResults(evalResults);
      toast({
        title: 'Evaluation complete',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error running evaluation',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8} textAlign="center">
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error || !prompt) {
    return (
      <Container maxW="container.xl" py={8} textAlign="center">
        <Heading size="lg" color="red.500">Error: {error || 'Prompt not found'}</Heading>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>Evaluate Prompt</Heading>
      
      <Box p={5} borderWidth="1px" borderRadius="lg" mb={6}>
        <Heading size="md" mb={2}>{prompt.title}</Heading>
        <Text whiteSpace="pre-wrap">{prompt.content}</Text>
      </Box>
      
      <Box mb={8}>
        <Heading size="md" mb={4}>Select Models to Evaluate</Heading>
        <Box display={{ md: 'flex' }} gap={6}>
          <Box flex="1" mb={{ base: 4, md: 0 }}>
            <ProviderSelector />
          </Box>
          <Box flex="1">
            <SelectedProviders />
          </Box>
        </Box>
        
        <Box mt={6} textAlign="center">
          <Button 
            colorScheme="green" 
            size="lg" 
            onClick={handleEvaluate} 
            isLoading={isEvaluating}
            loadingText="Evaluating"
            isDisabled={selectedProviders.length === 0}
          >
            Run Evaluation
          </Button>
        </Box>
      </Box>
      
      {results.length > 0 && (
        <>
          <Divider my={6} />
          
          <Heading size="md" mb={4}>Evaluation Results</Heading>
          <VStack spacing={4} align="stretch">
            {results.map((result) => (
              <EvaluationResultCard key={result.id} evaluation={result} />
            ))}
          </VStack>
        </>
      )}
    </Container>
  );
};

export default EvaluatePromptPage;
