import React, {useState} from 'react';
import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, Button } from '@mui/material';
// component
import Iconify from '../../../components/Iconify';
import UserRole from '../../../components/UserRole'

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

// ----------------------------------------------------------------------

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
};

export default function UserListToolbar({ numSelected, onFilterName, onUserRole }) {
  const [userRole, setUserRole] = useState();
  const [userFilter, setUserFilter] = useState('');

  const handleChange = (event) => {
    setUserFilter(event.target.value);
    onFilterName(event.target.value);
  }

  const handleChangeUserRole = (newUserRole) => {
    // console.log('UserListToolBar', newUserRole)
    setUserRole(newUserRole);
    onUserRole(newUserRole);
  }
  const handleReset = () => {
    // console.log('UserListToolBar', newUserRole)
    setUserRole();
    setUserFilter('');
    onUserRole(false);
  }

  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <>
          <SearchStyle
            value={userFilter}
            onChange={handleChange}
            placeholder="Search user..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            }
          />
          <div style={{ width:"20px" }}>&nbsp;</div>
          {/* <UserRole uRole={userRole} onChangeUserRole={handleChangeUserRole} /> */}
          {/* <Button variant='outlined' onClick={handleReset} style={{margin:'0 auto 0 20px'}}>Reset</Button> */}
        </>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Tooltip>
      )}
    </RootStyle>
  );
}
