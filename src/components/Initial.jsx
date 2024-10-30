import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import { CloseCircleOutlined } from '@ant-design/icons';
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
import { Alert, notification, Result } from "antd";
import { API_SERVER, headers } from "../constant";
import DocumentScan from "./DocumentScan";


const Initial = () => {
  const [open, setOpen] = useState(false);
  const [codeTypes, setCodeTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRequestedAmount, setSelectedRequestedAmount] = useState("");
  const [selectedCustomerNumber, setSelectedCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const [response, setResponse] = useState(null);
  const [isTransType, setIsTransType] = useState("");
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [modalType, setModalType] = useState(null); // 'result' 
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);

      // Reset the input value to allow re-selecting the same file
      event.target.value = "";
    }
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
    setModalType(null);
    setModalOpened(false);
  };


  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await axios.get(API_SERVER + `/get-parameters`, {
          headers: headers
        });
        setCodeTypes(response.data.doc_types);
        setBranches(response.data.branches);
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };

    fetchParameters();
  }, []);

  //get the details of a selected document type
  useEffect(() => {
    const fetchDocDetails = async () => {
      try {
          if(selectedDocType != null){
            const response = await axios.get(API_SERVER + `/code_creation_details/${selectedDocType}`, {
              headers: headers
            });
            
            const transType = response.data.code_detail[0].trans_type;

            //checks to see if the document type is a transactional document 
            if(transType === "1"){
              // alert(transType)
              setIsTransType(transType);
            }else{
              setIsTransType("0");
            }
        }
      } catch (error) {
        console.error("Error document type details:", error);
      }
    }

    fetchDocDetails();
  }, [selectedDocType]);

  

  const handleClear = () => {
    setSelectedDocType("");
    setSelectedBranch("");
    setSelectedRequestedAmount("");
    setSelectedCustomerNumber("");
    details("");
    setValidationError("");
  };

  //function to open notification
  const openNotification = (message) => {
    api.open({
      message: 'Error message',
      description:message,
      duration: 10,
      icon: <CloseCircleOutlined style={{ color: '#ff0000' }} />, // Icon to display in the notification
    });
  };

  //function to reset form
  const resetForm = () => {
    setSelectedDocType("");
    setSelectedBranch("");
    setSelectedRequestedAmount("");
    setSelectedCustomerNumber("");
    setDetails("");
  };

  //post generated doc
  const handleSave = async () => {

    //validate form

    const validationErrors = [];

    if (!selectedDocType) {
      validationErrors.push("document type.");
    }

    if (!selectedBranch) {
      validationErrors.push("branch.");
    }

    if (!details) {
      validationErrors.push("provide details to the document.");
    }

    if (validationErrors.length > 0) {
      // setValidationError(validationErrors.join(" "));
      openNotification(`Please fill in the following field(s): ${validationErrors.join(" ")}`);
      return;
    }


    // Reset validation error if the date is valid
    setValidationError("");

    const formData = {
      doctype_id: selectedDocType,
      branch: selectedBranch,
      requested_amount: selectedRequestedAmount,
      customer_number: selectedCustomerNumber,
      details: details,
    };

    // console.log("Form Data:", formData);

    // Uncomment the below code for actual API call
    try {
      

          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: API_SERVER + `/generate-doc`,
            headers: headers,
            data: formData
          };

          axios.request(config)
            .then((response) => {
              console.log(JSON.stringify(response.data));
              setModalType('result');
              setSuccess(response.data);

              // Reset the form after successful posting
              resetForm();
          })
          .catch((error) => {
            setModalType('result');
            setSuccess(error.response.data);
            console.log(error);
          });

    } catch (error) {
      console.error("Error generating document:", error);
      setError(error);
      setResponse(null);
      setOpen(true); // Open the modal to show the error
    }
  };

 

  return (

    
    <div>
      {/* this is the notification holder */}
      {contextHolder}
      {" "}
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
                  value={selectedDocType}
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
                  value={selectedBranch}
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

            {isTransType !== "0" && (
            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Requested Amount</FormLabel>
                <Input
                  size="sm"
                  type="number"
                  value={selectedRequestedAmount}
                  placeholder="Enter requested Amount"
                  onChange={(e) => setSelectedRequestedAmount(e.target.value)}
                />
              </FormControl>

              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Customer number</FormLabel>
                <Input
                  size="sm"
                  value={selectedCustomerNumber}
                  placeholder="Enter customer number"
                  onChange={(e) => setSelectedCustomerNumber(e.target.value)}
                />
              </FormControl>
            
            </Stack>)}
            <Stack direction="row" spacing={4}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel required>Details</FormLabel>
                <Textarea
                  color="neutral"
                  minRows={2}
                  value={details}
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

          {/* Success Modal */}
          <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={modalType === 'result'} onClose={closeModal}
                slotProps={{
                  backdrop: {
                    sx: {
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      backdropFilter: "none",
                    },
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
                    {success?.code === "200" ? (
                      <Result
                        status="success"
                        title={success?.message || "Operation Successful"}
                      />
                    ) : (
                      <Result
                        status="error"
                        title={success?.message || "Operation Failed"}
                      />
                    )}

                    
                  </Typography>
                </Sheet>
          </Modal>

        </Card>
      </Stack>
    </div>
  );
};

export default Initial;