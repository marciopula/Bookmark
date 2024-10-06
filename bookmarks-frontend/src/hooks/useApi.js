import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const callApi = useCallback(async (method, url, data = null, headers = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token'); // or however you're storing the token
      const authHeaders = token ? { ...headers, 'x-auth-token': token } : headers;
      console.log('API Request:', { method, url, data, headers: authHeaders }); // Log request details
      const response = await axios({ method, url, data, headers: authHeaders });
      console.log('API Response:', response.data); // Log response data
      return response.data;
    } catch (err) {
      console.error('API Error:', err.response ? err.response.data : err.message); // Log detailed error
      setError(err.response?.data?.message || 'An error occurred');
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { loading, error, callApi };
};

export default useApi;