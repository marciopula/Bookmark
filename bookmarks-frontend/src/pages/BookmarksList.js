import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Spinner, VStack, Input, Button, Flex, Text, useToast, Icon,
  Container, useColorModeValue, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Link
} from '@chakra-ui/react';
import { MdSearch, MdChevronRight, MdArrowBack, MdLink, MdExpandMore } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';

// Custom folder icon component
const FolderIcon = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
  </Icon>
);

const BookmarkItem = ({ bookmark, level = 0, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hoverColor = useColorModeValue('gray.100', 'gray.600');

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    onToggle(bookmark.id);
  };

  return (
    <Box>
      <Flex
        align="center"
        py={2}
        px={4}
        ml={`${level * 20}px`}
        _hover={{ bg: hoverColor }}
        cursor={bookmark.isFolder ? 'pointer' : 'default'}
        onClick={bookmark.isFolder ? toggleExpand : undefined}
      >
        {bookmark.isFolder && (
          <Icon
            as={isExpanded ? MdExpandMore : MdChevronRight}
            mr={2}
            onClick={toggleExpand}
          />
        )}
        <Icon 
          as={bookmark.isFolder ? FolderIcon : MdLink} 
          mr={2} 
          color={bookmark.isFolder ? "blue.500" : "gray.500"}
          fontSize={bookmark.isFolder ? "1.5em" : "1em"}
        />
        {bookmark.isFolder ? (
          <Text fontWeight="medium">{bookmark.title}</Text>
        ) : (
          <Link href={bookmark.url} isExternal color="blue.500">
            {bookmark.title}
          </Link>
        )}
        {bookmark.isFolder && (
          <Text ml={2} fontSize="sm" color="gray.500">
            {bookmark.children.length}
          </Text>
        )}
      </Flex>
      {isExpanded && bookmark.children && (
        <Box>
          {bookmark.children.map(child => (
            <BookmarkItem key={child.id} bookmark={child} level={level + 1} onToggle={onToggle} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const BookmarksList = () => {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { callApi } = useApi();
  const toast = useToast();

  const [device, setDevice] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const fetchBookmarks = useCallback(async (search = '') => {
    setLoadingBookmarks(true);
    try {
      const response = await callApi('GET', `/api/bookmarks/${deviceId}?search=${search}`);
      setBookmarks(response.bookmarks);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookmarks. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingBookmarks(false);
    }
  }, [deviceId, callApi, toast]);

  const fetchDevice = useCallback(async () => {
    try {
      const response = await callApi('GET', `/api/devices/${deviceId}`);
      setDevice(response);
    } catch (error) {
      console.error('Failed to fetch device:', error);
      toast({
        title: "Error",
        description: "Failed to fetch device information.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [deviceId, callApi, toast]);

  useEffect(() => {
    if (user) {
      fetchDevice();
      fetchBookmarks();
    }
  }, [user, fetchDevice, fetchBookmarks]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    fetchBookmarks(e.target.value);
  };

  const handleToggle = (bookmarkId) => {
    // This function can be used to track expanded folders if needed in the future
    console.log('Toggled bookmark:', bookmarkId);
  };

  if (!user) {
    return <Box>Please log in to view bookmarks.</Box>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Button leftIcon={<MdArrowBack />} onClick={() => navigate('/')} variant="outline">
            Back to Dashboard
          </Button>
          <Breadcrumb separator={<MdChevronRight />}>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')}>Devices</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{device ? device.name : 'Loading...'}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Flex>
        
        <Heading size="lg">Bookmarks for {device ? device.name : 'Loading...'}</Heading>
        
        <Input
          placeholder="Search bookmarks"
          value={searchTerm}
          onChange={handleSearch}
          leftIcon={<MdSearch />}
        />
        
        {loadingBookmarks ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <Box borderWidth={1} borderRadius="md">
            {bookmarks.map(bookmark => (
              <BookmarkItem 
                key={bookmark.id} 
                bookmark={bookmark} 
                onToggle={handleToggle}
              />
            ))}
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default BookmarksList;