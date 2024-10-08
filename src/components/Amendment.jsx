import React, { useState, useEffect } from "react";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Link from "@mui/joy/Link";
import Input from "@mui/joy/Input";
import Modal from "@mui/joy/Modal";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CreateIcon from "@mui/icons-material/Create";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import Stack from "@mui/joy/Stack";
import axios from "axios";
import dayjs from "dayjs";
import { ModalClose } from "@mui/joy";
import { Result } from "antd";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function Amendment() {
  const [order, setOrder] = useState("asc");
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState([]);
  const [bankId, setBankId] = useState(null);
  const [formDetails, setFormDetails] = useState({});
  const [licenseType, setLicenseType] = useState([]);
  const [frequency, setFrequency] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [noficationStart, setNotificationStartDate] = useState("");
  const [selectedLicenseType, setSelectedLicenseType] = useState("");
  const [endDateChange, setEndDateChange] = useState("");
  const [selectedLicenseDesc, setSelectedLicenseDesc] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedFreqDesc, setSelectedFreqDesc] = useState("");
  const [selectedNotificationFreq, setSelectedNotificationFreq] = useState("");
  const [validationError, setValidationError] = useState("");
  const [notificationFreq, setNotificationFreq] = useState([]);
  const [gracePeriod, setGracePeriod] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

  function frontendDate(dateString) {
    const originalDate = new Date(dateString);

    // Check if the date is valid
    if (isNaN(originalDate?.getTime())) {
      return ""; // Return empty string for invalid dates
    }

    const day = ("0" + originalDate.getDate())?.slice(-2); // Ensures leading zero if needed
    const month = ("0" + (originalDate.getMonth() + 1))?.slice(-2); // Adding leading zero if needed
    const year = originalDate.getFullYear();

    const formattedDate = `${year}-${month}-${day}`;
    console.log(formattedDate);
    return formattedDate.toUpperCase();
  }
  const fetchData = async () => {
    try {
      const response = await axios.get(ENDPOINT + `/get-licensed-banks`);
      console.log("Save response:", response.data);
      setDetails(response.data.message);
    } catch (error) {
      console.error("Error saving details:", error);
    }
  };

  const fetchDetails = async (bankId) => {
    try {
      const response = await axios.post(ENDPOINT + "/get-bank-details", {
        bank_id: bankId,
      });
      console.log("Response:", response.data);
      setFormDetails(response.data.message[0]);
      setSelectedLicenseType(response.data.message[0]?.license_type_id);
      setSelectedLicenseDesc(response.data.message[0]?.license_type);
      setSelectedFrequency(response.data.message[0]?.license_frequency_id);
      setSelectedFreqDesc(response.data.message[0]?.license_frequency);
      setEndDateChange(frontendDate(response.data.message[0]?.end_date) || "");
      setStartDate(frontendDate(response.data.message[0]?.start_date) || "");
      setNotificationStartDate(
        frontendDate(response.data.message[0]?.notification_start) || ""
      );
      setGracePeriod(response.data.message[0]?.grace_period);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (bankId !== null) {
      fetchDetails(bankId);
    }
  }, [bankId]);

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
        <FormLabel>Bank Name</FormLabel>
        <Select size="sm" placeholder="All">
          <Option value="all">All</Option>
          <Option value="Bank of America">Bank of America</Option>
          <Option value="Chase Bank">Chase Bank</Option>
          <Option value="Wells Fargo">Wells Fargo</Option>
          <Option value="Citibank">Citibank</Option>
          <Option value="US Bank">US Bank</Option>
        </Select>
      </FormControl>
    </React.Fragment>
  );

  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const response = await axios.get(ENDPOINT + `/get-license-parameters`);
        // setBankNames(response.data.bankParams);
        // setSelectedLicenseType(response.data.licenseTypeParams[0].id);
        setLicenseType(response.data.licenseTypeParams);
        setFrequency(response.data.licenseFrequencyParams);
        setNotificationFreq(response.data.notificationFrequencyParams);
        console.log("Bank names:", response.data);
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };

    fetchBankNames();
  }, []);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleNotificationStartChange = (event) => {
    setNotificationStartDate(event.target.value);
  };

  const endDateChangeFunction = (event) => {
    setEndDateChange(event.target.value);
  };

  const handleLicenseTypeChange = (event) => {
    console.log("the new event !!", event.target.value);
    setSelectedLicenseType(event.target.value);
  };

  console.log("selected license type ", selectedLicenseType);

  useEffect(() => {
    if (startDate && selectedFrequency) {
      setEndDateChange(calculateEndDate(startDate, selectedFrequency));
    }
  }, [startDate, selectedFrequency]);

  useEffect(() => {
    if (startDate && selectedFrequency) {
      console.log(
        "Calculating end date with startDate:",
        startDate,
        "and selectedFrequency:",
        selectedFrequency
      );
      setEndDateChange(calculateEndDate(startDate, selectedFrequency));
    }
  }, [startDate, selectedFrequency]);

  const calculateEndDate = (startDate, frequencyId) => {
    const start = dayjs(startDate);
    let end;

    // Find the frequency object based on the frequencyId
    const frequencyObj = frequency.find((freq) => freq.id === frequencyId);

    if (frequencyObj) {
      switch (frequencyObj.code_desc) {
        case "Monthly":
          end = start.add(1, "month");
          break;
        case "Quarterly":
          end = start.add(3, "month");
          break;
        case "Semiannually":
          end = start.add(6, "month");
          break;
        case "Annually":
          end = start.add(1, "year");
          break;
        default:
          end = start;
      }
    } else {
      end = start;
    }

    console.log("Calculated end date:", end.format("YYYY-MM-DD"));
    return end.format("YYYY-MM-DD");
  };

  useEffect(() => {
    if (startDate && endDateChange && noficationStart) {
      if (
        dayjs(noficationStart).isBefore(startDate) ||
        dayjs(noficationStart).isAfter(endDateChange)
      ) {
        setValidationError(
          "Notification start date must be between start date and end date."
        );
      } else {
        setValidationError("");
        setSelectedNotificationFreq(
          calculateNotificationFrequency(
            startDate,
            endDateChange,
            noficationStart
          )
        );
      }
    }
  }, [startDate, endDateChange, noficationStart]);

  const calculateNotificationFrequency = (
    startDate,
    endDate,
    notificationStart
  ) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const notification = dayjs(notificationStart);

    const totalDays = end.diff(start, "day");
    const notificationDays = end.diff(notification, "day");

    if (notificationDays <= 14) {
      return "Daily";
    } else if (notificationDays <= 60) {
      return "Weekly";
    } else {
      return "Monthly";
    }
  };

  const notificationFreqObj = notificationFreq.find(
    (freq) => freq.code_desc === selectedNotificationFreq
  );
  const notificationFrequencyId = notificationFreqObj
    ? notificationFreqObj.id
    : "";

  const handleSave = async () => {
    const formPush = {
      bankId,
      selectedFrequency,
      selectedLicenseType,
      startDate,
      endDateChange,
      noficationStart,
      notificationFreq,
      gracePeriod,
    };
    if (
      dayjs(noficationStart).isBefore(startDate) ||
      dayjs(noficationStart).isAfter(endDateChange)
    ) {
      setValidationError(
        "Notification start date must be between start date and end date."
      );
      setConfirm(true); // Open the modal to show the validation error
      return;
    }

    // Reset validation error if the date is valid
    setValidationError("");

    // Find the notification frequency id based on the selectedNotificationFreq
    const notificationFreqObj = notificationFreq.find(
      (freq) => freq.code_desc === selectedNotificationFreq
    );
    const notificationFrequencyId = notificationFreqObj
      ? notificationFreqObj.id
      : "";

    const formData = {
      bank_id: bankId,
      license_type_id: selectedLicenseType,
      license_frequency_id: selectedFrequency,
      notification_frequency_id: notificationFrequencyId,
      start_date: startDate,
      end_date: endDateChange,
      notification_start: noficationStart,
      grace_period: gracePeriod,
    };

    console.log("Form Data:", formData);

    // Uncomment the below code for actual API call
    try {
      const response = await axios.put(
        ENDPOINT + `/amend-license-details`,
        formData
      );
      console.log("Response:", response.data);
      setResponse(response.data);
      setError(null);
      setConfirm(true); // Open the modal to show the response

      // Download the response
      // const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
      //   type: "text/plain",
      // });
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "response.txt";
      // a.click();
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating license:", error);
      setError(error);
      setResponse(null);
      setConfirm(true); // Open the modal to show the error
    }
  };
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
          <FormLabel>Search for bank</FormLabel>
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
          width: "80%",
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
                  onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                  fontWeight="lg"
                  endDecorator={<ArrowDropDownIcon />}
                  sx={{
                    "& svg": {
                      transition: "0.2s",
                      transform:
                        order === "desc" ? "rotate(0deg)" : "rotate(180deg)",
                    },
                  }}
                >
                  ID
                </Link>
              </th>
              <th style={{ width: 140, padding: "12px 6px" }}>Bank Name</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Status</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Amend</th>
            </tr>
          </thead>
          <tbody>
            {stableSort(details, getComparator(order, "id")).map((row) => (
              <tr key={row.bank_id}>
                <td style={{ textAlign: "center", width: 120 }}></td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.bank_id}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Typography level="body-sm">{row.bank_desc}</Typography>
                </td>
                <td className="font-semibold text-sm ">
                  <Chip
                    size="sm"
                    variant="soft"
                    startDecorator={
                      row.status === "Active" && (
                        <CheckRoundedIcon sx={{ color: "green" }} />
                      )
                    }
                    color={row.status === "Active" ? "success" : "neutral"}
                  >
                    {row.status}
                  </Chip>
                </td>
                <td>
                  <Button
                    sx={{ backgroundColor: "#00357A", width: 35 }}
                    onClick={() => {
                      setBankId(row.bank_id);
                      setOpen(true);
                    }}
                    size="sm"
                    variant="solid"
                  >
                    <CreateIcon />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginLeft: "15%",
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "none",
            }, // Example backdrop styling
          },
        }}
      >
        <Card>
          <Box
            sx={{
              width: 700,
              backgroundColor: "#00357A",
              padding: 1,
            }}
          >
            <Typography sx={{ ml: 0.5, color: "white" }} level="title-lg">
              Edit Bank Details
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={4}>
            <Stack spacing={1}>
              <FormLabel>Bank Name</FormLabel>
              <FormControl sx={{ width: "100%" }}>
                <Select
                  size="sm"
                  startDecorator={<AccountBalanceIcon />}
                  value={formDetails.bank_desc || ""}
                  placeholder="Select Bank"
                  disabled
                >
                  <Option value={formDetails.bank_desc}>
                    {formDetails.bank_desc}
                  </Option>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>License Type</FormLabel>
                <Select
                  size="sm"
                  // value={formDetails.license_type}
                  value={selectedLicenseType}
                  placeholder={selectedLicenseDesc}
                  // onChange={handleLicenseTypeChange}
                  onChange={(e, newValue) => setSelectedLicenseType(newValue)}
                >
                  {/* <Option
                    value={selectedLicenseType}
                    children={selectedLicenseDesc}
                  >
                    {selectedLicenseDesc}
                  </Option> */}
                  {licenseType.map((freq) => (
                    <Option key={freq.id} value={freq.id}>
                      {freq.code_desc}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Frequency</FormLabel>
                <Select
                  size="sm"
                  value={selectedFrequency}
                  placeholder={selectedFreqDesc}
                  // renderValue={selectedFreqDesc}
                  onChange={(e, newValue) => setSelectedFrequency(newValue)}
                >
                  {/* <Option
                    value={selectedFrequency}
                    children={selectedFreqDesc}
                  /> */}

                  {frequency.map((freq) => (
                    <Option key={freq.id} value={freq.id}>
                      {freq.code_desc}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Start Date</FormLabel>
                <Input
                  size="sm"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  // placeholder={formDetails.start_date}
                />
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>End Date</FormLabel>
                <Input
                  size="sm"
                  type="date"
                  value={endDateChange}
                  onChange={endDateChangeFunction}
                  // disabled
                />
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Notification Start</FormLabel>
                <Input
                  size="sm"
                  type="date"
                  // value={formDetails.notification_start?.slice(0, 10) || ""}
                  value={noficationStart}
                  onChange={handleNotificationStartChange}
                />
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Notification Frequency</FormLabel>
                {/* <Select
                  size="sm"
                  value={formDetails.notification_frequency || ""}
                  placeholder="Select Notification"
                  onChange={(e, newValue) =>
                    setSelectedNotificationFreq(newValue)
                  }
                > */}
                <Input
                  size="sm"
                  type="text"
                  value={selectedNotificationFreq}
                  readOnly
                />

                {/* </Select> */}
              </FormControl>
            </Stack>

            <div>
              <Stack direction="row" spacing={4}>
                <FormControl sx={{ width: "48%" }}>
                  <FormLabel>Grace Period</FormLabel>
                  <Input
                    size="sm"
                    value={gracePeriod}
                    placeholder="Grace Period"
                    onChange={(e, newValue) => setGracePeriod(newValue)}
                  />
                </FormControl>
              </Stack>
            </div>
          </Stack>

          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button
                size="sm"
                variant="solid"
                sx={{ backgroundColor: "#00357A" }}
                // onClick={() => setOpen(false)}
                onClick={() => {
                  setConfirm(true);
                  handleSave();
                }}
              >
                Save
              </Button>
            </CardActions>
            <Modal
              aria-labelledby="modal-title"
              aria-describedby="modal-desc"
              open={confirm}
              onClose={() => setConfirm(false)}
              slotProps={{
                backdrop: {
                  sx: {
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "none",
                  }, // Example backdrop styling
                },
              }}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: "15%",
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
                <Typography id="modal-desc" textColor="text.tertiary">
                  {validationError ? (
                    <Result
                      status="error"
                      title="Validation Error"
                      subTitle={validationError}
                    />
                  ) : response && response.code === "200" ? (
                    <Result
                      status="success"
                      title={response.result}
                      // subTitle="Your license has been successfully generated."
                      // extra={[
                      //   <Button
                      //     type="primary"
                      //     key="console"
                      //     onClick={() => {
                      //       const subject = encodeURIComponent(
                      //         "License Information"
                      //       );
                      //       const body = encodeURIComponent(
                      //         `Dear Sir/Madam,\n\nWe are pleased to inform you that your license has been successfully generated. Below are the details:\n\n${JSON.stringify(
                      //           response.data,
                      //           null,
                      //           2
                      //         )}\n\nBest regards,\nYour Company`
                      //       );
                      //       window.location.href = `mailto:?subject=${subject}&body=${body}`;
                      //     }}
                      //   >
                      //     Send Mail
                      //   </Button>,
                      //   <Button key="buy" onClick={() => setOpen(false)}>
                      //     Generate Another License
                      //   </Button>,
                      // ]}
                    />
                  ) : error ? (
                    <Result
                      status="error"
                      title={error.response.data.result}
                      subTitle="Please check and modify the following information before resubmitting."
                    />
                  ) : null}
                </Typography>
              </Sheet>
            </Modal>
          </CardOverflow>
        </Card>
      </Modal>
    </React.Fragment>
  );
}
