import React, { forwardRef } from 'react';
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper
} from '@mui/material';

export const ComponentToPrint = forwardRef((props, ref) => {
  const { users } = props;

  return (
    <div ref={ref}>
      {/* Print-specific CSS */}
      <style type="text/css" media="print">
        {`
          @page {
            size: A4 landscape;
            margin: 1cm;
          }

          .print-grid {
            display: flex;
            flex-wrap: wrap;
          }

          .print-column {
            width: 50%;
            box-sizing: border-box;
            padding: 0.75rem;
          }

          .mui-table th, .mui-table td {
            border: 1px solid black;
            padding: 8px;
            font-size: 12px;
          }

          .mui-table th {
            background-color: #f5f5f5;
          }

          .user-header {
            font-weight: bold;
            padding-bottom: 4px;
          }
        `}
      </style>

      <div className="print-grid">
        {users.map((user, index) => (
          <div key={index} className="print-column">
            <TableContainer component={Paper} elevation={1}>
              <Table size="small" className="mui-table">
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle2" className="user-header">
                        User {index + 1}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>{user.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                  {user.contact && (
                    <TableRow>
                      <TableCell>Contact</TableCell>
                      <TableCell>{user.contact}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        ))}
      </div>
    </div>
  );
});