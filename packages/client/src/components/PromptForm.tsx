import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from '@chakra-ui/react';
import { Prompt } from '@model-eval/shared';

interface PromptFormProps {
  initialValues?: Partial<Prompt>;
  onSubmit: (prompt: Omit<Prompt, 'id'>) => Promise<void>;
  isSubmitting?: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ 
  initialValues = {}, 
  onSubmit,
  isSubmitting = false 
}) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [content, setContent] = useState(initialValues.content || '');
  const [tags, setTags] = useState<string[]>(initialValues.tags || []);
  const [newTag, setNewTag] = useState('');
  
  const toast = useToast();

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;
    
    if (!tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    } else {
      toast({
        title: 'Duplicate tag',
        description: 'This tag already exists',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags,
      });
    } catch (error) {
      console.error('Error submitting prompt:', error);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Content</FormLabel>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your prompt content"
            minH="200px"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Tags</FormLabel>
          <HStack>
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button onClick={handleAddTag}>Add</Button>
          </HStack>
          
          <Box mt={2}>
            {tags.map((tag, index) => (
              <Tag key={index} size="md" colorScheme="blue" m={1}>
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleRemoveTag(tag)} />
              </Tag>
            ))}
          </Box>
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue" 
          isLoading={isSubmitting}
          loadingText="Saving"
        >
          Save Prompt
        </Button>
      </VStack>
    </Box>
  );
};

export default PromptForm;
