import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { sentenceCase } from 'change-case'
// material
import {
  Avatar,
  Card,
  Table,
  Stack,
  Grid,
  Button,
  Box,
  Modal,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TextField,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
  MenuItem,
  TableContainer,
  TablePagination,
  Link,
  Tab,
  Tabs
} from '@mui/material'

import { useHttp } from '../../hooks/http.hook'
import { Loader } from '../../components/Loader';
import {API_URL} from '../../config'
import DocClient from './DocClient'
import { AuthContext } from '../../context/AuthContext'
// import NoteClient from './NoteClient'
// import Mail from './Mail'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


export default function UserDocs() {
  const {token} = useContext(AuthContext)
  function parseJwt (token) {
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  };
  const pJWT = parseJwt(token)
  const userId = pJWT.userId
  console.log('userdocs for: user', userId);

  const {loading, request} = useHttp()
  const params = useParams()
  const clientId = params.id

  const [client, setClient] = useState({})
  const [avatar, setAvatar] = useState(API_URL + 'blank-avatar.svg')

  const getClient = useCallback(async () => {
    try {
      const client = await request(`${API_URL}api/user/${clientId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setClient(client)
      setAvatar(API_URL + 'avatars/' + client.avatar)
      // console.log('Client:', client)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getClient()}, [getClient])

  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  }

  if (loading) return <Loader/>
  else return (
    <Card style={{padding:"30px"}}>
      <Grid container spacing={3} style={{paddingBottom:"30px"}}>
        <Grid item xs={1} sm={1}>
          <Avatar src={avatar} alt="client photo" />
        </Grid>
        <Grid item xs={10} sm={10}>
          <Typography component="h1" variant="h5" style={{paddingTop:"6px"}}>
            {sentenceCase(client.firstname || '')}&nbsp;{sentenceCase(client.lastname || '')}
          </Typography>
        </Grid>
      </Grid>
      
      {/* docs & notes */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleTabChange} aria-label="doc tabs">
          <Tab label="Documents" {...a11yProps(0)} />
          <Tab label="Notes" {...a11yProps(1)} />
          <Tab label="Comunications" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        <DocClient  clientId={clientId} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        Notes
        {/* <NoteClient clientId={clientId} /> */}
      </TabPanel>
      <TabPanel value={tab} index={2}>
        Mail
        {/* <Mail docId={userId} clientId={clientId} /> */}
      </TabPanel>

    </Card>
  )
}
