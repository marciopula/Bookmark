import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Heading, Text, VStack, Spinner, SimpleGrid, Card, CardBody,
  Button, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, IconButton, Flex, useToast,
  Container
} from '@chakra-ui/react';
import { MdLaptop, MdSmartphone, MdDesktopWindows, MdDelete, MdBookmark, MdAccessTime } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import DeviceRegistration from '../components/DeviceRegistration';

const Dashboard = () => {
  const { user, fetchDevices, deleteDevice } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const getDevices = useCallback(async () => {
    if (user) {
      setLoadingDevices(true);
      try {
        const fetchedDevices = await fetchDevices();
        setDevices(fetchedDevices);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch devices. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoadingDevices(false);
      }
    }
  }, [user, fetchDevices, toast]);

  useEffect(() => {
    if (user) {
      getDevices();
    }
  }, [user, getDevices]);

  const handleDeleteDevice = (device) => {
    setDeviceToDelete(device);
    onOpen();
  };

  const confirmDeleteDevice = async () => {
    if (deviceToDelete) {
      try {
        await deleteDevice(deviceToDelete.id);
        toast({
          title: "Device deleted",
          description: "The device and its associated bookmarks have been removed.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        getDevices();
      } catch (error) {
        console.error('Failed to delete device:', error);
        toast({
          title: "Error",
          description: "Failed to delete device. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getDeviceIcon = (deviceName) => {
    const lowerCaseName = deviceName.toLowerCase();
    if (lowerCaseName.includes('phone') || lowerCaseName.includes('mobile')) {
      return MdSmartphone;
    } else if (lowerCaseName.includes('desktop') || lowerCaseName.includes('work')) {
      return MdDesktopWindows;
    } else {
      return MdLaptop;
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Welcome back, {user.name}!</Heading>
          <Text fontSize="md" color="gray.600">
            You have {devices.length} device{devices.length !== 1 ? 's' : ''} connected.
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Your Devices</Heading>
          {loadingDevices ? (
            <Spinner />
          ) : devices.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {devices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.name);
                return (
                  <Card key={device.id} bg="blue.50" _hover={{ shadow: 'md' }} transition="box-shadow 0.2s">
                    <CardBody>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Flex align="center">
                          <DeviceIcon size={20} color="blue.500" />
                          <Heading size="sm" ml={2}>{device.name}</Heading>
                        </Flex>
                      </Flex>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        <MdAccessTime style={{ display: 'inline', marginRight: '4px' }} />
                        Last synced: {device.lastSynced || 'Never'}
                      </Text>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        <MdBookmark style={{ display: 'inline', marginRight: '4px' }} />
                        Bookmarks synced: {device.bookmarkCount || 0}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mb={2}>{device.deviceId}</Text>
                      <Flex justify="space-between" mt={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => navigate(`/bookmarks/${device.deviceId}`)}
                        >
                          View Bookmarks
                        </Button>
                        <IconButton
                          icon={<MdDelete />}
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDeleteDevice(device)}
                          aria-label="Delete device"
                        />
                      </Flex>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          ) : (
            <Card bg="gray.50" p={4}>
              <Text>No devices connected yet. Install our browser extension to start syncing.</Text>
            </Card>
          )}
        </Box>

        <Box>
          <Heading size="md" mb={4}>Register a New Device</Heading>
          <Card>
            <CardBody>
              <DeviceRegistration onDeviceRegistered={getDevices} />
            </CardBody>
          </Card>
        </Box>
      </VStack>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Device
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this device? This action cannot be undone and will also delete all bookmarks associated with this device.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteDevice} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default Dashboard;