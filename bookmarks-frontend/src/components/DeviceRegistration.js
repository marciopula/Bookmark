import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DeviceRegistration = ({ onDeviceRegistered }) => {
  const [deviceName, setDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { checkToken } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const verifyToken = async () => {
      const isValid = await checkToken();
      console.log('Token validity:', isValid);
    };
    verifyToken();
  }, [checkToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const deviceId = generateDeviceId();
      console.log('Registering device:', { name: deviceName, deviceId });
      const token = localStorage.getItem('token');
      console.log('Token used for request:', token);
      const res = await axios.post('/api/devices', { name: deviceName, deviceId }, {
        headers: { 'x-auth-token': token }
      });
      console.log('Device registration response:', res.data);
      toast({
        title: "Device registered successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setDeviceName('');
      if (onDeviceRegistered) {
        onDeviceRegistered();
      }
    } catch (error) {
      console.error('Device registration error:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: "Failed to register device",
        description: error.response?.data?.msg || "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="deviceName" isRequired>
            <FormLabel>Device Name</FormLabel>
            <Input 
              type="text" 
              value={deviceName} 
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Enter device name"
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>
            Register Device
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default DeviceRegistration;

function generateDeviceId() {
  return 'device-' + Math.random().toString(36).substr(2, 9);
}