import React, { useState, useContext } from 'react';

import { useHttp } from '../hooks/http.hook'
import { Loader } from './Loader';

import Page from './Page';
import {
  Container, TextField, Grid, Button, Typography
} from '@mui/material';

import { AuthContext } from '../context/AuthContext'
import {API_URL} from '../config'


export default function ReplyTicketPWA( {ticket, message, procedure, client}) {
  // console.log('info:', ticket, message, procedure, client)
  const {token} = useContext(AuthContext)

  const [note, setNote] = useState('')
  
  const {loading, request} = useHttp()
  
  const sendRequest = () => {
    console.log('send request');
  }


  if (loading) return <Loader/>
  else {
    return (
      <Page title="Reply to the ticket">
        <Container sx={{ width: "100%" }} >
          <Grid item xs={12} sm={12} sx={{ mt: 3 }} >
            <TextField name="note" fullWidth multiline rows={8} id="note" value={note} onChange={(e)=>{setNote(e.target.value)}} label="Message" className='cons-input' />
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 8 }} onClick={sendRequest} className="c-button">Send</Button>
          </Grid>
        </Container>
      </Page>
    )
  }
}
