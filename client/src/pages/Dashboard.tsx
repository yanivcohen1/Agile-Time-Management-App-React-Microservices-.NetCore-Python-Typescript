import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Stack, useTheme } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import api from '../api/axios';

interface StatusStats {
  BACKLOG: number;
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

interface WorkloadStat {
  _id: string; // Date string YYYY-MM-DD
  total: number;
  backlog: number;
  pending: number;
  in_progress: number;
  completed: number;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [statusStats, setStatusStats] = useState<StatusStats | null>(null);
  const [workloadStats, setWorkloadStats] = useState<WorkloadStat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, workloadRes] = await Promise.all([
          api.get('/todos/stats/status'),
          api.get('/todos/stats/workload')
        ]);
        setStatusStats(statusRes.data);
        setWorkloadStats(workloadRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

    const handleTodoCreated = () => {
      fetchData();
    };

    window.addEventListener('todo-created', handleTodoCreated);

    return () => {
      window.removeEventListener('todo-created', handleTodoCreated);
    };
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  };

  const statusOrder = ['BACKLOG', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Main Status Board</Typography>
      
      {/* Image 1: Status Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {statusStats && statusOrder.map((status) => (
          <Grid item xs={12} sm={6} md={3} key={status}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {formatStatus(status)}
                </Typography>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {statusStats[status as keyof StatusStats] || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>Dates by workload</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
          {/* Image 2: Workload List */}
          <Stack spacing={2}>
            {workloadStats.map((stat) => (
              <Paper key={stat._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{formatDate(stat._id)}</Typography>
                    <Typography variant="body2" color="textSecondary">{stat.total} task{stat.total !== 1 ? 's' : ''}</Typography>
                  </Box>
                  <Chip label={`${stat.total} total`} variant="filled" />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={`Backlog ${stat.backlog}`} variant="outlined" />
                  <Chip label={`Pending ${stat.pending}`} variant="outlined" sx={{ color: 'warning.main', borderColor: 'warning.main' }} />
                  <Chip label={`In progress ${stat.in_progress}`} variant="outlined" sx={{ color: 'info.main', borderColor: 'info.main' }} />
                  <Chip label={`Completed ${stat.completed}`} variant="outlined" sx={{ color: 'success.main', borderColor: 'success.main' }} />
                </Box>
              </Paper>
            ))}
            {workloadStats.length === 0 && (
              <Typography color="textSecondary">No workload data available</Typography>
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
          {/* Chart */}
          {workloadStats.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, height: 400 }}>
                <BarChart
                    dataset={workloadStats}
                    xAxis={[{ scaleType: 'band', dataKey: '_id', valueFormatter: (v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }]}
                    series={[
                        { dataKey: 'backlog', label: 'Backlog', stack: 'total', color: theme.palette.grey[500] },
                        { dataKey: 'pending', label: 'Pending', stack: 'total', color: theme.palette.warning.main },
                        { dataKey: 'in_progress', label: 'In Progress', stack: 'total', color: theme.palette.info.main },
                        { dataKey: 'completed', label: 'Completed', stack: 'total', color: theme.palette.success.main },
                    ]}
                    height={350}
                    slotProps={{ legend: { hidden: false } }}
                    margin={{ left: 40, right: 40, top: 40, bottom: 40 }}
                />
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
