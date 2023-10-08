import React, {useState} from 'react';
import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Toolbar, Tooltip, IconButton, Typography, OutlinedInput, InputAdornment, Button } from '@mui/material';
// component
import Iconify from '../../../components/Iconify';

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

InvoiceListToolbar.propTypes = {
  numSelected: PropTypes.number,
};

export default function InvoiceListToolbar({ numSelected, onFilterName, handleMakeInvoice }) {
  const [invoiceFilter, setInvoiceFilter] = useState('');

  const handleChange = (event) => {
    setInvoiceFilter(event.target.value);
    // console.log('event.target.value', event.target.value);
    onFilterName(event.target.value);
  }

  const handleReset = () => {
    setInvoiceFilter('');
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
            value={invoiceFilter}
            onChange={handleChange}
            placeholder="Search invoice..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
              </InputAdornment>
            }
          />
          <div style={{ width:"20px" }}>&nbsp;</div>
          {/* <Button variant='outlined' onClick={handleReset} style={{margin:'0 auto 0 20px'}}>Reset</Button> */}
        </>
      )}

      {numSelected > 0 ? (
        <>
          <Tooltip title="Delete">
            <IconButton>
              {/* <Iconify icon="eva:trash-2-fill" /> */}
            </IconButton>
          </Tooltip>
          <Tooltip title="Make Invoice">
            <Button variant="contained" color="secondary" onClick={()=>{handleMakeInvoice()}}>
              Make Invoice
            </Button>
          </Tooltip>
        </>
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
