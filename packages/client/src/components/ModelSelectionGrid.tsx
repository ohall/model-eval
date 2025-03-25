import React, { useEffect, useState } from 'react';
import {
  Box,
  SimpleGrid,
  Checkbox,
  Heading,
  Text,
  Card,
  CardBody,
  Stack,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormLabel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Provider } from 'shared/index';
import { useAppContext } from '../context/AppContext';
import { ProviderService } from '../api';

interface ModelSetting {
  provider: Provider;
  model: string;
  isSelected: boolean;
  temperature: number;
  maxTokens: number;
}

interface ProviderGroup {
  provider: Provider;
  displayName: string;
  isConfigured: boolean;
  models: ModelSetting[];
}

const ModelSelectionGrid: React.FC = () => {
  const { 
    addProvider, 
    removeProvider, 
    selectedProviders, 
    availableProviders, 
    loadProviders,
    findProviderIndex
  } = useAppContext();
  
  const [providerGroups, setProviderGroups] = useState<ProviderGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();

  // Load all providers and their models
  useEffect(() => {
    const fetchAllProviders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load providers if not already loaded
        if (Object.keys(availableProviders).length === 0) {
          await loadProviders();
        }
        
        const groups: ProviderGroup[] = [];
        
        // For each available provider
        for (const [key, config] of Object.entries(availableProviders)) {
          if (!config.isConfigured) continue;
          
          try {
            // Fetch models for this provider
            const providerInfo = await ProviderService.getModels(key);
            
            // Create model settings with default values
            const models: ModelSetting[] = providerInfo.models.map(model => {
              // Check if this model is already selected
              const existingSelection = selectedProviders.find(
                p => p.provider === key && p.model === model
              );
              
              return {
                provider: key as Provider,
                model,
                isSelected: !!existingSelection,
                temperature: existingSelection?.temperature || 0.7,
                maxTokens: existingSelection?.maxTokens || 1024,
              };
            });
            
            groups.push({
              provider: key as Provider,
              displayName: key.charAt(0).toUpperCase() + key.slice(1),
              isConfigured: config.isConfigured,
              models,
            });
          } catch (err) {
            console.error(`Error loading models for ${key}:`, err);
            toast({
              title: `Error loading models for ${key}`,
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        }
        
        setProviderGroups(groups);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load models');
        toast({
          title: 'Error loading providers',
          description: err instanceof Error ? err.message : 'Unknown error',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllProviders();
  }, [availableProviders, selectedProviders]);

  // Handle checkbox changes
  const handleModelToggle = (provider: Provider, model: string, isSelected: boolean) => {
    // Find the model in our state
    const providerGroup = providerGroups.find(g => g.provider === provider);
    if (!providerGroup) return;
    
    const modelSetting = providerGroup.models.find(m => m.model === model);
    if (!modelSetting) return;
    
    if (isSelected) {
      // Add to selected providers
      addProvider({
        provider,
        model,
        temperature: modelSetting.temperature,
        maxTokens: modelSetting.maxTokens,
      });
    } else {
      // Find the index of this provider/model combo in the selected providers
      const index = selectedProviders.findIndex(
        p => p.provider === provider && p.model === model
      );
      
      if (index !== -1) {
        removeProvider(index);
      }
    }
    
    // Update our local state
    setProviderGroups(prev => 
      prev.map(group => {
        if (group.provider !== provider) return group;
        
        return {
          ...group,
          models: group.models.map(m => {
            if (m.model !== model) return m;
            return { ...m, isSelected };
          }),
        };
      })
    );
  };

  // Handle temperature change
  const handleTemperatureChange = (provider: Provider, model: string, value: number) => {
    // Update our local state
    setProviderGroups(prev => 
      prev.map(group => {
        if (group.provider !== provider) return group;
        
        return {
          ...group,
          models: group.models.map(m => {
            if (m.model !== model) return m;
            return { ...m, temperature: value };
          }),
        };
      })
    );
    
    // If this model is selected, update the selection
    const index = findProviderIndex(provider, model);
    
    if (index !== -1) {
      const providerSetting = selectedProviders[index];
      removeProvider(index);
      addProvider({
        ...providerSetting,
        temperature: value,
      });
    }
  };

  // Handle max tokens change
  const handleMaxTokensChange = (provider: Provider, model: string, value: number) => {
    // Update our local state
    setProviderGroups(prev => 
      prev.map(group => {
        if (group.provider !== provider) return group;
        
        return {
          ...group,
          models: group.models.map(m => {
            if (m.model !== model) return m;
            return { ...m, maxTokens: value };
          }),
        };
      })
    );
    
    // If this model is selected, update the selection
    const index = findProviderIndex(provider, model);
    
    if (index !== -1) {
      const providerSetting = selectedProviders[index];
      removeProvider(index);
      addProvider({
        ...providerSetting,
        maxTokens: value,
      });
    }
  };

  if (isLoading) {
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Accordion allowMultiple defaultIndex={[0]} mb={4}>
        {providerGroups.map((group) => (
          <AccordionItem key={group.provider}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  {group.displayName}
                  <Badge ml={2} colorScheme="green">
                    {group.models.filter(m => m.isSelected).length} selected
                  </Badge>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {group.models.map((model) => (
                  <Card key={model.model} variant={model.isSelected ? "filled" : "outline"}>
                    <CardBody>
                      <Checkbox 
                        isChecked={model.isSelected}
                        onChange={(e) => handleModelToggle(group.provider, model.model, e.target.checked)}
                        mb={2}
                        size="lg"
                        colorScheme="green"
                      >
                        <Text fontWeight="bold">{model.model}</Text>
                      </Checkbox>
                      
                      <Divider my={3} />
                      
                      <Stack spacing={4}>
                        <Box>
                          <FormLabel fontSize="sm">Temperature: {model.temperature.toFixed(2)}</FormLabel>
                          <Slider
                            value={model.temperature}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(val) => handleTemperatureChange(group.provider, model.model, val)}
                            isDisabled={!model.isSelected}
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                        </Box>
                        
                        <Box>
                          <FormLabel fontSize="sm">Max Tokens</FormLabel>
                          <NumberInput
                            value={model.maxTokens}
                            min={1}
                            max={4096}
                            onChange={(_, val) => handleMaxTokensChange(group.provider, model.model, val)}
                            isDisabled={!model.isSelected}
                            size="sm"
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </Box>
                      </Stack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default ModelSelectionGrid;