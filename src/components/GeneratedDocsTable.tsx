import React,{ useState, useRef, useEffect }  from 'react';
import Box from "@mui/joy/Box";
import Link from "@mui/joy/Link";
import Button from "@mui/joy/Button";
import Tooltip from "@mui/joy/Tooltip";
import { Menu, MenuItem } from '@mui/joy';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import CallMadeIcon from '@mui/icons-material/CallMade';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import {Table, Option, Sheet,Input,Chip,FormControl,Typography,ColorPaletteProp,FormLabel,Select} from "@mui/joy";
import BlockIcon from "@mui/icons-material/Block";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import IconButton, { iconButtonClasses } from "@mui/joy/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {Edit,Delete, Recycling} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";  
import { ReactComponent as FileSvg } from "../utils/icons/pdf-file-svgrepo-com.svg";
import { ReactComponent as Kebab } from "../utils/icons/kebab-svgrepo.svg";
import { ReactComponent as PdfSvg } from "../utils/icons/pdf-file-svg.svg";
import { ReactComponent as EditIcon } from "../utils/icons/edit-svgrepo-com.svg";
import { ReactComponent as ViewIcon } from "../utils/icons/eye-password-eye-password-svgrepo-com.svg";
import { ReactComponent as SubmitIcon } from "../utils/icons/send-svgrepo-com.svg";
import { ReactComponent as MessageIcon } from "../utils/icons/message-list-svgrepo-com.svg";
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
    doctype_name: string;
    details: string;
    doc_id: string;
    doctype_id: string;
    status: string;
    created_at: string;
  }>;
  handleOpen: (type: string, row: any) => void;
  handleMessage: (id: number) => void;
}

//handles truncating text
const truncateText = (text:string, wordLimit:number) => {
  const words = text.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return text;
};

// Add these styles for mobile responsiveness
const mobileStyles = {
  tableContainer: {
    overflowX: 'auto',
    width: '100%',
    '@media (max-width: 600px)': {
      fontSize: '14px',
    }
  },
  mobileCell: {
    '@media (max-width: 600px)': {
      display: 'none'
    }
  },
  responsiveCell: {
    '@media (max-width: 600px)': {
      padding: '8px 4px',
      whiteSpace: 'nowrap',
      fontSize: '12px'
    }
  },
  hiddenOnMobile: {
    '@media (max-width: 600px)': {
      display: 'none'
    }
  }
};

