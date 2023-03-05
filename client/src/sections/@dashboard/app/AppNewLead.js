import React,  { useState, useEffect, useCallback, useContext } from 'react';
import LeadChart from '../../../components/LeadChart';
import { AuthContext } from '../../../context/AuthContext';
import { useHttp } from '../../../hooks/http.hook';
import {API_URL} from '../../../config';


export default function AppNewLead({ days, color }) {
  const {token} = useContext(AuthContext);
  const {loading, request} = useHttp();  
  const [data, setData] = useState([]);

  const leads = useCallback(async (date) => {
    const dayStart = date.setUTCHours(0,0,0,0),
          dayEnd   = date.setUTCHours(23,59,59,999);
    // console.log(dayStart, dayEnd);
    try {
      const res = await request(`${API_URL}api/leadsum?daystart=${dayStart}&dayend=${dayEnd}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('Count Leads:', res.countLead);      
      return res.countLead;
    }catch(e){
      console.log('Error:', e);
    }          
  }, [token, request])

  const setInt = async() =>{
    for(let i=days; i>0; i--){
      const nowStamp  = Date.now(),
            pastStamp = nowStamp - i*1000*60*60*24,
            pastDate  = new Date(pastStamp),
            pastHumanView = pastDate.getDate() + '.' + (pastDate.getMonth() + 1) + '.' + pastDate.getFullYear();
      const lead = await leads(pastDate);
      // console.log(pastHumanView, lead);
      setData([...data,
        data.push({
          name : pastHumanView,
          key  : lead
        })
      ]);
      // console.log('Dates:', data);
    }
  }
  useEffect(() => {setInt()}, [])  
  
  return (
    <div>
      <LeadChart data={data} color={color}/>
    </div>
  )
  
}
