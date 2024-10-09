import React, { useState, useEffect } from "react";
import axios from "axios";
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
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Input from "@mui/joy/Input";
import Textarea from '@mui/joy/Textarea';
import Swal from "sweetalert2";
import { Alert, notification, Result } from "antd";
import dayjs from "dayjs";
import {API_SERVER, headers} from "../constant";
import DocumentScan from "./DocumentScan";
// import { Textarea } from "flowbite-react";
// import Modal from "react-bootstrap/Modal";

const Initial = () => {
  const [open, setOpen] = useState(false);
  const [codeTypes, setCodeTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  // const [frequency, setFrequency] = useState([]);
  // const [notificationFreq, setNotificationFreq] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRequestedAmount, setSelectedRequestedAmount] = useState("");
  const [selectedCustomerNumber, setSelectedCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedNotificationFreq, setSelectedNotificationFreq] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notificationStart, setNotificationStart] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFile(file);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    setLoading(true); // Set loading to true immediately after file selection
    setTimeout(() => {
      setModalOpened(true);
      setLoading(false); // Set loading to false when modal is opened
    }, 2000); // Simulate delay for demonstration purpose (2 seconds)
  };

  const closeModal = () => {
    setSelectedFile(null);
    setModalOpened(false);
  };

  const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await axios.get(API_SERVER + `/get-parameters`,{
          headers: headers});
        setCodeTypes(response.data.doc_types);
        setBranches(response.data.branches);
        // setFrequency(response.data.licenseFrequencyParams);
        // setNotificationFreq(response.data.notificationFrequencyParams);
        console.log("code types:", response.data.doc_types);
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };

    fetchParameters();
  }, []);


  useEffect(() => {
    if (startDate && endDate && notificationStart) {
      if (
        dayjs(notificationStart).isBefore(startDate) ||
        dayjs(notificationStart).isAfter(endDate)
      ) {
        setValidationError(
          "Notification start date must be between start date and end date."
        );
      } else {
        setValidationError("");
        setSelectedNotificationFreq(
          calculateNotificationFrequency(startDate, endDate, notificationStart)
        );
      }
    }
  }, [startDate, endDate, notificationStart]);

  const handleConsole = () => {
    console.log("Selected Bank:", selectedDocType);
    console.log("Selected License Type:", selectedBranch);
    // console.log("Selected Frequency:", selectedFrequency);
    console.log("Selected Notification Frequency:", selectedNotificationFreq);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Notification Start:", notificationStart);
    console.log("Details:", details);
  };

  const handleClear = () => {
    setSelectedDocType("");
    setSelectedBranch("");
    setSelectedRequestedAmount("");
    setSelectedCustomerNumber("");
    details("");
    setValidationError("");
  };

  const handleSave = async () => {

    //validate form

    //this checks if the user has selected document type
    if (!selectedDocType) {
      setValidationError("Please select a document type.");
      setOpen(true); // Open the modal to show the validation error
      return;
    }

    //this checks if the user has selected branch
    if (!selectedBranch) {
      setValidationError("Please select a branch.");
      setOpen(true); // Open the modal to show the validation error
      return;
    }

    //this checks if the user has provided details for the document
    if (!details) {
      setValidationError("Please provide details to the document.");
      setOpen(true); // Open the modal to show the validation error
      return;
    }

    // Reset validation error if the date is valid
    setValidationError("");

    

    const formData = {
      doc_type: selectedDocType,
      branch: selectedBranch,
      requested_amount: selectedRequestedAmount,
      
      license_frequency_id: selectedFrequency,
      license_frequency_desc: frequency.find(
        (freq) => freq.id === selectedFrequency
      ).code_desc,
      notification_frequency_id: notificationFrequencyId,
      notification_frequency_desc: selectedNotificationFreq,
      // notification_frequency_id: 1,
      start_date: startDate,
      end_date: endDate,
      notification_start: notificationStart,
      grace_period: gracePeriod,
    };

    // console.log("Form Data:", formData);

    // Uncomment the below code for actual API call
    // try {
    //   const response = await axios.post(
    //     ENDPOINT + `/generate-license`,
    //     formData
    //   );
    //   console.log("Response:", response.data);
    //   setResponse(response.data);
    //   setError(null);
    //   setOpen(true); // Open the modal to show the response

    //   const content = response.data.data;

    //   // Create a Blob with the string content
    //   const blob = new Blob([content], { type: "text/plain" });

    //   // Create a URL for the Blob
    //   const url = window.URL.createObjectURL(blob);

    //   // Create a temporary anchor element to trigger the download
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = "license.txt";

    //   // Append anchor to the document and click to trigger download
    //   document.body.appendChild(a);
    //   a.click();

    //   // Clean up: Remove the anchor from the document and revoke the Blob URL
    //   document.body.removeChild(a);
    //   window.URL.revokeObjectURL(url);
    //   // }
    // } catch (error) {
    //   console.error("Error generating license:", error);
    //   setError(error);
    //   setResponse(null);
    //   setOpen(true); // Open the modal to show the error
    // }
  };

  useEffect(() => {
    if (startDate && selectedFrequency) {
      console.log(
        "Calculating end date with startDate:",
        startDate,
        "and selectedFrequency:",
        selectedFrequency
      );
      // setEndDate(calculateEndDate(startDate, selectedFrequency));
    }
  }, [startDate, selectedFrequency]);

 

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

  return (
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
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Document Request</Typography>
            {/* <Typography level="body-sm">
              Fill the form to generate document
            </Typography> */}
          </Box>
          <Divider />
          <Stack spacing={4}>
            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
              <FormLabel required>Document</FormLabel>
                <Select
                  autoFocus={true}
                  size="sm"
                  startDecorator={<AccountBalanceIcon />}
                  defaultValue="0"
                  placeholder="Select Document Type"
                  onChange={(e, newValue) => setSelectedDocType(newValue)}
                >
                  {codeTypes.map((codeType) => (
                    <Option key={codeType.id} value={codeType.id}>
                      {codeType.description}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel required>Branch</FormLabel>
                <Select
                  size="sm"
                  defaultValue="0"
                  placeholder="Select Type"
                  onChange={(e, newValue) => setSelectedBranch(newValue)}
                >
                  {branches.map((branch) => (
                    <Option key={branch.id} value={branch.id}>
                      {branch.description}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Requested Amount</FormLabel>
                <Input
                    size="sm"
                    placeholder="Enter requested Amount"
                    onChange={(e) => setSelectedRequestedAmount(e.target.value)}
                  />
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Customer number</FormLabel>
                <Input
                    size="sm"
                    placeholder="Enter customer number"
                    onChange={(e) => setSelectedCustomerNumber(e.target.value)}
                  />
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel required>Details</FormLabel>
                <Textarea
                    color="neutral"
                    minRows={2}
                    // size="sm"
                    height="100px"
                    placeholder="Enter customer number"
                    onChange={(e) => setDetails(e.target.value)}
                  />
              </FormControl>
            </Stack>


            {validationError && (
              <Alert type="error" message={validationError} showIcon />
            )}

              <div className="w-full">
              <Stack direction="row" spacing={4} sx={{ width: '100%' }} >
                <DocumentScan
                  selectedFile={selectedFile}
                  modalOpened={modalOpened}
                  loading={loading}
                  handleFileDrop={handleFileDrop}
                  handleFile={handleFile}
                  closeModal={closeModal}
                  handleFileChange={handleFileChange}
                  sx={{ flexGrow: 1 }}
                />
              </Stack>
            </div>
          </Stack>

          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={() => handleClear()}
              >
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
          {/* <Modal
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
                {response && response.code === "200" && (
                  <Result
                    status="success"
                    title={response.result}
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
                            `Dear Sir/Madam,\n\nWe are pleased to inform you that your license has been successfully generated. Below are the details:\n\n${JSON.stringify(
                              response.data,
                              null,
                              2
                            )}\n\nBest regards,\nYour Company`
                          );
                          window.location.href = `mailto:?subject=${subject}&body=${body}`;
                        }}
                      >
                        Send Mail
                      </Button>,
                      <Button key="buy" onClick={() => setOpen(false)}>
                        Generate Another License
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
          </Modal> */}
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
                    subTitle="Your license has been successfully generated."
                    extra={[
                      <Button
                        type="primary"
                        key="console"
                        onClick={() => {
                          // const from = "1234@example.com";
                          const subject = encodeURIComponent(
                            "License Information"
                          );
                          // const body = encodeURIComponent(
                          //   `Dear Sir/Madam,\n\nYour license has been successfully generated. Below are the details:\n\n${response.data}\n\nBest regards,\nUNION SYSTEMS GLOBAL`
                          // );
                          const body = encodeURIComponent(
                            `Dear Sir/Madam,\n\nYour license has been successfully generated. Find the details in the attached document below\n\nBest regards,\nUNION SYSTEMS GLOBAL`
                          );
                          // window.location.href = `mailto:?from=${from}&subject=${subject}&body=${body}`;
                          window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
                        }}
                      >
                        Send Mail
                      </Button>,
                      <Button key="buy" onClick={() => setOpen(false)}>
                        Generate Another License
                      </Button>,
                    ]}
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
        </Card>
      </Stack>
    </div>
  );
};

export default Initial;
