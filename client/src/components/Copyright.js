import React from "react";
import { Link } from "@mui/material";
import Typography from '@mui/material/Typography';

export default function Copyright(props) {
  return (
    <div className="copyright">
      <Typography variant="caption" color="text.secondary" align="center" {...props} style={{ textAlign:"center", color:"#000" }}>
        {'Copyright © '}
        <Link color="inherit" href="https://stunning-you.com/">
          Stunning-You.com
        </Link>{' '}
        2016–{new Date().getFullYear()}
        {'.'}
      </Typography>
    </div>
  );
}