import React, { useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  Button,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
} from '@chakra-ui/react';
import { Provider } from 'shared/index';
import { useAppContext } from '../context/AppContext';
import { ProviderService } from '../api';

const ProviderSelector: React.FC = () => {
  const { addProvider, availableProviders, loadProviders } = useAppContext();
  const [selectedProvider, setSelectedProvider] = useState<Provider | ''>('');
  const [selectedModel, setSelectedModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();

  // Load available providers on component mount
  useEffect(() => {
    loadProviders();
  }, []);

  // When a provider is selected, load its models
  useEffect(() => {
    if (!selectedProvider) {
      setModels([]);
      setSelectedModel('');
      return;
    }
    
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const providerInfo = await ProviderService.getModels(selectedProvider);
        setModels(providerInfo.models);
        setSelectedModel(providerInfo.defaultModel);
      } catch (error) {
        toast({
          title: 'Error loading models',
          description: error instanceof Error ? error.message : 'Failed to load models',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
  }, [selectedProvider]);

  const handleAddProvider = () => {
    if (!selectedProvider || !selectedModel) {
      toast({
        title: 'Validation Error',
        description: 'Please select a provider and model',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    addProvider({
      provider: selectedProvider as Provider,
      model: selectedModel,
      temperature,
      maxTokens,
    });

    // Reset selection
    setSelectedProvider('');
    setSelectedModel('');
    setTemperature(0.7);
    setMaxTokens(1024);
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Provider</FormLabel>
          <Select
            placeholder="Select provider"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as Provider)}
            isDisabled={isLoading}
          >
            {Object.entries(availableProviders).map(([key, config]) => (
              <option key={key} value={key} disabled={!config.isConfigured}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {!config.isConfigured && ' (API key required)'}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired isDisabled={!selectedProvider || isLoading}>
          <FormLabel>Model</FormLabel>
          <Select
            placeholder="Select model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Temperature: {temperature.toFixed(2)}</FormLabel>
          <Slider
            value={temperature}
            min={0}
            max={1}
            step={0.01}
            onChange={(val) => setTemperature(val)}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </FormControl>

        <FormControl>
          <FormLabel>Max Tokens</FormLabel>
          <NumberInput
            value={maxTokens}
            min={1}
            max={4096}
            onChange={(_, val) => setMaxTokens(val)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <Button
          colorScheme="blue"
          onClick={handleAddProvider}
          isDisabled={!selectedProvider || !selectedModel || isLoading}
        >
          Add Provider
        </Button>
      </VStack>
    </Box>
  );
};

export default ProviderSelector;
