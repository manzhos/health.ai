import React, {useState} from 'react'
// mui
import { 
  Container,
  Box,
  Card,
  TextField,
  Typography,
  Grid,
  Button
} from '@mui/material';

export default function ClientInvoice(){
  const [points, setPoints] = useState(144000);

  return(
    <Container style={{textAlign:"center"}}>
      <Grid container>
        <Grid item xs={12} sm={12}>
          <Card sx={{ mb:3, padding:"30px;" }}>
            <Typography component="h1" variant="h5" style={{paddingTop:"6px"}}>
              <strong>Vlad Man</strong> has <strong>997200</strong> points.
            </Typography>
            <Typography component="body" variant="body" style={{paddingTop:"6px"}}>
              It is possible to use a maximum of 144000 points for partial payment of this invoice
            </Typography>
            <Typography component="h5" variant="h5" style={{paddingTop:"6px"}}>
              Use
            </Typography>
            <TextField id="points" label="Points" name="age" type='number' value={points} onChange={(e)=>{setPoints(e.target.value)}} className='cons-input' />
            <Typography component="h5" variant="h5" style={{paddingTop:"6px"}}>
              for this invoice.
            </Typography>
            <Button id='setPoints' onClick={(e) => console.log(e)} variant='contained' sx={{ mt:3, mb:3 }}>Ok</Button>
          </Card>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Card style={{textAlign:"center", background:'darkgrey' }}>
            <Box style={{ padding:"4vw" }}>
              <img src="/static/docs/inv_proc_2---08-01-2023.jpg" />
            </Box>
          </Card>
        </Grid>

      </Grid>
      
      
    </Container>
  )
}