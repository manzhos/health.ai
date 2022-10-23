import PropTypes from 'prop-types';
// material
import { Grid } from '@mui/material';
import ShopProcedureCard from './ProcedureCard';

// ----------------------------------------------------------------------

ProcedureList.propTypes = {
  procedures: PropTypes.array.isRequired
};

export default function ProcedureList({ procedures, ...other }) {
  return (
    <Grid container spacing={3} {...other}>
      {procedures.map((procedure) => (
        <Grid key={procedure.id} item xs={12} sm={6} md={3}>
          <ShopProcedureCard procedure={procedure} />
        </Grid>
      ))}
    </Grid>
  );
}
