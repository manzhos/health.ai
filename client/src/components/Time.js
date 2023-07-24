import React, { useState, useEffect } from "react"
import { Container, Button, Typography } from '@mui/material'
import { SubscriptionsOutlined } from "@mui/icons-material"

export default function Time({onTimeChange, slots, day}) {
  // console.log('Slots in time:', slots);
  const [variant, setVariant] = useState([])
  let st = [],
  slot = [];
  for(let s in slots) slot.push(slots[s]);
  // console.log('SlotTT TT TT:', slot);

  useEffect(()=>{
    for(let i=0; i<slot.length; i++) st.push('outlined')
    setVariant(st)
  }, [])

  const handleClick = (e, key) => {
    st[key]==='outlined' ? st[key]='contained' : st[key]='outlined'
    setVariant(st)
    onTimeChange(slot[key].time, day);
  }

  for(let i=0; i<=slot.length; i++) st.push('outlined')

  return (
    // <Container>
        <div style={{textAlign:"center"}}>
          {/* <Typography variant="h5" gutterBottom>Time</Typography> */}
          <div>
            {slot.map((item, key) => {
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
    // </Container>
  )
}
