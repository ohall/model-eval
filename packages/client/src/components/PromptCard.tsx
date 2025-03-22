import React from 'react';
import { Box, Heading, Text, Badge, HStack, Button, useColorModeValue } from '@chakra-ui/react';
import { Prompt } from 'shared/index';
import { useNavigate } from 'react-router-dom';

interface PromptCardProps {
  prompt: Prompt;
  onDelete?: (id: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onDelete }) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleEdit = () => {
    navigate(`/prompts/edit/${prompt.id}`);
  };

  const handleEvaluate = () => {
    navigate(`/prompts/evaluate/${prompt.id}`);
  };

  const handleDelete = () => {
    if (onDelete && prompt.id) {
      onDelete(prompt.id);
    }
  };

  return (
    <Box 
      p={5} 
      shadow="md" 
      borderWidth="1px" 
      borderRadius="md"
      bg={bgColor}
      borderColor={borderColor}
    >
      <Heading fontSize="xl">{prompt.title}</Heading>
      
      <Text mt={2} noOfLines={3}>
        {prompt.content}
      </Text>
      
      <HStack mt={3} spacing={2}>
        {prompt.tags?.map((tag, index) => (
          <Badge key={`${prompt.id || ''}-tag-${index}-${tag}`} colorScheme="blue">
            {tag}
          </Badge>
        ))}
      </HStack>
      
      <HStack mt={4} spacing={3}>
        <Button size="sm" colorScheme="blue" onClick={handleEvaluate}>Evaluate</Button>
        <Button size="sm" onClick={handleEdit}>Edit</Button>
        {onDelete && (
          <Button size="sm" colorScheme="red" onClick={handleDelete}>Delete</Button>
        )}
      </HStack>
    </Box>
  );
};

export default PromptCard;
