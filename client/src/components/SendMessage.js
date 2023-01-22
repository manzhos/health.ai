import React, { useState, useContext } from 'react';

import { useHttp } from '../hooks/http.hook'
import { Loader } from './Loader';

import Page from './Page';
import {
  Container, TextField, Box, Button
} from '@mui/material';

import { AuthContext } from '../context/AuthContext'
import {API_URL} from '../config'


export default function ReplyTicketPWA( {ticket, client, admin_id, onSend}) {
  // console.log('info:', ticket, client, admin_id)
  const {token} = useContext(AuthContext)

  const [note, setNote] = useState('')
  
  const {loading, request} = useHttp()
  
  const sendRequest = async () => {
    try {
      const res = await request(`${API_URL}api/convmessage`, 'POST', {
        'clientId': client ? client.id : null,
        'adminId' : admin_id ? admin_id : null,
        'ticket'  : ticket,
        'body':{
          'clientMessage' : client    ? note : null,
          'adminMessage'  : admin_id  ? note : null,
        }
      })
      console.log(res);      
      onSend();
    }catch(e){
      console.log('Error:', e);
    }
  }


  if (loading) return <Loader/>
  else {
    return (
      <Page title="Reply to the ticket">
        <Container>
          <Box sx={{mt:3}}>
            <TextField name="note" fullWidth multiline rows={8} id="note" value={note} onChange={(e)=>{setNote(e.target.value)}} label="Message" className='cons-input' />
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 3 }} onClick={sendRequest} className="c-button">{'Send'}</Button>
          </Box>
        </Container>
      </Page>
    )
  }
}
