import React, {useState, useEffect, useCallback} from 'react'
import { sentenceCase } from 'change-case'
// mui
import { 
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
// -----------------------------------------
import { useHttp } from '../hooks/http.hook'
import { API_URL } from '../config'

export default function ProcedureList({ procedureTypeId, procedureId = 0, onChangeProcedure }) {
  const {request} = useHttp()

  const [procedure, setProcedure] = useState(procedureId)
  const [procedureList, setProcedureList] = useState([])
  const [url, setUrl] = useState(procedureTypeId ? `${API_URL}api/procedures_bytype/${procedureTypeId}` : `${API_URL}api/procedures`);

  const getProcedures = useCallback(async () => {
    // console.log('request with', procedureTypeId, url);
    try {
      const res = await request(url, 'GET', null, {})
      setProcedureList(res)
    } catch (e) { console.log('error:', e)}
  }, [request, url])

  useEffect(() => {getProcedures()}, [url])

  useEffect(() => {setUrl(`${API_URL}api/procedures_bytype/${procedureTypeId}`)}, [procedureTypeId])

  const handleChangeProcedure = (event) => {
    event.preventDefault();
    setProcedure(event.target.value)
    onChangeProcedure(event.target.value)
    // console.log('procedureType now:', procedureType, event.target.value)
  }

  return(
    <FormControl sx={{ width: 1 }}>
      <InputLabel id="procedure-select">Procedure</InputLabel>
      <Select
        labelId="procedure-select"
        id="procedure-select"
        name="procedure_id"
        value={procedure}
        label="Procedure"
        onChange={handleChangeProcedure} 
        className='cons-input'
      >
        {procedureList.map((item)=>{
          return(
            <MenuItem key={item.id} value={item.id}>{item.procedure}</MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}