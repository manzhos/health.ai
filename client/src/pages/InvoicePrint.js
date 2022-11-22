import * as React from 'react'
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TableHead,
  Paper
} from '@mui/material'

// components
import Page from '../components/Page'

// ----------------------------------------------------------------------
// function createData(
//   name,
//   calories,
//   fat,
//   carbs,
//   protein,
// ) {
//   return { name, calories, fat, carbs, protein };
// }

// const rows = [
//   createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
//   createData('Eclair', 262, 16.0, 24, 6.0),
//   createData('Cupcake', 305, 3.7, 67, 4.3),
//   createData('Gingerbread', 356, 16.0, 49, 3.9),
// ];

export default function InvoicePrint({date, procedure, amount, cost, doctor}) {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <Page title="Invoice">
      <Container style={{maxWidth:"800px"}}>
        <div style={{width:"100%", height:"120px"}}>&nbsp;</div>
        <Typography variant="h3" paragraph>
          LOGO // Health.AI
        </Typography>

        <div style={{width:"100%", height:"120px"}}>&nbsp;</div>
        <Typography sx={{ color: 'text.secondary' }}>
          Date: <strong>{searchParams.get("date")}</strong>
        </Typography>
        <div style={{width:"100%", height:"120px"}}>&nbsp;</div>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Procedure</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.calories}</TableCell>
                  <TableCell align="right">{row.fat}</TableCell>
                </TableRow>
              ))} */}
              <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                <TableCell component="th" scope="row">
                  {searchParams.get("procedure")}
                </TableCell>
                <TableCell align="right">{searchParams.get("amount")}</TableCell>
                <TableCell align="right">{searchParams.get("cost")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <div style={{width:"100%", height:"120px"}}>&nbsp;</div>
        <Typography sx={{ color: 'text.secondary' }}>
          Doctor: <strong>{searchParams.get("doctor")}</strong>
        </Typography>
      </Container>
    </Page>
  );
}
