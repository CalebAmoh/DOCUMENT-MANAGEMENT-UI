import React,{useState,useRef,useEffect} from 'react';
import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";
import Button from "@mui/joy/Button";
import { Menu, MenuItem } from '@mui/joy';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {Table,Tooltip, Option, Sheet,Input,Chip,FormControl,Typography,ColorPaletteProp,FormLabel,Select} from "@mui/joy";
import BlockIcon from "@mui/icons-material/Block";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {Edit,Delete, Recycling} from "@mui/icons-material";
import { ReactComponent as EditIcon } from "../utils/icons/edit-svgrepo-com.svg";
import { ReactComponent as Kebab } from "../utils/icons/kebab-svgrepo.svg";

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
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    id: number;
    status: string;
  }>;
  handleOpen: (type: string, row: any) => void;
}

const UsersTable: React.FC<ApproversTableProps> = ({ data, handleOpen }) => {

  const [order, setOrder] = React.useState<Order>("desc");
  const [open, setOpen] = React.useState(false);

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
    <React.Fragment>
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
        <FormLabel>Role</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="Bank of America">Approver</Option>
          <Option value="Chase Bank">Admin</Option>
          <Option value="Wells Fargo">Originator</Option>
        </Select>
      </FormControl>
    </React.Fragment>
  );

  // Ensure data is an array
  const approversData = Array.isArray(data) ? data : [];
  // if (approversData.length === 0) {
  //   return <div>No data available</div>;
  // }

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
          <FormLabel>Search for approvers</FormLabel>
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
              <th style={{ width: 140, padding: "12px 6px" }}>Username</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Email</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Role</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Status</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Actions</th>
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
                  <Typography level="body-sm">{row.first_name} {row.last_name}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.email}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.role}</Typography>
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
                    {/* <Tooltip title="Edit">
                      <Button
                        sx={{ backgroundColor: "#00357A", width: 35, marginRight: 1 }}
                        onClick={() => handleOpen("update",row.id)}
                        size="sm"
                        variant="solid"
                      >
                        <Edit />
                        
                      </Button>
                      </Tooltip>
                      {row.status === "Active" ? (
                        <Tooltip title="Deactivate">
                         <Button
                         sx={{ backgroundColor: "#920505", width: 35 }}
                         onClick={() => handleOpen("delete",row.id)}
                         size="sm"
                         variant="solid"
                       >
                         <Delete />
                         
                       </Button> 
                       </Tooltip>
                      ):(
                        <Tooltip title="Activate">
                          <Button
                            sx={{ backgroundColor: "#4CAF50", width: 35 }}
                            onClick={() => handleOpen("activate",row.id)}
                            size="sm"
                            variant="solid"
                          >
                            <Recycling />
                            
                          </Button>
                      </Tooltip>
                       )
                      } */}
                     <IconButton onClick={(event) => handleMenuClick(event, row)} /*onClick={() => handleOpen("edit",row)}*/>
                          <Kebab style={{ width: 25, height: 25 }} />
                        </IconButton>
                     </Link>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
          <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              placement="bottom-end"
              sx={{
                zIndex: 9999,
                minWidth: '200px',
                '--Menu-decoratorChildOffset': '0.5rem',
              }}
            >
              <MenuItem 
                  onClick={() => {
                    handleOpen("update", selectedRow?.id);
                    handleMenuClose();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    Edit User
                    <EditIcon style={{ width: 25, height: 25, marginLeft: '8px' }} />
                  </Box>
              </MenuItem>
              {/* {selectedRow?.status === "ACTIVE" ?(
                <MenuItem 
                  onClick={() => {
                    handleOpen("activate", selectedRow?.id);
                    handleMenuClose();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    Activate User
                    <Recycling style={{ width: 25, height: 25, marginLeft: '8px' }} />
                  </Box>
                </MenuItem>):(
              <MenuItem 
                onClick={() => {
                  handleOpen("delete", selectedRow?.id);
                  handleMenuClose();
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  Deactivate User
                  <Delete style={{ width: 25, height: 25, marginLeft: '8px',color: "#920505" }} />
                </Box>
              </MenuItem>)} */}
            </Menu>
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
    

    <Box sx={{ flex: 1 }} />
   
    <Box sx={{ flex: 1 }} />

    
    </Box>
  </React.Fragment>
  );
};

export default UsersTable;