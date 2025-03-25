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
    if (prompt.id) {
      navigate(`/prompts/edit/${prompt.id}`);
    } else {
      console.error('Cannot edit prompt: ID is undefined');
    }
  };

  const handleEvaluate = () => {
    if (prompt.id) {
      navigate(`/prompts/evaluate/${prompt.id}`);
    } else {
      console.error('Cannot evaluate prompt: ID is undefined');
    }
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
        <Button
          size="sm"
          colorScheme="blue"
          onClick={handleEvaluate}
          isDisabled={!prompt.id}
          title={!prompt.id ? 'Cannot evaluate: Prompt ID is missing' : ''}
        >
          Evaluate
        </Button>
        <Button
          size="sm"
          onClick={handleEdit}
          isDisabled={!prompt.id}
          title={!prompt.id ? 'Cannot edit: Prompt ID is missing' : ''}
        >
          Edit
        </Button>
        {onDelete && (
          <Button size="sm" colorScheme="red" onClick={handleDelete} isDisabled={!prompt.id}>
            Delete
          </Button>
        )}
      </HStack>
    </Box>
  );
};

export default PromptCard;
