import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
// import { Box, Link, Button, Drawer, Typography, Avatar, Stack } from '@mui/material';
import { Box, Link, Drawer, Typography, Avatar, Button, Modal, Container, Grid, Card } from '@mui/material';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Logo from '../../components/Logo';
import Scrollbar from '../../components/Scrollbar';
import NavSection from '../../components/NavSection';
//
import navConfig from './NavConfig';

import { UserBage } from '../UserBage';
import Webcam from 'react-webcam'
const WebcamComponent = () => <Webcam />
const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
}

// ----------------------------------------------------------------------

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    width: DRAWER_WIDTH,
  },
}));

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12],
}));

// ----------------------------------------------------------------------

DashboardSidebar.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
};

export default function DashboardSidebar({ isOpenSidebar, onCloseSidebar }) {
  const { pathname } = useLocation();
  const isDesktop = useResponsive('up', 'lg');
  const [scan, setScan] = useState(false);
  const [procedureOpen, setProcedureOpen] = useState(false);
  const [status, setStatus] = useState(0);

  const [picture, setPicture] = useState('')
  const webcamRef = React.useRef(null)
  const capture = React.useCallback(() => {
    const pictureSrc = webcamRef.current.getScreenshot()
    setPicture(pictureSrc)
  })

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
  }, [pathname]);

  const handleProcedure = () => {
    setScan(false);
    setTimeout(()=>{setProcedureOpen(true)}, 500);
  }

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>
      <UserBage />
      <NavSection navConfig={navConfig} />

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{
        position: "absolute",
        bottom: 50,
        left: 20
      }}>
        <Button variant="contained" onClick={()=>{setScan(true)}}>Scan QR</Button>
      </Box>

      {/* Event window */}
      <Modal
        open={scan}
        onClose={()=>{setScan(false)}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="modal-tt">
            <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Card>
                {picture === '' ? (
                  <Webcam
                    audio={false}
                    height={400}
                    ref={webcamRef}
                    width={400}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                  />
                ) : (
                  <img src={picture} />
                )}
              </Card>
              <div>
                {picture !== '' ? (
                  <Button variant="outlined" sx={{ mt: 3 }}
                    onClick={(e) => {
                      e.preventDefault()
                      setPicture('')
                    }}
                  >
                    Retake
                  </Button>
                ) : (
                  <>
                    <Button variant="outlined" sx={{ mt: 3 }}
                      onClick={(e) => {
                        e.preventDefault()
                        capture()
                      }}
                    >
                      Capture
                    </Button>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={handleProcedure}>
                      Scan
                    </Button>
                  </>
                )}
              </div>
            </Box>
          </div>
        </Container>
      </Modal>

      {/* Procedure window */}
      <Modal
        open={procedureOpen}
        onClose={()=>{setProcedureOpen(false)}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="modal-tt">
            <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Grid container>
                <Grid item xs={12} sm={9}>
                  <Box className='tt_title'> 
                    Procedure:<br /><strong>BTX-A treatment</strong> <br /> <br /> 
                    Patient:<br /><strong>Vladimir Manzhos</strong> <br /> <br /> 
                    Start:<br /><strong>10 Jan 2023 at 11:00</strong> <br /> 
                    End:<br /><strong>10 Jan 2023 at 12:00</strong>
                  </Box>            
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button fullWidth variant={status === 0 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(1)}}>
                    Check In
                  </Button>
                  <Button fullWidth variant={status === 1 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(2)}}>
                    Log In
                  </Button>
                  <Button fullWidth variant={status === 2 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(3)}}>
                    Log Out
                  </Button>
                  <Button fullWidth variant={status === 3 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(4)}}>
                    Check Out
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </div>
        </Container>
      </Modal>

    </Scrollbar>
  );

  return (
    <RootStyle>
      {!isDesktop && (
        <Drawer
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{
            sx: { width: DRAWER_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
