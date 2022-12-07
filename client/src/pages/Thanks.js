// mui
import { 
  Container,
  Box,
  Typography
} from '@mui/material';
import Page from '../components/Page';

export default function Thanks(){
  return(
    <Page title="THANKS">
      <Container style={{textAlign:"center"}}>
        <Typography variant="h4" gutterBottom style={{ color:"#4b66ac", marginTop:"15vh"}}>
          Thank you for request.
        </Typography>
        <Box style={{ maxWidth:"76vw", marginLeft:"8vw"}}>
          <p>&nbsp;</p>
          <p><strong>Check you mailbox</strong></p>
          <p><br/>
            In your mailbox you will find the initial offer for the selected service.
          </p>
          <p>
            It is worth noting that the calculations are very approximate and can only be finalized after consultation with the doctor.
          </p>
          <p>
            If you confirm your interest by simply clicking on the appropriate button in the letter, the doctors of our clinic will soon consider your request in more detail and contact you for final consultations.
          </p>
          <p><br/>
            <strong>Best regards, Stunning You Clinic</strong>
          </p>
        </Box>
      </Container>
    </Page>
  )
}