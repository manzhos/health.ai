import { useState } from 'react';
// material
import { Container, Stack, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import { ProcedureSort, ProcedureList, ProcedureCartWidget, ProcedureFilterSidebar } from '../sections/@dashboard/procedure_00';
// mock
import PROCEDURES from '../_mock/procedure';

// ----------------------------------------------------------------------

export default function EcommerceShop() {
  const [openFilter, setOpenFilter] = useState(false);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  return (
    <Page title="Dashboard: Procedures">
      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Procedures
        </Typography>

        <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            <ProcedureFilterSidebar
              isOpenFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <ProcedureSort />
          </Stack>
        </Stack>

        <ProcedureList procedures={PROCEDURES} />
        <ProcedureCartWidget />
      </Container>
    </Page>
  );
}
