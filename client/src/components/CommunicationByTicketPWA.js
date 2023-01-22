import React, { useState, useRef } from 'react';
// material
import { 
  Menu, 
  MenuItem, 
  IconButton, 
  ListItemIcon, 
  ListItemText,
  Grid,
  Button,
  Box,
  Modal,
  Container,
  Typography,
 } from '@mui/material';
import Iconify from './Iconify';
import InboxTicketPWA from './InboxTicketPWA';
import ReplyTicketPWA from './ReplyTicketPWA';


export default function CommunicationByTicketPWA({ticket, message, procedure, client}) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [openAnswer, setAnswerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setOpen(true)
  const handleAnswerOpen = () => setAnswerOpen(true)
  const handleClose = () => setOpen(false)
  const handleAnswerClose = () => setAnswerOpen(false)

  const handleSend = () => {
    // console.log('send');
    handleAnswerClose();
  }

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleAnswerOpen}>
          <ListItemIcon>
            <Iconify icon="material-symbols:send-rounded" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Answer" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleOpen}>
          <ListItemIcon>
            <Iconify icon="material-symbols:wifi-find-rounded" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Filter by ticket" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
      
      {/* answer */}
      <Modal
        open={openAnswer}
        onClose={handleAnswerClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="login-modal" style={{ margin:"20px", padding:"30px 0"}}>
            <Box
              sx={{
                // marginTop: 8,
                // display: 'flex',
                // flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5" style={{ textAlign:"center"}}>
                {'Reply to the ticket'}
              </Typography>
              <p style={{ textAlign:"center"}}>{ticket}</p>
              <ReplyTicketPWA ticket={ticket} client={client} admin={null} onSend={handleSend} />
            </Box>
          </div>
        </Container>
      </Modal>

      {/* communication flow */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="login-modal" style={{margin:"20px", maxHeight:"85vh"}}>
            <Box
              sx={{
                // marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Grid container>
                <Grid item xs={8} sm={8}>
                  <h4>{'Ticket'}</h4>
                  <p><strong>#{ticket}</strong></p>
                </Grid>
                <Grid item xs={4} sm={4} style={{textAlign:"right"}}>
                  <Button variant="outlined" size="small" onClick={()=>{
                                                            handleClose();
                                                            handleAnswerOpen();
                                                            }}
                  >
                    {'New'}
                  </Button>
                </Grid>
              </Grid>
              <InboxTicketPWA ticket={ticket} />
            </Box>
          </div>
        </Container>
      </Modal>
    </>
  );
}
