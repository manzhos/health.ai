import React, { useState, useEffect } from "react";
// mui
import { 
  Grid,
  Button
} from '@mui/material'
import Iconify from "./Iconify";
import { URL, API_URL } from '../config'

export default function AddFile({ onFileChange }){
  const [file, setFile] = useState([])
  const [fileURL, setFileURL] = useState([])

  useEffect(()=>{
    if(!file || file.length === 0) return

    let type = file[file.length-1].name.toLowerCase().split('.').pop();
    if(type === 'jpg' || type === 'jpeg' || type === 'png' || type === 'gif') type = 'img'
    else if(type === 'mpg' || type === 'mpeg' || type === 'mov' || type === 'avi' || type === 'asf' || type === 'mp4' || type === 'm4v') type = 'mov'
    else type = 'file'

    let id   = file.length-1,
        name = file[file.length-1].name,
        url  = URL.createObjectURL(file[file.length-1]);
    setFileURL([...fileURL, {'id':id, 'name':name, 'type':type, 'url':url}])
    onFileChange(file)
    // console.log('fileURL:', fileURL)
  }, [file])

  const handlerFileChange = (event) => {
    // console.log('E:', event);
    let f = event.target.files[0];
    // console.log('file:', f);
    if(f.size > 20971520) {
      alert('File is too large')
      return;
    }
    setFile([...file, f]);
  }

  const onDelButtonClick = async (e, id) => {
    // console.log('E:', e, 'Id:', id);
    setFileURL(fileURL.filter(item => item.id !== id));
  }

  return(
    <Grid item xs={12} sm={12}>
      {/* <div>
        Upload photos/docs: 
      </div> */}
      <div>
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
          <input id="file" name="file" type="file" onChange={handlerFileChange} style={{ display: "none" }}/>
          {/* <Button variant="outlined" component="span">{'Upload photos/docs'}</Button> */}
          <Iconify icon="material-symbols:add-a-photo-outline" className="up-photo" type="button" />
          <Iconify icon="material-symbols:add-a-photo-outline" className="up-photo" type="button" />
          <Iconify icon="material-symbols:add-a-photo-outline" className="up-photo" type="button" />
        </label>
      </div>
    </Grid>
  )
}