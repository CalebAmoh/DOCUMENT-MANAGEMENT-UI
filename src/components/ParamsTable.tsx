import React, {useState, useEffect,useRef,Fragment} from 'react';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CallMadeIcon from '@mui/icons-material/CallMade';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {Table, Option,Button,Box,Link,Menu,Tooltip, MenuItem, Sheet,Input,Chip,FormControl,Typography,ColorPaletteProp,FormLabel,Select} from "@mui/joy";
import BlockIcon from "@mui/icons-material/Block";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {Edit,Delete, Recycling} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactComponent as Kebab } from "../utils/icons/kebab-svgrepo.svg";
import { ReactComponent as EditIcon } from "../utils/icons/edit-svgrepo-com.svg";

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
    id: number;
    code: string;
    description: string;
    trans_type: string;
    expense_code: string;
    status: string;
  }>;
  handleOpen: (type: string, row: any) => void;
}

const ParamsTable: React.FC<ApproversTableProps> = ({ data, handleOpen }) => {

  const [order, setOrder] = useState<Order>("desc");
  const [open, setOpen] = useState(false);

  
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [selectedRow, setSelectedRow] = useState<any | null>(null)
    const [tabValue, setTabValue] = useState(3)
    const menuRef = useRef<HTMLDivElement>(null);
  
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, data: any) => {
      setAnchorEl(event.currentTarget)
      setSelectedRow(data)
    }
  
    const handleMenuClose = () => {
      setAnchorEl(null)
      setSelectedRow(null)
    }
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          handleMenuClose();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [menuRef]);

  const renderFilters = () => (
    <Fragment>
      <FormControl size="sm">
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by status"
          slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Branch</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="Bank of America">Tema</Option>
          <Option value="Chase Bank">Accra</Option>
          <Option value="Wells Fargo">Kasoa</Option>
        </Select>
      </FormControl>
    </Fragment>
  );

  // Ensure data is an array
  const approversData = Array.isArray(data) ? data : [];
  

  return (
    <Fragment>
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
          <FormLabel>Search for documents</FormLabel>
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
              <th style={{ width: 140, padding: "12px 6px" }}>code</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Description</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Transaction Type</th>
              {/*<th style={{ width: 140, padding: "12px 6px" }}>Details</th>*/}
              <th style={{ width: 140, padding: "12px 6px" }}>Status</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Actions</th> 
            </tr>
          </thead>
          <tbody>
          {data === undefined || data === null ? (
                // Data is being fetched, show loader
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', height: '100px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                // Data has been fetched but no records found
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', height: '100px' }}>
                    <Typography level="body-md">No records found</Typography>
                  </td>
                </tr>
              ) :(stableSort(approversData, getComparator(order, "id")).map((row) => (
              <tr key={row.id}>
                <td style={{ textAlign: "center", width: 120 }}></td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.id}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.code}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.description}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.trans_type === "1" ? "Transactional Document" : "Non-Transactional Document"}</Typography>
                </td>
                {/* <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.doctype_name}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.details}</Typography>
                </td> */}
                {/* <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.status}</Typography>
                </td> */}
                 <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={
                      {
                        draft: <CheckRoundedIcon />,
                        1: <CheckRoundedIcon />,
                        0: <BlockIcon />,
                      }[row.status]
                    }
                    color={
                      {
                        1: "success",
                        0: "danger",
                      }[row.status] as ColorPaletteProp
                    }
                  >
                    {row.status === "1" ? "Active" : "Inactive"}
                  </Chip>
                </td> 
                
                <td>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Link level="body-xs" component="button">
                    
                        <IconButton onClick={(event) => handleMenuClick(event, row)} /*onClick={() => handleOpen("edit",row)}*/>
                          <Kebab style={{ width: 25, height: 25 }} />
                        </IconButton>

                    </Link>
                  </Box>
                </td>
              </tr>
            )))}
          </tbody>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                ref={menuRef}
              >
              <Tooltip title="Edit">
              <MenuItem onClick={() => handleOpen("edit",selectedRow)} >Edit Parameter <EditIcon style={{ width: 25, height: 25 }}/></MenuItem>
              </Tooltip>
            </Menu>
        </Table>
    </Sheet>
   
  </Fragment>
  );
};

export default ParamsTable;