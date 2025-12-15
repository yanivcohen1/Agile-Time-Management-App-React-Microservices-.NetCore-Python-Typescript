import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';
import { useAdmin } from '../context/AdminContext';

const AdminConsolePage: React.FC = () => {
  const { id, consoleId } = useParams<{ id: string; consoleId: string }>();
  const [searchParams] = useSearchParams();
  const { isAdminSwitchOn, toggleAdminSwitch } = useAdmin();

  const name = searchParams.get('name');
  const last = searchParams.get('last');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Console Page
      </Typography>
      <Typography variant="h6">
        Admin ID: {id}
      </Typography>
      <Typography variant="h6">
        Console ID: {consoleId}
      </Typography>
      <Typography variant="body1">
        Params: name={name}, last={last}
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isAdminSwitchOn}
              onChange={toggleAdminSwitch}
              name="adminConsoleSwitch"
            />
          }
          label="Admin Console Switch (Synced)"
        />
      </Box>
    </Box>
  );
};

export default AdminConsolePage;
