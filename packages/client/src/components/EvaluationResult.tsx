import React from 'react';
import { Box, Text, Heading, Divider, Stat, StatLabel, StatNumber, StatGroup, Badge, useColorModeValue } from '@chakra-ui/react';
import { EvaluationResult } from 'shared/index';
import ReactMarkdown from 'react-markdown';

interface EvaluationResultCardProps {
  evaluation: EvaluationResult;
}

const EvaluationResultCard: React.FC<EvaluationResultCardProps> = ({ evaluation }) => {
  const { provider, model, response, metrics } = evaluation;
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Format provider name for display
  const formatProviderName = (provider: string): string => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };
  
  // Format numbers for display
  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  const formatCost = (cost?: number): string => {
    if (cost === undefined) return 'N/A';
    return `$${cost.toFixed(6)}`;
  };
  
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Box 
      p={5} 
      shadow="md" 
      borderWidth="1px" 
      borderRadius="md"
      bg={bgColor}
      borderColor={borderColor}
      mb={4}
    >
      <Box display="flex" alignItems="center">
        <Heading size="md" mr={2}>{formatProviderName(provider)}</Heading>
        <Badge colorScheme="purple">{model}</Badge>
      </Box>
      
      <Divider my={3} />
      
      <StatGroup mb={4}>
        <Stat>
          <StatLabel>Response Time</StatLabel>
          <StatNumber>{formatTime(metrics.latencyMs)}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Tokens</StatLabel>
          <StatNumber>{formatNumber(metrics.totalTokens)}</StatNumber>
        </Stat>
        
        <Stat>
          <StatLabel>Cost</StatLabel>
          <StatNumber>{formatCost(metrics.costUsd)}</StatNumber>
        </Stat>
      </StatGroup>
      
      <Box 
        p={3} 
        borderWidth="1px" 
        borderRadius="md" 
        bg={useColorModeValue('gray.50', 'gray.800')}
      >
        <Text fontWeight="bold" mb={2}>Response:</Text>
        <Box overflowX="auto" className="markdown-body">
          <ReactMarkdown>{response}</ReactMarkdown>
        </Box>
      </Box>
    </Box>
  );
};

export default EvaluationResultCard;
