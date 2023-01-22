import React from 'react'
import { useParams } from 'react-router-dom'
// material
import {
  Card,
  Stack,
  Container,
  Typography,
} from '@mui/material'
// components
import Page         from '../../components/Page'
import InboxClient  from '../../components/InboxClient'

// ----------------------------------------------------------------------


export default function LoyaltyClient(){
  const params = useParams();
  const clientId = params.id;

  return(
    <Page title="Loyalty Client">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Loyalty program
          </Typography>  
        </Stack>
    
        <Card>
          <InboxClient clientId={clientId}/>
        </Card>
      </Container>
    </Page>
  )
}