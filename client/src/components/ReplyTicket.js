import React, { useState, useContext } from 'react';

import { useHttp } from '../hooks/http.hook'
import { Loader } from './Loader';

import Page from './Page';
import {
  Container, TextField, Grid, Button, Typography
} from '@mui/material';

import { AuthContext } from '../context/AuthContext'
import {API_URL} from '../config'


export default function ReplyTicket( {ticket, message, procedure, client}) {
  // console.log('info:', ticket, message, procedure, client)
  const {token} = useContext(AuthContext)

  const [note, setNote] = useState('')
  const [cost, setCost] = useState(procedure.cost)
  const {loading, request} = useHttp()
  // const navigate  = useNavigate()

  // const yesno = {'0' : 'No', '1' : 'Yes'}
  // const botox = {
  //   'botoxWhen' : {
  //     "0": "Never"       ,
  //     "1": "One Month"   ,
  //     "2": "Six months"  ,
  //     "3": "About a year",
  //   },
  //   'botoxWhat' : {
  //     "0" : "Allergan BTX",
  //     "1" : "Azalure"     ,
  //     "2" : "Bocoutur"    ,
  //     "3" : "Other"       ,
  //   }
  // }

  const sendRequest = () => {
    console.log('send request');
  }


  if (loading) return <Loader/>
  else {
    return (
      <Page title="Reply to the ticket">
        <Container sx={{ minWidth: 800 }}>
          <Grid item xs={12} sm={12} sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt:2 }}>
              {'In response to your request, we make this offer special to you.'}
            </Typography>
            <Grid item xs={12} sm={12} sx={{ mt: 2, mb: 2 }}>
              <Grid item xs={6} sm={6}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt:2, mb: 2 }} >
                  {'The procedure'} <strong>{procedure.procedure}</strong> {'will be cost:'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={6}>
                <TextField name="cost" fullWidth id="cost" value={cost} onChange={(e)=>{setCost(e.target.value)}} label="Cost" className='cons-input' sx={{ mb: 2 }}  xs={6} sm={6} />
              </Grid>
            </Grid>
            <TextField name="note" fullWidth multiline rows={4} id="note" value={note} onChange={(e)=>{setNote(e.target.value)}} label="Additional offer" className='cons-input' />
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 8 }} onClick={sendRequest}>Send</Button>
          </Grid>
        </Container>
      </Page>
    )
  }
}
