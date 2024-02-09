import React, { useState, useCallback, useEffect, useContext } from "react";
import { Plus, X } from "react-feather";
import { sentenceCase } from 'change-case';
import "./Editable.css";

// material
import {
  InputLabel,
  Select,
  FormControl,
  MenuItem,
} from '@mui/material';

import { useHttp } from '../../../hooks/http.hook'
import { AuthContext } from '../../../context/AuthContext'
import {API_URL} from '../../../config'

const Editable = (props) => {
  const {token} = useContext(AuthContext)
  const {loading, request} = useHttp()

  const [show, setShow] = useState(props?.handler || false);
  const [text, setText] = useState(props.defaultValue || "");

  const [userList, setUserList] = useState([])

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (text && props.onSubmit) {
      setText("");
      props.onSubmit(text);
    }
    setShow(false);
  };

  const getUsers = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/user?role=lead`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      res.map((el)=>{
        el.fullName = el.firstname + ' ' + el.lastname;
      });
      setUserList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getUsers()}, [getUsers])

  return (
    <div className={`editable ${props.parentClass}`}>
      {show ? (
        <form onSubmit={handleOnSubmit}>
          <div className={`editable__input ${props.class}`}>
            { props.placeholder === 'Enter Card Title' ? (
                <FormControl sx={{ width: 1 }}>
                  <InputLabel id="role-select">Lead</InputLabel>
                  <Select
                    labelId="lead-select"
                    id="lead-select"
                    name="lead"
                    value={text}
                    label="Role"
                    onChange={(e) => setText(e.target.value)} 
                  >
                    {userList.map((item, key)=>{
                      return(
                        <MenuItem key={key} value={item.fullName}>{sentenceCase(item.fullName)}</MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              ):(
                <textarea
                  placeholder={props.placeholder}
                  autoFocus
                  id={"edit-input"}
                  type={"text"}
                  onChange={(e) => setText(e.target.value)}
                />
              )
            }
            <div className="btn__control">
              <button className="add__btn" type="submit">
                {`${props.btnName}` || "Add"}
              </button>
              <X
                className="close"
                onClick={() => {
                  setShow(false);
                  // props?.setHandler(false);
                }}
              />
            </div>
          </div>
        </form>
      ) : (
        <p
          onClick={() => {
            setShow(true);
          }}
        >
          {props.defaultValue === undefined ? <Plus /> : <></>}
          {props?.name || "Add"}
        </p>
      )}
    </div>
  );
};

export default Editable;
