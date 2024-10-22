import React from 'react';
import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";
import Button from "@mui/joy/Button";
import Sheet from "@mui/joy/Sheet";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import { ColorPaletteProp } from "@mui/joy/styles";
import Table from "@mui/joy/Table";
import BlockIcon from "@mui/icons-material/Block";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import FormControl from "@mui/joy/FormControl";

type Order = "asc" | "desc";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface ApproversTableProps {
  data: Array<{
    approver_name: string;
    branch_description: string;
    created_at: string;
    doctype_description: string;
    posted_by: string;
    updated_at: string;
    id: number;
    user_id: string;
    branch_id: string;
    doc_type_id: string;
    status: string;
  }>;
}

const ApproversTable: React.FC<ApproversTableProps> = ({ data }) => {

  const [order, setOrder] = React.useState<Order>("desc");
  // Ensure data is an array
  const approversData = Array.isArray(data) ? data : [];
  console.log("app",approversData);
  if (approversData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <React.Fragment>
      <Sheet
        className="SearchAndFilters-mobile"
        sx={{
          display: { xs: "flex", sm: "none" },
          my: 1,
          gap: 1,
        }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        {/* <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Submit
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal> */}
      </Sheet>
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: "sm",
          py: 2,
          display: { xs: "none", sm: "flex" },
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search for bank2</FormLabel>
          <Input
            size="sm"
            placeholder="Search"
            startDecorator={<SearchIcon />}
          />
        </FormControl>
        {renderFilters()}
      </Box>
    <Sheet
    className="BankTableContainer"
    variant="outlined"
    sx={{
      display: { xs: "none", sm: "initial" },
      width: "100%",
      borderRadius: "sm",
      flexShrink: 1,
      overflow: "auto",
      minHeight: 0,
    }}
  >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
            "--Table-headerUnderlineThickness": "1px",
            "--TableRow-hoverBackground":
              "var(--joy-palette-background-level1)",
            "--TableCell-paddingY": "4px",
            "--TableCell-paddingX": "8px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{ width: 48, textAlign: "center", padding: "12px 6px" }}
              ></th>
              <th style={{ width: 120, padding: "12px 6px" }}>
                <Link
                  underline="none"
                  color="primary"
                  component="button"
                  // onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                  fontWeight="lg"
                  endDecorator={<ArrowDropDownIcon />}
                  // sx={{
                  //   "& svg": {
                  //     transition: "0.2s",
                  //     transform:
                  //       order === "desc" ? "rotate(0deg)" : "rotate(180deg)",
                  //   },
                  // }}
                >
                  ID
                </Link>
              </th>
              <th style={{ width: 140, padding: "12px 6px" }}>Approver</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Branch</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Document Type</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Status</th>
              <th style={{ width: 140, padding: "12px 6px" }}>View</th>
            </tr>
          </thead>
          <tbody>
            {stableSort(approversData, getComparator(order, "id")).map((row) => (
              <tr key={row.id}>
                <td style={{ textAlign: "center", width: 120 }}></td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.id}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.approver_name}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.branch_description}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.doctype_description}</Typography>
                </td>
                <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={
                      {
                        Active: <CheckRoundedIcon />,
                        Inactive: <BlockIcon />,
                      }[row.status]
                    }
                    color={
                      {
                        Active: "success",
                        Inactive: "danger",
                      }[row.status] as ColorPaletteProp
                    }
                  >
                    {row.status}
                  </Chip>
                </td>
                
                <td>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Link level="body-xs" component="button">
                      <Button
                        sx={{ backgroundColor: "#00357A", width: 35 }}
                        // onClick={() => setOpen(true)}
                        size="sm"
                        variant="solid"
                      >
                        <RemoveRedEyeIcon />
                      </Button>
                    </Link>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
    </Sheet>
    <Box
    className="Pagination-laptopUp"
    sx={{
      pt: 2,
      gap: 1,
      [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
      display: {
        xs: "none",
        md: "flex",
      },
    }}
  >
    <Button
      size="sm"
      variant="outlined"
      color="neutral"
      startDecorator={<KeyboardArrowLeftIcon />}
    >
      Previous
    </Button>

    <Box sx={{ flex: 1 }} />
    {["1", "2", "3", "…", "8", "9", "10"].map((page) => (
      <IconButton
        key={page}
        size="sm"
        variant={Number(page) ? "outlined" : "plain"}
        color="neutral"
      >
        {page}
      </IconButton>
    ))}
    <Box sx={{ flex: 1 }} />

    <Button
      size="sm"
      variant="outlined"
      color="neutral"
      endDecorator={<KeyboardArrowRightIcon />}
    >
      Next
    </Button>
    </Box>
  </React.Fragment>
  );
};

export default ApproversTable;