const GeneratedDocsTable: React.FC<ApproversTableProps> = ({ data, handleOpen, handleMessage }) => {

  const [order, setOrder] = React.useState<Order>("desc");
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = React.useState<any | null>(null);
  const [tabValue, setTabValue] = React.useState(3)
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, row: any) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedRow(row);
    setAnchorEl(event.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
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
        <FormLabel>Document Type</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="Bank of America">Invoice</Option>
          <Option value="Chase Bank">Projects</Option>
          <Option value="Wells Fargo">Loans</Option>
        </Select>
      </FormControl>
    </React.Fragment>
  );

  // Ensure data is an array
  const generatedDocs = Array.isArray(data) ? data : [];
  console.log("app",generatedDocs);
  // if (generatedDocs.length === 0) {
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
          flexDirection: 'column', // Changed to column for better mobile layout
          width: '100%'
        }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1, width: '100%' }}
        />
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <FormControl size="sm" sx={{ flexGrow: 1 }}>
            <Select size="sm" placeholder="Status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </FormControl>
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setOpen(true)}
          >
            <FilterAltIcon />
          </IconButton>
        </Box>
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
        ...mobileStyles.tableContainer,
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
              "@media (max-width: 600px)": {
                "--TableCell-paddingX": "4px",
              }
            }}
          >
            <thead>
              <tr>
              
                <th
                  style={{ ...mobileStyles.responsiveCell, width: 48, textAlign: "center" }}
                ></th>
                <th style={{ ...mobileStyles.responsiveCell, width: 120 }}>
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
                <th style={{ ...mobileStyles.responsiveCell, width: 140 }}>Document</th>
                <th style={{ ...mobileStyles.responsiveCell, width: 140 }}>Type</th>
                <th style={{ 
                  ...mobileStyles.responsiveCell, 
                  ...mobileStyles.hiddenOnMobile,
                  width: 180 
                }}>Description</th>
                <th style={{ ...mobileStyles.responsiveCell, width: 120 }}>Status</th>
                <th style={{ ...mobileStyles.responsiveCell, width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
            {data === undefined || data === null ? (
                  // Data is being fetched, show loader
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', height: '100px' }}>
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
                ) :(stableSort(generatedDocs, getComparator(order, "id")).map((row) => (
                <tr key={row.id}>
                  <td style={{ textAlign: "center", width: 120 }}></td>
                  <td className="font-semibold text-sm ">
                    
                    <Typography level="body-sm">{row.id}</Typography>
                  </td>
                  <td className="font-semibold text-sm ">
                    <Typography level="body-sm">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PdfSvg style={{width: 30, height: 30}} />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          {row.doc_id}
                          <Typography level="body-xs" color="neutral" sx={{ display: 'flex', gap: 0.5, whiteSpace: 'nowrap' }}>
                            <span>uploaded</span> {new Date(row.created_at).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short', 
                              year: 'numeric'
                            }).replace(/(\d+)/, (match) => {
                              const day = parseInt(match);
                              const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || day / 10 === 1) ? 0 : day % 10];
                              return day + suffix;
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Typography>
                  </td>
                  <td className="font-semibold text-sm " style={{ paddingLeft: '15px' }}>
                    <Typography level="body-sm">{row.doctype_name}</Typography>
                  </td>
                  <td className="font-semibold text-sm ">
                    <Typography level="body-sm">{truncateText(row.details,10)}</Typography>
                  </td>
                  {/* <td className="font-semibold text-sm ">
                    <Typography level="body-sm">{row.status}</Typography>
                  </td> */}
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={
                        {
                          DRAFT: <CheckRoundedIcon />,
                          DECLINED: <BlockIcon />,
                        }[row.status]
                      }
                      color={
                        {
                          DRAFT: "success",
                          DECLINED: "danger",
                        }[row.status] as ColorPaletteProp
                      }
                    >
                      {row.status}
                    </Chip>
                  </td>
                  
                  <td>
                    {/* <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}> */}
                      {/* <Link level="body-xs" component="button"> */}
                      {/* <Tooltip title="View">
                        <Button
                          sx={{ backgroundColor: "#d4ac0d", width: 35, marginRight: 1 }}
                          onClick={() => handleOpen("view",row.id)}
                          size="sm"
                          variant="solid"
                        >
                          <RemoveRedEyeIcon />
                          
                        </Button>
                      </Tooltip> */}
                      {/* <Tooltip title="Options">
                          <OptionsSvg style={{width: 15, height: 15}} />
                      </Tooltip> */}
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
                        {row.status === "draft" ? (
                          <Tooltip title="Submit">
                            <Button
                              sx={{ backgroundColor: "#4CAF50", width: 35 }}
                              onClick={() => handleOpen("submit",row.id)}
                              size="sm"
                              variant="solid"
                            >
                              <CallMadeIcon />
                              
                            </Button>
                        </Tooltip>
                        ):(
                          <Tooltip title="Declined Reason">
                            <Button
                              sx={{ backgroundColor: "#839192", width: 35 }}
                              onClick={() => handleMessage(row.id)}
                              size="sm"
                              variant="solid"
                            >
                              <MessageIcon/>
                          </Button>
                          </Tooltip>
                        )} */}
                        
                      
                      {/* </Link> */}
                    {/* </Box> */}

                      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Link level="body-xs" component="button">
                        
                            <IconButton 
                              onClick={(event) => handleMenuClick(event, row)}
                              variant="plain"
                              color="neutral"
                              sx={{ 
                                '--IconButton-size': '30px',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                              }}
                            >
                              <Kebab style={{ width: 20, height: 20 }} />
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
              placement="bottom-end"
              sx={{
                zIndex: 9999,
                minWidth: '200px',
                '--Menu-decoratorChildOffset': '0.5rem',
              }}
            >
              {selectedRow?.status !== "APPROVED" && selectedRow?.status !== "SUBMITTED" && (
                <MenuItem 
                  onClick={() => {
                    handleOpen("update", selectedRow?.id);
                    handleMenuClose();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    Edit Document
                    <EditIcon style={{ width: 25, height: 25, marginLeft: '8px' }} />
                  </Box>
                </MenuItem>
              )}
              <MenuItem 
                onClick={() => {
                  handleOpen("view", selectedRow?.id);
                  handleMenuClose();
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  View Document
                  <ViewIcon style={{ width: 25, height: 25, marginLeft: '8px' }} />
                </Box>
              </MenuItem>
              {selectedRow?.status === "DRAFT" && (
                <MenuItem 
                  onClick={() => {
                    handleOpen("submit", selectedRow.id);
                    handleMenuClose();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    Submit Document
                    <SubmitIcon style={{ width: 25, height: 25, marginLeft: '8px' }} />
                  </Box>
                </MenuItem>
              )} 
              {selectedRow?.status === "REJECTED" && (
                <MenuItem 
                  onClick={() => {
                    handleMessage(selectedRow?.id);
                    handleMenuClose();
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    Declined Reason
                    <MessageIcon style={{ width: 25, height: 25, marginLeft: '8px' }} />
                  </Box>
                </MenuItem>
              )}
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

    {/* Mobile pagination */}
    <Box
      className="Pagination-mobile"
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
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
      <Typography level="body-sm">Page 1 of 10</Typography>
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

export default GeneratedDocsTable;