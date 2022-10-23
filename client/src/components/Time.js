import React, { useState, useEffect } from "react"
import { Container, Button, Typography } from '@mui/material'
import { SubscriptionsOutlined } from "@mui/icons-material"

export default function Time({onTimeChange, slots}) {
  const [variant, setVariant] = useState([])
  let st = []
  useEffect(()=>{
    for(let i=0; i<slots.length; i++) st.push('outlined')
    setVariant(st)
  }, [])

  const handleClick = (e, key) => {
    st[key]==='outlined' ? st[key]='contained' : st[key]='outlined'
    setVariant(st)
    onTimeChange(slots[key].time);
  }

  for(let i=0; i<=slots.length; i++) st.push('outlined')

  return(
    <Container>
        <div style={{textAlign:"center"}}>
          {/* <Typography variant="h5" gutterBottom>Time</Typography> */}
          <div>
            {slots.map((item, key) => {
              return(
                <Button 
                  key={key} name={key} variant={variant[key]} className="time-btn"
                  onClick={(e) => handleClick(e, key)}
                >
                  {item.time}
                </Button>
              )
            })}
          </div>
        </div>
        <div style={{height:"30px"}}>&nbsp;</div>
    </Container>
  )
}
