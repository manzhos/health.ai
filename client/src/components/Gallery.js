import React, { useState, useEffect, useCallback, useContext } from "react"
// material
import {
  Card,
  Button,
  Box,
  Container,
  Typography,
  Modal,
  Paper
} from '@mui/material'

import { AuthContext } from "../context/AuthContext"
import { useHttp } from "../hooks/http.hook"
import { API_URL, URL, MONTH } from "../config"
import humanDate from "./HumanDate"


export default function Gallery({ user }){
  // console.log('Client >>>', user)
  const {token} = useContext(AuthContext)
  const {loading, request} = useHttp()

  const [photoList, setPhotoList] = useState([])
  const [photo, setPhoto] = useState([])
  const [currentPhoto, setCurrentPhoto] = useState({})
  const [open, setOpen] = useState(false)

  const getPhotosByUser = useCallback(async () => {
    try{
      const res = await request(`${API_URL}api/userfiles/${user.id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('Photos:', res);
      setPhotoList(res)
    } catch (error) { console.log('Error:', error) }
  }, [token, request])
  useEffect(()=>{ getPhotosByUser() }, []);

  const getUrl = async () => {
    const fUrl = [];
    for(let p in photoList){
      const path = URL + 'files/docs/' + photoList[p].doc_id + '/' + photoList[p].filename
      const blob = await fetchImage(path);
      const f = new File([blob], photoList[p].filename)
      const url  = global.URL.createObjectURL(f);
      fUrl.push({'id':photoList[p].id, 'name':photoList[p].filename, 'type':photoList[p].type, 'path':url, 'ts':photoList[p].ts});
    }
    setPhoto([...fUrl])   
  }
  useEffect(()=>{ getUrl() }, [photoList])
  // useEffect(()=>{ console.log('PHOTO >>>', photo) }, [photo])

    async function fetchImage(url){
    const data = await fetch(url);
    const buffer = await data.arrayBuffer();
    const blob = new Blob([buffer], { type: "image/png" });
    return blob;
  }

  const PhotoItem = ({item}) => {
    return (
        <Paper sx={{ textAlign:"center", width:"120px", display:"flex", flexDirection:"column", margin:"20px", cursor:"pointer" }} onClick = {()=>{fullSizePhoto(item)}}>
          <img src={item.path} width={'100%'} height={'auto'} />
          <Typography variant="body2">{ item.ts ? humanDate(item.ts) : '' }</Typography>
        </Paper>
    )
  }
  
  const fullSizePhoto = (item) => {
    setCurrentPhoto(item)
    setOpen(true)
  }

  const handleClose = () => { setOpen(false) }

  return(
    <>
      <Modal
        open = {open}
        onClose={ handleClose }
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"        
      >
        <Container component="main" maxWidth="md" disableGutters style={{ maxHeight:"85vh" }}>
          <div style={{ width:"90%", height:"90vh", margin:"5vh 5%", backgroundSize:"contain", backgroundRepeat:"no-repeat", backgroundPosition:"center center", backgroundImage:`url(${currentPhoto.path})` }}>
            {/* <img src={currentPhoto.path} width={'100%'} height={'100%'} /> */}
          </div>
          <Button sx={{ position:"absolute", top:"30px", right:"30px", zIndex:"777" }} color="success" onClick={handleClose}>&times;</Button>
        </Container>
      </Modal>

      <Card sx={{ padding:"20px 30px" }}>
        <Typography variant="h5">Gallery</Typography>
        <Box sx={{ borderTop:1, borderColor: 'divider', padding:"20px", display:"flex", flexDirection:"row", flexWrap:"wrap" }}>
          { photo.map( (item, i) => <PhotoItem key={'photo_' + i} item={ item } /> ) }
        </Box>
      </Card>
    </>
  )
}