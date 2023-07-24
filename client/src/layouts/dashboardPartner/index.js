import React, { useCallback, useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { 
  Button,
  Grid,
  Box,
  Container,
  TextField,
  Modal,
  Typography,
  Link
} from '@mui/material';
import Iconify from '../../components/Iconify';

import { AuthContext } from '../../context/AuthContext';
import { URL, API_URL } from '../../config';
import { useHttp } from '../../hooks/http.hook';


export default function DashboardLayoutPartner() {
  const navigate  = useNavigate();
  const {token}   = useContext(AuthContext);
  const {loading, request} = useHttp();

  const [sum, setSum] = useState(['0', '00']);

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

  const getSum = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/partnerclients/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('USERS:', res);
      const sumTotal = res.reduce((acc, curr) => (acc + (Number(curr.cos_cost) + Number(curr.med_cost))), 0);
      // console.log(sumTotal);
      setSum(sumTotal.toFixed(2).split('.'));
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getSum()}, [getSum])  
  
  const handleWithdrawals = async () => {
    try {
      const body = `
        The partner ${userId} wants his money.
      `;
      const adressee = 'manzhos@gmail.com'
      // const adressee = 'info@stunning-you.com'
      let date = new Date();

      const formData = new FormData();
      formData.append('subject',  'Withdrawals');
      formData.append('body',     body);
      formData.append('date',     date);
      formData.append('time',     '00')  ;
      // formData.append('type',     data.get('type'));
      formData.append('adressee', adressee);
      // console.log('formData:', formData);
  
      await fetch(`${API_URL}api/newmail`, {
        method: 'POST', 
        body: formData,
      })
      
      navigate('/moneyontheway')
    } catch (e) { console.log('error:', e)}
  }

  return (
    <div className="partner-ms" style={{ width:"100vw", minHeight:"100vh", color:"#FCFBFD"}}>
      <Container style={{maxWidth:"640px"}}>
        <div id="topline" className='partner-top-menu'>
          <Iconify
            icon={'gg:list'}
            sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
            style={{ cursor:"pointer" }}
            onClick={()=>{navigate('/partnerclients')}}
          />
          <Iconify
            icon={'fluent:qr-code-24-filled'}
            sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
            style={{ cursor:"pointer" }}
            onClick={()=>{navigate('/qrpartner')}}
          />
          <div style={{ position:"fixed", bottom:"2vh", right:"2vh"}}>
            <Iconify
              icon={'lucide:settings'}
              sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
              style={{ cursor:"pointer" }}
              onClick={()=>{navigate('/settingspartner')}}
            />
          </div>
        </div>
        <div id="money">
          <div id="sum" style={{ display:"flex", flexDirection:"column", justifyContent:"center", margin:"15vh 0"}}>
            <div className='partner-count'><span style={{ fontSize:"9vh" }}>{sum[0]}</span><span style={{ fontSize:"3vh" }}>.{sum[1]}</span><span style={{ fontSize:"9vh" }}>&#8364;</span></div>
          </div>
          <div id="checkout" style={{ display:"flex", justifyContent:"center" }}>
            <Button 
              style={{
                background:"#FCFBFD",
                color:"#AA4037",
                padding:"14px 36px",
                textTransform:"uppercase"
              }}
              onClick={()=>{handleWithdrawals()}}
            >withdrawals</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
