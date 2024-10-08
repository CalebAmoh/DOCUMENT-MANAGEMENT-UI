import React, { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Stack from "@mui/joy/Stack";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Typography from "@mui/joy/Typography";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import axios from "axios";
import Input from "@mui/joy/Input";
import dayjs from "dayjs";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
// import Result from "@mui/joy/Result";
import { Alert, Result } from "antd";
// require("dotenv").config();

const Renewal = () => {
  const [bankNames, setBankNames] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [bankId, setBankId] = useState("");
  const [details, setDetails] = useState({});
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [notificationDate, setNotificationDate] = useState("");
  const [selectedNotificationFreq, setSelectedNotificationFreq] = useState("");

  // require("dotenv").config();
  const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  console.log(ENDPOINT);

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

  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/get-licensed-banks");
        setBankNames(response.data.message);
        console.log("Bank names:", response.data.message);
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };

    fetchBankNames();
  }, []);

  // const handleSave = async () => {
  //   const formData = {
  //     bank_id: bankId,
  //     license_type_id: details.license_type_id,
  //     license_frequency_id: details.license_frequency_id,
  //     start_date: details.start_date,
  //     end_date: endDate,
  //     notification_start: notificationDate,
  //     notification_frequency_id: details.notification_frequency_id,
  //     grace_period: details.grace_period,
  //   };
  //   try {
  //     const response = await axios.post(
  //       "http://10.203.14.73:3000/v1/api/license/reactivate-license",
  //       formData
  //     );
  //     console.log("Save response:", response);
  //     console.log("Saved details:", formData);
  //     setResponse(response);
  //     // Add any additional handling for success (e.g., displaying a success message)
  //   } catch (error) {
  //     console.error("Error saving details:", error);
  //     console.log("Error details:", formData);
  //     setError(error);
  //     setResponse(null);

  //     // Add any additional handling for error (e.g., displaying an error message)
  //   }
  // };

  const handleSave = async () => {
    const formData = {
      bank_id: bankId,
      bank_desc: details.bank_desc,
      license_type_id: details.license_type_id,
      license_type_desc: details.license_type,
      license_frequency_id: details.license_frequency_id,
      license_frequency_desc: details.license_frequency,
      start_date: details.start_date,
      end_date: endDate,
      notification_start: notificationDate,
      notification_frequency_id: details.notification_frequency_id,
      notification_frequency_desc: selectedNotificationFreq,
      grace_period: details.grace_period,
    };
    try {
      const response = await axios.post(
        ENDPOINT + "/reactivate-license",
        formData
      );
      console.log("Save response:", response);
      console.log("Saved details:", formData);
      setResponse(response);
      const content = response.data.data;

      // Create a Blob with the string content
      const blob = new Blob([content], { type: "text/plain" });

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "license.txt";

      // Append anchor to the document and click to trigger download
      document.body.appendChild(a);
      a.click();

      // Clean up: Remove the anchor from the document and revoke the Blob URL
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // // Clear form upon successful save
      // if (response.status === 200) {
      //   setSelectedBank("");
      // }

      // if (response.data.code === "200") {
      //   setSelectedBank("");
      //   setBankId("");
      // }

      // Add any additional handling for success (e.g., displaying a success message)
    } catch (error) {
      console.error("Error saving details:", error);
      console.log("Error details:", formData);
      setError(error);
      setResponse(null);

      // Add any additional handling for error (e.g., displaying an error message)
    }
  };

  const handleBankChange = (event, newValue) => {
    setSelectedBank(newValue);
    const selectedBankName = bankNames.find(
      (bank) => bank.bank_id === newValue
    )?.bank_id;
    setBankId(selectedBankName);
    console.log("Selected bank name:", selectedBankName);
  };

  const fetchDetails = async () => {
    try {
      const response = await axios.post(ENDPOINT + "/get-bank-details", {
        bank_id: bankId,
      });
      console.log("Response:", response.data);
      setDetails(response.data.message[0]);
      setEndDate(
        calculateEndDate(
          response.data.message[0].end_date,
          response.data.message[0].license_frequency
        )
      );
      setNotificationDate(
        calculateNotificationDate(
          response.data.message[0].notification_start,
          response.data.message[0].license_frequency
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [bankId]);

  const calculateEndDate = (startDate, frequency) => {
    const start = dayjs(startDate);
    let end;
    switch (frequency) {
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
    return end.format("YYYY-MM-DD");
  };

  const calculateNotificationDate = (notification_start, frequency) => {
    const start = dayjs(notification_start);
    let end;
    switch (frequency) {
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
    return end.format("YYYY-MM-DD");
  };

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

  useEffect(() => {
    setSelectedNotificationFreq(
      calculateNotificationFrequency(
        details.startDate,
        endDate,
        notificationDate
      )
    );
  }, [details.startDate, endDate, notificationDate]);
  return (
    <div>
      <div>
        <Stack
          spacing={4}
          sx={{
            display: "flex",
            maxWidth: "800px",
            mx: "auto",
            px: { xs: 2, md: 6 },
            py: { xs: 2, md: 3 },
          }}
        >
          {/* <Card>
            <Box sx={{ mb: 1 }}>
              <Typography level="title-md">Document Approval</Typography>
              <Typography level="body-sm">
                Fill the form to generate encrypted key
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
                    defaultValue="0"
                    placeholder="Select Bank"
                    onChange={handleBankChange}
                  >
                    {bankNames.map((bank) => (
                      <Option key={bank.bank_id} value={bank.bank_id}>
                        {" " + bank.bank_desc}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={4}>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>License Type</FormLabel>
                  <Select size="sm" defaultValue="1" disabled>
                    <Option value="1">{details.license_type}</Option>
                  </Select>
                </FormControl>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>Frequency</FormLabel>
                  <Select disabled size="sm" defaultValue="1">
                    <Option value="1">{details.license_frequency}</Option>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={4}>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>Previous Subscription Date</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    disabled
                    value={frontendDate(details.start_date)}
                  />
                </FormControl>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>Next Subscription Date</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    disabled
                    value={frontendDate(details.end_date)}
                  />
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={4}>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    disabled
                    size="sm"
                    type="date"
                    value={frontendDate(details.end_date)}
                  />
                </FormControl>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>End Date</FormLabel>
                  <Input size="sm" type="date" disabled value={endDate} />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={4}>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>Notification Start</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    disabled
                    value={notificationDate}
                  />
                </FormControl>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>Notification Frequency</FormLabel>
                  <Input
                    size="sm"
                    disabled
                    value={details.notification_frequency}
                    // value={selectedNotificationFreq}
                  />
                </FormControl>
              </Stack>

              <div>
                <Stack direction="row" spacing={4}>
                  <FormControl sx={{ width: "47.5%" }}>
                    <FormLabel>Grace Period</FormLabel>
                    <Input size="sm" disabled value={details.grace_period} />
                  </FormControl>
                </Stack>
              </div>
            </Stack>

            <CardOverflow
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            >
              <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                <Button size="sm" variant="outlined" color="neutral">
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  sx={{ backgroundColor: "#00357A" }}
                  onClick={() => {
                    setOpen(true);
                    handleSave();
                  }}
                >
                  Save
                </Button>
              </CardActions>
            </CardOverflow>
            <Modal
              aria-labelledby="modal-title"
              aria-describedby="modal-desc"
              open={open}
              onClose={() => setOpen(false)}
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
                  {response && response.data.code === "200" && (
                    <Result
                      status="success"
                      title={response.data.result}
                      subTitle="Your license has been successfully generated."
                      extra={[
                        <Button
                          type="primary"
                          key="console"
                          onClick={() => {
                            const subject = encodeURIComponent(
                              "License Information"
                            );
                            const body = encodeURIComponent(
                              `Dear Sir/Madam,\n\nWe are pleased to inform you that your license has been successfully generated. Below are the details:\n\n${response.data.data}\n\nBest regards,\nUNION SYSTEMS GLOBAL`
                            );
                            window.location.href = `mailto:?subject=${subject}&body=${body}`;
                          }}
                        >
                          Send Mail
                        </Button>,
                        <Button key="buy" onClick={() => setOpen(false)}>
                          Renew Another License
                        </Button>,
                      ]}
                    />
                  )}

                  {error && (
                    <Result
                      status="error"
                      title={error.response.data.result}
                      subTitle="Please check and modify the following information before resubmitting."
                    />
                  )}
                </Typography>
              </Sheet>
            </Modal>
          </Card> */}
        </Stack>
      </div>
    </div>
  );
};

export default Renewal;
