// import * as React from "react";
import React, { useState, useEffect } from "react";
import Table from "@mui/joy/Table";
import Button from "@mui/joy/Button";
import { CssBaseline, Box } from "@mui/material";
import Chip from "@mui/joy/Chip";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";

function createData(index, bankNo, bankName, status, gracePeriod) {
  return { index, bankNo, bankName, status, gracePeriod };
}

const rows = [
  createData(1, "501", "Sierra Leone Commercial Bank", "Active", "3 days"),
  createData(2, "832", "Rokel Commercial Bank", "Pending", "4 days"),
  createData(3, "303", "UT Bank", "Expired", "6 days"),
];

export default function TableHover() {
  const [open, setOpen] = useState(false);
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Pending":
        return "primary";
      case "Expired":
        return "danger";
      default:
        return "default";
    }
  };
  return (
    <>
      <CssBaseline />
      <Box sx={{ width: "100%", overflow: "auto" }}>
        <Table hoverRow sx={{ width: "100%", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Index</th>
              <th style={{ width: "15%" }}>Bank No.</th>
              <th style={{ width: "30%" }}>Bank Name</th>
              <th style={{ width: "15%" }}>Status</th>
              <th style={{ width: "20%" }}>Grace Period</th>
              <th style={{ width: "10%", textAlign: "center" }}> Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.index}>
                <td>{row.index}</td>
                <td className="  text-sm font-medium text-gray-700">
                  {row.bankNo}
                </td>
                <td>{row.bankName}</td>
                <td>
                  {" "}
                  <Chip
                    color={getStatusColor(row.status)}
                    onClick={() => console.log(`Status clicked: ${row.status}`)}
                  >
                    {row.status}
                  </Chip>
                </td>
                <td>{row.gracePeriod}</td>
                <td>
                  <Button
                    sx={{ backgroundColor: "#00357A", width: 75 }}
                    // onClick={() => console.log(`Checking ${row.bankName}`)}
                    onClick={() => setOpen(true)}
                    size="sm"
                    variant="solid"
                  >
                    Details
                  </Button>
                  <Modal
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                    open={open}
                    onClose={() => setOpen(false)}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Sheet
                      variant="outlined"
                      sx={{
                        maxWidth: 500,
                        borderRadius: "md",
                        p: 3,
                        boxShadow: "lg",
                      }}
                    >
                      <ModalClose variant="plain" sx={{ m: 1 }} />
                      <Typography
                        component="h2"
                        id="modal-title"
                        level="h4"
                        textColor="inherit"
                        fontWeight="lg"
                        mb={1}
                      >
                        Details for {row.bankName}
                      </Typography>
                      <Typography id="modal-desc" textColor="text.tertiary">
                        Make sure to use <code>aria-labelledby</code> on the
                        modal dialog with an optional {row.bankName}
                      </Typography>
                    </Sheet>
                  </Modal>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </>
  );
}
