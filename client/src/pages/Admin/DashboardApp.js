import React from 'react';
import { Grid, Container, Typography } from '@mui/material';
// components
import Page from '../../components/Page';
// sections
import AppNewLead from '../../sections/@dashboard/app/AppNewLead';

// ----------------------------------------------------------------------

export default function DashboardApp() {

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          {'Dashboard'}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="body">
              {'Leads: last 10 days'}
            </Typography>
            <AppNewLead days={'10'} color={'#8884d8'} />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="body">
              {'Leads: last 30 days'}
            </Typography>
            <AppNewLead days={'30'} color={'#ffb1c1'} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
