import * as React from 'react'
import { useState }  from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'

export default function Calendar ({onDateChange}) {
  const [dateValue, setDateValue] = useState(
    new Date()
  )

  const handleChange = (dateValue) => {
    setDateValue(dateValue);
    onDateChange(dateValue)
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={3}>
        <MobileDatePicker
          label="Date"
          inputFormat="dd/MM/yyyy"
          value={dateValue}
          onChange={handleChange}
          renderInput={(params) => <TextField {...params} />}
        />
      </Stack>
    </LocalizationProvider>
  );
};
