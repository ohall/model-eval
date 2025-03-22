import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';

const SelectedProviders: React.FC = () => {
  const { selectedProviders, removeProvider } = useAppContext();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const itemBgColor = useColorModeValue('white', 'gray.600');

  if (selectedProviders.length === 0) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Text color="gray.500" textAlign="center">No providers selected</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg={bgColor}>
      <Text fontWeight="bold" mb={3}>Selected Providers:</Text>
      <VStack spacing={3} align="stretch">
        {selectedProviders.map((provider, index) => (
          <Box key={index} p={3} borderWidth="1px" borderRadius="md" bg={itemBgColor}>
            <HStack justifyContent="space-between">
              <HStack>
                <Badge colorScheme="green" fontSize="md">
                  {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                </Badge>
                <Text fontWeight="medium">{provider.model}</Text>
              </HStack>
              <IconButton
                aria-label="Remove provider"
                icon={<span>✕</span>}
                size="sm"
                variant="ghost"
                onClick={() => removeProvider(index)}
              />
            </HStack>
            <Divider my={2} />
            <HStack spacing={4} fontSize="sm">
              <Text>Temp: {provider.temperature.toFixed(2)}</Text>
              <Text>Max Tokens: {provider.maxTokens}</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default SelectedProviders;
