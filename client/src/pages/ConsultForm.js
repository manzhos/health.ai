import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
// mui
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
import ProcedureType      from '../components/ProcedureType'
import ProcedureList      from '../components/ProcedureList'
import AddFile            from '../components/AddFile'
import BreastAugmentation from '../components/ConsForm/BreastAugmentation'
// import {API_URL} from '../config'

export default function ConsultForm(){
  const navigate  = useNavigate()

  // const [sex, setSex] = useState('female')
  const [age, setAge] = useState(18)
  const [nameClient, setNameClient] = useState('Vladimir')
  const [confirm, setConfirm] = useState(true)
  const [surgical, setSurgical] = useState('non-surgical')
  const [procedureTypeId, setProcedureTypeId] = useState(4)
  const [procedureId, setProcedureId] = useState(0)
  const [botoxWhen, setBotoxWhen] = useState(0)
  const [botoxWhat, setBotoxWhat] = useState(3)
  const [breastAugmentationDetail, setBreastAugmentationDetail] = useState({});

  const [files, setFiles] = useState()

  useEffect(() => {
    if(surgical === 'non-surgical') setProcedureTypeId(4)
    else setProcedureTypeId(1)
  }, [surgical])

  const handleSubmit = async(event) => {
    event.preventDefault()
    navigate('/thanks')
    // const data = new FormData(event.currentTarget)
    // if(emailClient !== ''){
    //   try {
    //     const formData = new FormData()
    //     formData.append('name',         nameClient)
    //     formData.append('age',          data.get('age'))
    //     formData.append('sex',          sex)
    //     formData.append('procedure_id', procedureId)
    //     formData.append('note',         data.get('note'))
    //     formData.append('email',        emailClient)
    //     formData.append('info', {
    //       when: botoxWhen,
    //       what: botoxWhat,
    //     })
    //     const res = await fetch(`${API_URL}api/consult`, {
    //       method: 'POST', 
    //       body: formData,
    //     })

    //     if(files){
    //       console.log('files:', files)
    //       // files.map((item)=>{ formData.append('file', item) })
    //       // const f = await fetch(`${API_URL}api/file`, {
    //       //   method: 'POST', 
    //       //   body: formData,
    //       // })
    //     }

    //     navigate('/thanks')
    //   } catch (e) {console.log('error:', e)} 
    // } else alert('Need to check the filled information.')

  }

  const handleProcedureTypeChange = (newProcedureTypeId) => {
    setProcedureTypeId(newProcedureTypeId)
  }

  const handleProcedureChange = (newProcedureId) => {
    setProcedureId(newProcedureId)
  }

  const handleBreastAugmentation = (newBSNow, newBSWant, newBShape) => {
    // console.log('newBSNow, newBSWant, newBShape:', newBSNow, newBSWant, newBShape);
    setBreastAugmentationDetail({
      'breastSizeNow':  newBSNow,
      'breastSizeWant': newBSWant,
      'breastShape':    newBShape,
    })
  }

  const handlerFileChange = (files) => {
    setFiles(files)
  }

  return(
    <Container style={{textAlign:"center"}}>
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
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 7 }}>
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
                  Hi, {nameClient}
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
                      <FormControlLabel value="surgical"      control={<Radio size="small" />}  label="Surgical"     onChange={(e)=>{setSurgical(e.target.value)}} />
                      <FormControlLabel value="non-surgical"  control={<Radio size="small" />}  label="NON-Surgical" onChange={(e)=>{setSurgical(e.target.value)}} sx={{ml: 4}} />
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
                  <Grid container spacing={2} sx={{ mt: 2 }} justifyContent="center">
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
                  </Grid>
                }
                { [32,33,34,35,36,37,39,40,41,44].filter(item => item === procedureId).length > 0 &&
                  <>
                    <BreastAugmentation onChangeBreastAugmentation={handleBreastAugmentation} />
                  </>
                }

                {/* add file */}
                { Number(procedureId) !== 0 &&
                  <>
                    <Divider />
                    { Object.keys(breastAugmentationDetail).length > 0 &&
                      <>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt:2, mb:0 }}>
                          {'For a more detailed calculation, add photos'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt:0, mb:1 }}>
                          Check out the <a href="#">guide</a> before.
                        </Typography>
                      </>
                    }
                    <AddFile onFileChange={handlerFileChange}/>
                    <Grid item xs={12} sm={12}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1, mb: 3 }}>&nbsp;</Box>
                    </Grid>
                  </>
                }

                { Number(procedureId) !== 0 &&
                  <>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb:1 }}>
                      {'Add some detail about yourself'}
                    </Typography>

                    <Grid item xs={12} sm={12} sx={{ mt: 3 }}>
                      <TextField name="note" fullWidth multiline rows={4} id="note" label="Medications you are taking" className='cons-input' />
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
                    
                    <Button type="submit" variant="contained" sx={{ mt: 3, mb: 1 }} >Send request</Button>
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