import React, { useState } from "react";
// material
import {
  Grid,
  Modal,
  Container,
  Typography,
  Button
} from '@mui/material';
// import Scrollbar from "./Scrollbar";

export default function Confirm({confirmData, response}){
  // const [open, setOpen] = useState(confirmData.open)
  // const [message, setMessage] = useState(confirmData.message)
  
  return (
    <Modal
      open={confirmData.open}
      // onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Container 
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div className="comfirm-modal">
          <Grid container className="flex-center">
            <Typography>
              {confirmData.message}
            </Typography>
          </Grid>
          <Grid container sx={{ mt: 3 }} className="flex-center">
            <Button variant="outlined" onClick={()=>{response(true)}}>Yes</Button>
            <Button variant="outlined" onClick={()=>{response(false)}} sx={{ ml:3 }}>No</Button>
          </Grid>
        </div>
      </Container>
    </Modal>
  )
}