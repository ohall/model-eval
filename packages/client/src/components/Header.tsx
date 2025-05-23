import React from 'react';
import { Box, Flex, Heading, Spacer, Button, useColorMode } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import Profile from './Profile';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isAuthenticated } = useAuth();

  return (
    <Box as="header" py={4} px={6} bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}>
      <Flex alignItems="center">
        <Heading as="h1" size="lg">
          Model Eval
        </Heading>

        <Spacer />

        {isAuthenticated && (
          <Box mr={4}>
            <Button as={RouterLink} to="/" variant="ghost" mr={2}>
              Home
            </Button>
            <Button as={RouterLink} to="/prompts" variant="ghost" mr={2}>
              Prompts
            </Button>
            <Button as={RouterLink} to="/evaluations" variant="ghost">
              Evaluations
            </Button>
          </Box>
        )}

        <Button onClick={toggleColorMode} mr={4}>
          {colorMode === 'light' ? 'Dark' : 'Light'} Mode
        </Button>

        {isAuthenticated && <Profile />}
      </Flex>
    </Box>
  );
};

export default Header;
