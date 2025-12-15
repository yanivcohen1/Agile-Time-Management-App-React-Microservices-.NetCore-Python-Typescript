import React from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import { Box, Typography, Switch, FormControlLabel, Button, Divider } from '@mui/material';
import { useAdmin } from '../context/AdminContext';

const AdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdminSwitchOn, toggleAdminSwitch } = useAdmin();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Page
      </Typography>
      <Typography variant="h6">
        Query ID: {id}
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isAdminSwitchOn}
              onChange={toggleAdminSwitch}
              name="adminSwitch"
            />
          }
          label="Admin Switch"
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button 
          component={Link} 
          to={`/admin/${id}/console/2?name=yan&last=con`}
          variant="contained"
        >
          Go to Console
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />
      
      <Outlet />
    </Box>
  );
};

export default AdminPage;
