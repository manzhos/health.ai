import React, { useState, useRef } from 'react';
// material
import { 
  Menu, 
  MenuItem, 
  IconButton, 
  ListItemIcon, 
  ListItemText,
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
          <div className="login-modal" style={{margin:"20px"}}>
            <Box
              sx={{
                // marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5">
                Reply to the ticket
              </Typography>
              <p style={{ textAlign:"center"}}>{ticket}</p>
              <ReplyTicketPWA ticket={ticket} message={message} procedure={procedure} client={client} />
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
          <div className="login-modal" style={{margin:"20px"}}>
            <Box
              sx={{
                // marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5">
                Communication by ticket 
                #{ticket}
              </Typography>
              <InboxTicketPWA ticket={ticket} />
            </Box>
          </div>
        </Container>
      </Modal>
    </>
  );
}
