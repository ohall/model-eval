import React from 'react';
import { 
  Avatar, 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider, 
  Text,
  Box
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rounded="full" 
        variant="link" 
        cursor="pointer" 
        minW={0}
      >
        <Avatar
          size="sm"
          src={user.picture}
          name={user.name || user.email.split('@')[0]}
        />
      </MenuButton>
      <MenuList>
        <Box px={3} py={2}>
          <Text fontWeight="bold">{user.name}</Text>
          <Text fontSize="sm" color="gray.500">{user.email}</Text>
        </Box>
        <MenuDivider />
        <MenuItem onClick={logout}>Sign out</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default Profile;