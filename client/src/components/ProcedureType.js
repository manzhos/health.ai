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


export default function ProcedureType({ onChangeProcedureType }) {
  const {request} = useHttp()

  const [procedureType, setProcedureType] = useState(1)
  const [procedureTypeList, setProcedureTypeList] = useState([])

  const getProcedureTypes = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/proceduretypes`, 'GET', null, {})
      setProcedureTypeList(res);
    } catch (e) { console.log('error:', e)}
  }, [request])
  useEffect(() => {getProcedureTypes()}, [getProcedureTypes])  

  const handleChangeProcedureType = (event) => {
    event.preventDefault();
    setProcedureType(event.target.value)
    onChangeProcedureType(event.target.value)
    // console.log('procedureType now:', procedureType, event.target.value)
  }

  return(
    <FormControl sx={{ width: 1 }}>
      <InputLabel id="proceduretype-select">Zone</InputLabel>
      <Select
        labelId="proceduretype-select"
        id="proceduretype-select"
        name="proceduretype_id"
        value={procedureType}
        label="Procedure type"
        onChange={handleChangeProcedureType} 
        className='cons-input'
      >
        {procedureTypeList.map((item)=>{
          return(
            <MenuItem key={item.id} value={item.id}>{sentenceCase(item.proceduretype)}</MenuItem>
          )
        })}
      </Select>
    </FormControl>
  );
}