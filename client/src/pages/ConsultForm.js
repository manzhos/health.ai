import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { 
  Container,
  Box,
  Grid,
  TextField,
  FormControl,
  Typography,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Button,
  Divider
} from '@mui/material'
// import Iconify from '../components/Iconify';

import ProcedureType      from '../components/ProcedureType'
import ProcedureList      from '../components/ProcedureList'
import AddFile            from '../components/AddFile'
import BreastAugmentation from '../components/ConsForm/BreastAugmentation'
import Sculptra           from '../components/ConsForm/Sculptra'
import Co2                from '../components/ConsForm/Co2'
import PWAMenu            from '../components/PWAMenu'
import { AuthContext }    from '../context/AuthContext'
import {API_URL} from '../config'
import { useHttp } from '../hooks/http.hook'


export default function ConsultForm(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const {token}   = useContext(AuthContext)

  function parseJwt (token) {
    if(token && token !== ''){
      var base64Url = token.split('.')[1]
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    }
  };
  const pJWT = parseJwt(token)
  const userId = pJWT ? pJWT.userId : null
  // console.log('userId:', userId);

  const [files, setFiles] = useState()
  const [age, setAge] = useState(18)
  const [note, setNote] = useState('')
  const [confirm, setConfirm] = useState(true)
  const [surgical, setSurgical] = useState('non-surgical')
  const [procedureTypeId, setProcedureTypeId] = useState(4)
  const [procedureId, setProcedureId] = useState(0)
  const [botoxWhen, setBotoxWhen] = useState(0)
  const [botoxWhat, setBotoxWhat] = useState(3)
  const [migren, setMigren] = useState(1)
  const [allergy, setAllergy] = useState(1)
  const [autoimmune, setAutoimmune] = useState(1)
  const [pregnant, setPregnant] = useState(1)
  const [detail, setDetail] = useState({})
  
  useEffect(() => {
    if(surgical === 'non-surgical') setProcedureTypeId(4)
    else setProcedureTypeId(1)
  }, [surgical])

  const handleProcedureTypeChange = (newProcedureTypeId) => {
    setProcedureTypeId(newProcedureTypeId)
  }

  const handleProcedureChange = (newProcedureId) => {
    setProcedureId(newProcedureId)
  }

  useEffect(()=>{
    setDetail({
      'botoxWhen' : botoxWhen,
      'botoxWhat' : botoxWhat,
      'migren'    : migren,
      'allergy'   : allergy,
      'autoimmune': autoimmune,
      'pregnant'  : pregnant,
    });  
  },[botoxWhen, botoxWhat, migren, allergy, autoimmune, pregnant])  

  const handleBreastAugmentation = (newBSNow, newBSWant, newBShape, newBPtosis, newBdisease) => {
    // console.log('newBSNow, newBSWant, newBShape:', newBSNow, newBSWant, newBShape);
    setDetail({
      'breastSizeNow' : newBSNow,
      'breastSizeWant': newBSWant,
      'breastShape'   : newBShape,
      'breastPtosis'  : newBPtosis,
      'breastDisease' : newBdisease,
    })
  }

  const handleSculptra = (newSculptraAutoimmune, newSculptraLocalReaction, newSculptraPregnant, newSculptraEdema) => {
    setDetail({
      'sculptraAutoimmune'    : newSculptraAutoimmune,
      'sculptraLocalReaction' : newSculptraLocalReaction,
      'sculptraPregnant'      : newSculptraPregnant,
      'sculptraEdema'         : newSculptraEdema,
    })
  }

  const handleCo2 = (newCo2Akne, newCo2Rosacea, newCo2Tatoo, newCo2Burns, newCo2LightSensitivity, newCo2Pigmentation) => {
    setDetail({
      'co2Akne'             : newCo2Akne,
      'co2Rosacea'          : newCo2Rosacea,
      'co2Tatoo'            : newCo2Tatoo,
      'co2Edema'            : newCo2Burns,
      'co2LightSensitivity' : newCo2LightSensitivity,
      'co2Pigmentation'     : newCo2Pigmentation,
    })
  }

  const handlerFileChange = (files) => {
    setFiles(files)
  }

  const sendRequest = async () => {
    // console.log('send request');
    try {
      const res = await request(`${API_URL}api/message`, 'POST', {
        'clientId': userId,
        'body':{
          'procedureTypeId': procedureTypeId,
          'procedureId': procedureId,
          'detail': detail,
        },
        'note':note,
        'age':age,
      })
      // console.log(res);
      navigate('/thanks')
    } catch (e) {
      console.log('error:', e);
      alert('Something wrong.');
    } 

  }

  return(
    <Container style={{textAlign:"center"}}>
      <PWAMenu />
      <div className='logo-block'>
        <div className='logo-consult-form'>
          <img
            src="../static/sy_logo.svg"
            alt="Stunning You"
            loading="lazy"
          />
        </div>
      </div>
      <div className='consult-form'>
        <Box sx={{ mt: 7 }}>
          <Grid container>
            <Grid item xs={12} sm={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 1 }}>&nbsp;</Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb:3 }}>
                {'Book the consultation'}
              </Typography>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid container item xs={10} sm={10} spacing={6}>
              <Grid item xs={12} sm={12}>
                <Typography variant="h2" sx={{ color: 'text.secondary' }}>
                  Hello
                  {/* {nameClient} */}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt:2, mb:3 }}>
                  {'Which procedure are you interested in?'}
                </Typography>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={1} sm={1}>&nbsp;</Grid>
              <Grid item xs={10} sm={10}>
                <Grid item xs={12} sm={12}>
                  <FormControl>
                    {/* <FormLabel id="surgery-radio-buttons-group">Choose the type of service</FormLabel> */}
                    <RadioGroup row aria-labelledby="surgery-radio-buttons-group" name="surgery" defaultValue="non-surgical">
                      <FormControlLabel value="surgical"      control={<Radio size="small" />}  label="Medical" onChange={(e)=>{setSurgical(e.target.value)}} />
                      <FormControlLabel value="non-surgical"  control={<Radio size="small" />}  label="Estetic" onChange={(e)=>{setSurgical(e.target.value)}} sx={{ml: 4}} />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid container spacing={2} sx={{ mt: 2 }} justifyContent="center" alignItems="center" >
                  { surgical === 'surgical' &&
                    <Grid item xs={12} sm={6}>
                      <ProcedureType onChangeProcedureType={handleProcedureTypeChange} />
                      {/* procedureType now: {procedureTypeId} */}
                    </Grid>
                  }
                  <Grid item xs={12} sm={6}>
                    <ProcedureList procedureTypeId={procedureTypeId} onChangeProcedure={handleProcedureChange} />
                    {/* procedure now: {procedureId} */}
                  </Grid>
                </Grid>
                { procedureId === 1 &&
                  <Grid container spacing={2} sx={{ mt: 2, mb: 3 }} justifyContent="center">
                    <Grid item xs={12} sm={6}>
                      <FormControl>
                        <FormLabel id="botox-when">When was the last time you had the procedure?</FormLabel>  
                        <RadioGroup row aria-labelledby="botox-when" name="botox-when" defaultValue="0">
                          <FormControlLabel value="0" control={<Radio size="small" />}  label="Never"        onChange={(e)=>{setBotoxWhen(e.target.value)}} className="cons-radio"/>
                          <FormControlLabel value="1" control={<Radio size="small" />}  label="One Month"    onChange={(e)=>{setBotoxWhen(e.target.value)}} className="cons-radio"/>
                          <FormControlLabel value="2" control={<Radio size="small" />}  label="Six months"   onChange={(e)=>{setBotoxWhen(e.target.value)}} className="cons-radio"/>
                          <FormControlLabel value="3" control={<Radio size="small" />}  label="About a year" onChange={(e)=>{setBotoxWhen(e.target.value)}} className="cons-radio"/>
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    { Number(botoxWhen) !== 0 &&
                      <Grid item xs={12} sm={6}>
                        <FormControl sx={{ mt: 2 }}>
                          <FormLabel id="botox-what">What drug was used for the procedure?</FormLabel>  
                          <RadioGroup row aria-labelledby="botox-what" name="botox-what">
                            <FormControlLabel value="0" control={<Radio size="small" />}  label="Allergan BTX"  onChange={(e)=>{setBotoxWhat(e.target.value)}} className="cons-radio"/>
                            <FormControlLabel value="1" control={<Radio size="small" />}  label="Azalure"       onChange={(e)=>{setBotoxWhat(e.target.value)}} className="cons-radio"/>
                            <FormControlLabel value="2" control={<Radio size="small" />}  label="Bocoutur"      onChange={(e)=>{setBotoxWhat(e.target.value)}} className="cons-radio"/>
                            <FormControlLabel value="3" control={<Radio size="small" />}  label="Other"         onChange={(e)=>{setBotoxWhat(e.target.value)}} className="cons-radio"/>
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    }
                    
                    {/* headpain */}
                    <Grid item xs={12} sm={6}>
                      <FormControl sx={{ mt: 2 }}>
                        <FormLabel id="botox-what">Have a migraine or chronic headaches?</FormLabel>  
                        <RadioGroup row aria-labelledby="botox-what" name="botox-what" defaultValue="1">
                          <FormControlLabel value="0" control={<Radio size="small" />}  label="Yes"  onChange={(e)=>{setMigren(e.target.value)}} className="cons-radio"/>
                          <FormControlLabel value="1" control={<Radio size="small" />}  label="No"   onChange={(e)=>{setMigren(e.target.value)}} className="cons-radio"/>
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* allergy */}
                    <Grid item xs={12} sm={6}>
                      <FormControl sx={{ mt: 2 }}>
                        <FormLabel id="botox-what">Are there any allergies to medications?</FormLabel>  
                        <RadioGroup row aria-labelledby="botox-what" name="botox-what" defaultValue="1">
                          <FormControlLabel value="0" control={<Radio size="small" />}  label="Yes"  onChange={(e)=>{setAllergy(e.target.value)}} className="cons-radio"/>
                          <FormControlLabel value="1" control={<Radio size="small" />}  label="No"   onChange={(e)=>{setAllergy(e.target.value)}} className="cons-radio"/>
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* autoimmune */}
                    <Grid item xs={6} sm={6}>
                      <FormControl sx={{ mt: 2 }}>
                        <FormLabel id="autoimmune">Autoimmune</FormLabel>  
                        <RadioGroup aria-labelledby="autoimmune" name="autoimmune" defaultValue="0">
                          <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setAutoimmune(e.target.value)}} className="cons-radio"/>
                          <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setAutoimmune(e.target.value)}} className="cons-radio"/>
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* pregnant */}
                    <Grid item xs={6} sm={6}>
                      <FormControl sx={{ mt: 2 }}>
                        <FormLabel id="pregnant">Pregnant</FormLabel>  
                        <RadioGroup aria-labelledby="pregnant" name="pregnant" defaultValue="0">
                          <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setPregnant(e.target.value)}} className="cons-radio"/>
                          <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setPregnant(e.target.value)}} className="cons-radio"/>
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  
                  </Grid>
                }
                { [32,33,34,35,36,37,39,40,41,44].filter(item => item === procedureId).length > 0 &&
                  <>
                    <BreastAugmentation onChangeBreastAugmentation={handleBreastAugmentation} />
                  </>
                }
                { [55].filter(item => item === procedureId).length > 0 &&
                  <>
                    <Sculptra onChangeSculptra={handleSculptra} />
                  </>
                }
                { [56].filter(item => item === procedureId).length > 0 &&
                  <>
                    <Co2 onChangeCo2={handleCo2} />
                  </>
                }

                {/* add file */}
                { Number(procedureId) !== 0 &&
                  <>
                    <Divider sx={{ mt: 4 }} />
                    <Grid container sx={{ mt: 4 }}>
                      { Object.keys(detail).length > 0 &&
                        <>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt:2, mb:1 }}>
                            {'For a more detailed calculation, add photos'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt:0 }}>
                            Check out the <a href="#">guide</a> before.
                          </Typography>
                        </>
                      }
                      
                      <AddFile onFileChange={handlerFileChange}/>
                      <Grid item xs={12} sm={12}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1, mb: 3 }}>&nbsp;</Box>
                      </Grid>
                    </Grid>
                  </>
                }

                { Number(procedureId) !== 0 &&
                  <>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb:1 }}>
                      {'Add some detail about yourself'}
                    </Typography>

                    <Grid item xs={12} sm={12} sx={{ mt: 3 }}>
                      <TextField name="note" fullWidth multiline rows={4} id="note" value={note} onChange={(e)=>{setNote(e.target.value)}} label="Medications you are taking" className='cons-input' />
                    </Grid>
                    <Grid item xs={12} sm={12}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1, mb: 3 }}>&nbsp;</Box>
                    </Grid>                

                    <Grid container item xs={12} sm={12} spacing={5} alignItems="center" >
                      <Grid item xs={4} sm={4}>
                        <TextField fullWidth id="age" label="Age" name="age" type='number' value={age} onChange={(e)=>{setAge(e.target.value)}} className='cons-input' />
                      </Grid>
                      <Grid item xs={8} sm={8} style={{ textAlign:"left"}}>
                        <FormControlLabel
                          control={<Checkbox name="confirm" value="confirm" onChange={()=>{setConfirm(!confirm)}} color="primary" defaultChecked />}
                          label="I confirm terms"
                        />
                      </Grid>
                      
                      {/* <Grid item xs={8} sm={8}>
                        <FormControl>
                          <FormLabel id="set-sex-radio-buttons-group">Set your sex</FormLabel>  
                          <RadioGroup row aria-labelledby="set-sex-radio-buttons-group" name="set_sex" defaultValue="female">
                            <FormControlLabel value="female"  control={<Radio size="small" />}  label="Female" onChange={(e)=>{setSex(e.target.value)}}/>
                            <FormControlLabel value="male"    control={<Radio size="small" />}  label="Male"   onChange={(e)=>{setSex(e.target.value)}} />
                          </RadioGroup>
                        </FormControl>
                      </Grid> */}

                    </Grid>
                    
                    <Button variant="contained" sx={{ mt: 3, mb: 8 }} onClick={sendRequest}>Send request</Button>
                    <Grid item xs={12} sm={12}>
                      <Box sx={{ mt: 5, mb: 1 }}>&nbsp;</Box>
                    </Grid>
                  </>
                }
              </Grid>
              <Grid item xs={1} sm={1}>&nbsp;</Grid>
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>
        </Box>
      </div>
    </Container>
  )
}