import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { EvaluationResult, Prompt } from 'shared/index';
import { PromptService, EvaluationService } from '../api';
import EvaluationResultCard from '../components/EvaluationResult';
import ModelSelectionGrid from '../components/ModelSelectionGrid';
import { useAppContext } from '../context/AppContext';

const EvaluatePromptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedProviders } = useAppContext();

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [failedResults, setFailedResults] = useState<
    Array<{ provider: string; model: string; error: string }>
  >([]);

  // const navigate = useNavigate();
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
    setFailedResults([]);

    try {
      const response = await EvaluationService.evaluateWithMultipleProviders({
        promptId: id,
        providers: selectedProviders.map(p => ({
          provider: p.provider,
          model: p.model,
          temperature: p.temperature,
          maxTokens: p.maxTokens,
          topP: p.topP,
        })),
      });

      setResults(response.successful);
      setFailedResults(response.failed);

      if (response.failed.length > 0) {
        // Show toast with partial failure if some models succeeded
        if (response.successful.length > 0) {
          toast({
            title: 'Partial evaluation success',
            description: `${response.successful.length} models succeeded, ${response.failed.length} failed`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        } else {
          // Show error if all models failed
          toast({
            title: 'Evaluation failed',
            description: 'All models failed to generate responses',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Evaluation complete',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
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
        <Heading size="lg" color="red.500">
          Error: {error || 'Prompt not found'}
        </Heading>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={4}>Evaluate Prompt</Heading>

      <Box p={5} borderWidth="1px" borderRadius="lg" mb={6}>
        <Heading size="md" mb={2}>
          {prompt.title}
        </Heading>
        <Text whiteSpace="pre-wrap">{prompt.content}</Text>
      </Box>

      <Box mb={8}>
        <Heading size="md" mb={4}>
          Select Models to Evaluate
        </Heading>
        
        {/* Import our new ModelSelectionGrid component */}
        <Box>
          <ModelSelectionGrid />
        </Box>
        
        {/* Show selected models summary */}
        {selectedProviders.length > 0 && (
          <Box mt={4} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
            <Text fontWeight="bold" mb={2}>
              Selected Models ({selectedProviders.length}):
            </Text>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
              {selectedProviders.map((provider, index) => (
                <Badge 
                  key={index} 
                  colorScheme="green" 
                  p={2} 
                  borderRadius="md"
                  fontSize="sm"
                >
                  {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)} - {provider.model}
                </Badge>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Box mt={6} textAlign="center">
          <Button
            colorScheme="green"
            size="lg"
            onClick={handleEvaluate}
            isLoading={isEvaluating}
            loadingText="Evaluating"
            isDisabled={selectedProviders.length === 0}
          >
            Run Evaluation ({selectedProviders.length} models)
          </Button>
        </Box>
      </Box>

      {(results.length > 0 || failedResults.length > 0) && (
        <>
          <Divider my={6} />

          {results.length > 0 && (
            <>
              <Heading size="md" mb={4}>
                Evaluation Results
              </Heading>
              <VStack spacing={4} align="stretch" mb={6}>
                {results.map((result, index) => (
                  <EvaluationResultCard key={result.id || `result-${index}`} evaluation={result} />
                ))}
              </VStack>
            </>
          )}

          {failedResults.length > 0 && (
            <>
              <Heading size="md" mb={4} color="red.500">
                Failed Evaluations
              </Heading>
              <VStack spacing={4} align="stretch">
                {failedResults.map((result, index) => (
                  <Box
                    key={`failed-${index}`}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor="red.300"
                    backgroundColor="red.50"
                  >
                    <Heading size="sm" mb={2}>
                      {result.provider} - {result.model}
                    </Heading>
                    <Text color="red.600">{result.error}</Text>
                  </Box>
                ))}
              </VStack>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default EvaluatePromptPage;
