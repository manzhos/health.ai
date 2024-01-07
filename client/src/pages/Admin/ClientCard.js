import React, {useState} from "react"

import {
  Container,
  Button,
  Grid,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material'

import Booking from "../../components/Booking"
import Gallery from "../../components/Gallery"

export default function ClientCard({openClientCard, user, closeClientCard}){
  // console.log('user >>>', user)
  const [tabValue, setTabValue] = useState(0)
  const [activeGrid, setActiveGrid] = useState('procedures')

  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  function tabProps(index) {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  }

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  }

  return(
    <div style={{ 
        display: openClientCard ? "block" : "none",
        height: "100vh",
        width: "95vw",
        background: "floralwhite",
        position: "absolute",
        zIndex: 1250,
        top: 0,
        right: 0,
        boxShadow: "-15px 0px 15px -3px rgba(0,0,0,0.1)"
      }}
    >
      <Button 
        onClick={()=>{closeClientCard()}}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1260,
        }}
        variant="outlined"
        size="small"
      >
        Close
      </Button>
      <Grid container>
        <Grid item xs={12} sm={3} style={{ padding: "30px" }}>
          <Typography variant="h5">{user?.firstname}</Typography>
          <Typography variant="h5" sx={{ mb:2 }}>{user?.lastname}</Typography>
          <Box sx={{ borderTop: 1, borderColor: 'divider' }}></Box>
          <p style={{ marginTop:"15px"}}>{user?.email}</p>
          <p>{user?.phone?.replace(/^\+?(\d{2})(\d{3})(\d{3})(\d{3})$/, '+($1) $2-$3-$4')}</p>
          {/* <p>{'Address'}</p> */}
          <Box sx={{ borderTop: 1,  borderColor: 'divider', mt: 6 }}>
            <Typography variant="h6" sx={{ mt:5, ml:1, cursor:"pointer" }} onClick = { ()=>{ setActiveGrid('procedures') }}>Procedures</Typography>
            <Typography variant="h6" sx={{ mt:3, ml:1, cursor:"pointer" }} onClick = { ()=>{ setActiveGrid('documents') }}>Documents</Typography>
          </Box>
        </Grid>
        { activeGrid === 'procedures' &&
          <Grid item xs={12} sm={9} style={{ height:"100vh", padding: "30px", background:"white"}}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleChangeTab}>
                    <Tab label="Bookings"   {...tabProps(0)} />
                    <Tab label="Procedures" {...tabProps(1)} />
                    <Tab label="Payments"   {...tabProps(2)} />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <Booking clientId={user?.id} client={user} mode={false} />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Booking clientId={user?.id} client={user} mode={true} />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                {'Data in Payments tabs coming soon...'}
              </TabPanel>
            </Box>
          </Grid>
        }
        { activeGrid === 'documents' &&
          <Grid item xs={12} sm={9} style={{ height:"100vh", padding: "30px", background:"white"}}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleChangeTab}>
                    <Tab label="Gallery"   {...tabProps(0)} />
                    <Tab label="Documents" {...tabProps(1)} />
                </Tabs>
              </Box>
              <TabPanel value = {tabValue} index = {0}>
                <Gallery user = {user} />
              </TabPanel>
              <TabPanel value = {tabValue} index = {1}>
                {'Documents'}
              </TabPanel>
            </Box>
          </Grid>
        }
      </Grid>
    </div>
  )
}