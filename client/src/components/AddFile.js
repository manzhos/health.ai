import React, { useState, useEffect } from "react";
// mui
import { 
  Grid,
  Button
} from '@mui/material'
import Iconify from "./Iconify";
import { URL, API_URL } from '../config'

export default function AddFile({ docList, onFileChange }){
  // console.log('AddFile >>> docList:', docList)
  const [file, setFile] = useState([])
  const [fileURL, setFileURL] = useState([])
  
  async function fetchImage(url){
    const data = await fetch(url);
    const buffer = await data.arrayBuffer();
    const blob = new Blob([buffer], { type: "image/png" });
    return blob;
  }

  const getFile = async () => {
    for(let k in docList){
      const url = URL + 'files/docs/' + docList[k].doc_id + '/' + docList[k].filename;
      const blob = await fetchImage(url);
      const f = new File([blob], docList[k].filename)
      handlerFileChange(f);
    }
  }
  useEffect(()=>{ getFile() }, [docList]);

  const getFileUrl = async () => {
    if(!file || file.length === 0) return
    const fUrl = [];
    file.map((f, key) => {
      let type = f.name?.toLowerCase().split('.').pop();
      if(type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'gif') type = 'img'
      else if(type === 'mpg' || type === 'mpeg' || type === 'mov' || type === 'avi' || type === 'asf' || type === 'mp4' || type === 'm4v') type = 'mov'
      else type = 'file'
      
      const id   = key,
            name = f.name,
            url  = global.URL.createObjectURL(f);
      fUrl.push({'id':id, 'name':name, 'type':type, 'url':url});
    })

    setFileURL(fUrl)
  }
  useEffect(()=>{getFileUrl()}, [file])

  const handlerFileChange = async (f) => {
    if(!f) return;
    if(f?.size > 20971520) {
      alert('File is too large')
      return;
    }
    setFile((prevState) => ([...prevState, f]));
    // await getFileUrl(f);
    // setFile([...file, f]);
  }

  const onDelButtonClick = async (e, id) => {
    console.log('E:', e, 'Id:', id);
    console.log('FILE:', file);
    console.log('fileURL:', fileURL);
    setFile(file.toSpliced(id, 1));
  }

  useEffect(() => { 
    onFileChange(file)
  }, [file]);

  return(
    <Grid container sx={{ width:"100%", textAlign:"center"}}>
      {/* <div>
        Upload photos/docs: 
      </div> */}
      <Grid item sx={{ width:"100%", textAlign:"center"}}>
        <div>
          {/* {fileURL.map(item => console.log('item:', item))} */}
          {fileURL.map(item => 
            <div key={item.id} style={{margin:"20px", width:"105px", display:"inline-block"}}>
              {item.type === 'img' &&
                <img src={item.url} alt=""/>
              }
              {item.type === 'mov' &&
                <img src={URL+'files/video.png'} alt="" />
              }
              {item.type === 'file' &&
                <img src={URL+'files/document.png'} alt="" />
              }
              <p style={{fontSize:"10px", lineHeight:"10px", marginTop:"5px"}}>{item.name}</p>
              <Button id="DelButton" onClick={(e) => onDelButtonClick(e, item.id)} variant="text" color="error" size="small">&#10006; Delete</Button>
            </div>
          )}
        </div>
        <label htmlFor="file" style={{ width:'100%' }}>
          <input id="file" name="file" type="file" onChange={(event)=>{handlerFileChange(event.target.files[0])}} style={{ display: "none" }}/>
          <Button variant="outlined" component="span">{'Add photos/docs'}</Button>
          {/* <Iconify icon="material-symbols:add-a-photo-outline" className="up-photo" type="button" />
          <Iconify icon="material-symbols:add-a-photo-outline" className="up-photo" type="button" />
          <Iconify icon="material-symbols:add-a-photo-outline" className="up-photo" type="button" /> */}
        </label>
      </Grid>
    </Grid>
  )
}