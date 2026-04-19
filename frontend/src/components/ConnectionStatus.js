import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { Close, Wifi, WifiOff } from '@mui/icons-material';
import { healthCheck } from '../services/api';

const ConnectionStatus = () => {
  const [open, setOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check connection on mount
    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    try {
      await healthCheck();
      if (!isConnected) {
        setIsConnected(true);
        setMessage('Connected to backend server');
        setOpen(true);
      }
    } catch (error) {
      if (isConnected) {
        setIsConnected(false);
        setMessage('Cannot connect to backend server. Please ensure it is running on http://localhost:8000');
        setOpen(true);
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={isConnected ? 'success' : 'error'}
        icon={isConnected ? <Wifi /> : <WifiOff />}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ConnectionStatus;
