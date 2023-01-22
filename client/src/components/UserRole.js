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


export default function UserRole({ uRole, onChangeUserRole }) {
  const {request} = useHttp()

  const [userRole, setUserRole] = useState(uRole)
  const [userRoleList, setUserRoleList] = useState([])

  const getUserRoles = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/roles`, 'GET', null, {})
      setUserRoleList(res);
    } catch (e) { console.log('error:', e)}
  }, [request])
  useEffect(() => {getUserRoles()}, [getUserRoles])  

  const handleChangeUserRole = (event) => {
    event.preventDefault();
    setUserRole(event.target.value)
    // console.log('userRole now:', userRole, event.target.value)
    onChangeUserRole(event.target.value)
  }

  return(
    // <FormControl sx={{ width: '300px', margin: '0 auto 0 30px' }}>
    <FormControl sx={{ width: '300px' }}>
      <InputLabel id="usertype-select">User role</InputLabel>
      <Select
        labelId="usertype-select"
        id="usertype-select"
        name="usertype_id"
        value={userRole}
        label="User type"
        onChange={handleChangeUserRole} 
        className='cons-input'
      >
        {userRoleList.map((item)=>{
          return(
            <MenuItem key={item.id} value={item.id}>{sentenceCase(item.usertype)}</MenuItem>
          )
        })}
      </Select>
    </FormControl>
  );
}