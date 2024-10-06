import React from 'react';
import { Box, Flex, Button, Heading, Stack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <Box bg="gray.100" px={4}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Heading as="h1" size="lg">Bookmarks Sync</Heading>
        <Stack direction={'row'} spacing={4}>
          {user ? (
            <>
              <Link to="/"><Button>Dashboard</Button></Link>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button>Login</Button></Link>
              <Link to="/register"><Button colorScheme="blue">Register</Button></Link>
            </>
          )}
        </Stack>
      </Flex>
    </Box>
  );
};

export default Header;