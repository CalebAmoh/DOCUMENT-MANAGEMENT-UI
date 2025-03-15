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
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
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
import CountrySelector from "./DocumentSelector";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactComponent as AddDocIcon } from "../utils/icons/add-file-svgrepo.svg";
import { ReactComponent as PreviousIcon } from "../utils/icons/previous-svgrepo-com.svg";
import { Add } from "@mui/icons-material";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const Initial = () => {
  const [open, setOpen] = useState(false);
  const [codeTypes, setCodeTypes] = useState([]);
  const [availableDocTypes, setAvailableDocTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRequestedAmount, setSelectedRequestedAmount] = useState("");
  const [selectedCustomerNumber, setSelectedCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const {user} = useAuth();
  const [docId, setGeneratedDocId] = useState("");
  const [response, setResponse] = useState(null);
  const [isTransType, setIsTransType] = useState("");
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [modalType, setModalType] = useState(null); // 'result' 
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);
  const [api, contextHolder] = notification.useNotification();


  const axiosPrivate = useAxiosPrivate();
  
  //handle document uploads and generating od doc id
  const handleGenerateDocId = async  (doc) => {
    setModalType('progress');
    setProgress(true); // Set loading to true before making the API call
    try {
      const response = await axios.post(`http://10.203.14.169/dms/scan/insert_doc_api.php`, {
        file: doc,
      }, {
        timeout: 30000 // 30 seconds timeout
      });
      
      setGeneratedDocId(response.data.token);
      // setGeneratedDocId("66788373779");

      
    } catch (error) {
      // console.error("Error:", error);
      // Handle specific network timeout error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Network Error')) {
        notifyError("Connection timed out. Please check your network connection and try again.");
      } else {
        // Handle other errors
        notifyError(error.response?.data?.message || "An error occurred while uploading the document");
      }
    } finally {
      console.log(modalType);
      setModalType('');
      setProgress(false); //Set loading to false after the API call is complete
    }
  }

  

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
    // setModalType(null);
    setModalOpened(false);
  };


  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await axiosPrivate.get(`/get-parameters`, {
          withCredentials: true
        });
        setCodeTypes(response.data.result.doctypes.data);
        // setBranches(response.data.branches);
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };

    fetchParameters();
  }, []);
  
  
  useEffect(() => {
    const fetchDocTypesWithApprovalSetups = async () => {
      try {
        const response = await axiosPrivate.get(`/get-doctype-with-approval-setup`, {
          withCredentials: true
        });
        console.log("testsss",response)
        // setCodeTypes(response.data.result.doctypes.data);
        // setBranches(response.data.branches);
        setAvailableDocTypes(response.data.results)
      } catch (error) {
        notifyError(error.response.data.message)
        console.error("Error fetching bank names:", error.response.data.message);
      }
    };

    fetchDocTypesWithApprovalSetups();
  }, []);

  //get the details of a selected document type
  useEffect(() => {
    const fetchDocDetails = async () => {
      try {
          if(selectedDocType != null){
            const response = await axiosPrivate.get(`/get-code-creation-details${selectedDocType}`, {
              withCredentials:true
            });
            console.log("Document Type Details:", response);
            const transType = response.data.result[0].trans_type;
            // const transType = response.data.code_details[0].trans_type;

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
  const openErrorNotification = (pauseOnHover) => (message) => {
    api.open({
      message: 'Error Message',
      description:message,
      showProgress: true,
      duration: 20,
      pauseOnHover,
      icon: <CloseCircleOutlined style={{ color: '#ff0000' }} />
    });
  };
  //handles success notifications
  const openSuccessNotification = (pauseOnHover) => (message) => {
    api.open({
      message: 'SUCCESS MESSAGE',
      description:message,
      showProgress: true,
      duration: 20,
      pauseOnHover,
      icon: <CheckCircleOutlineOutlinedIcon style={{ color: '#45b39d' }} />
    });
  };
  const notifySuccess = openSuccessNotification(true);
  const notifyError = openErrorNotification(true);

  // to handle closing of the modal
  const handleClose = () => setModalType(null);
  

  //function to reset form
  const resetForm = () => {
    setSelectedDocType("");
    setSelectedBranch("");
    setSelectedRequestedAmount("");
    setSelectedCustomerNumber("");
    setGeneratedDocId("");
    setDetails("");
  };

  //post generated doc
  const handleSave = async () => {

    //validate form

    const validationErrors = [];

    if (!selectedDocType) {
      validationErrors.push("document type");
    }

    // if (!selectedBranch) {
    //   validationErrors.push("branch");
    // }

    if (!selectedRequestedAmount && isTransType !== "0") {
      validationErrors.push("requested amount");
    }

    if (!selectedCustomerNumber && isTransType !== "0") {
      validationErrors.push("customer number");
    }

    if (!details) {
      validationErrors.push("details to the document");
    }
    
    if (!docId) {
      validationErrors.push("upload a document");
    }

    if (validationErrors.length > 0) {
      const notify = openErrorNotification(true);
      let errors = validationErrors;
      if (errors.length > 1) {
          errors = errors.slice(0, -1).join(", ") + " and " + errors.slice(-1);
      } else {
          errors = errors.join(", ");
      }
      notify("Please provide: " + errors);
      return;
    }


    // Reset validation error if the date is valid
    setValidationError("");

    try {
      
          const response = await axiosPrivate.post(`/generate-doc`,{
            doctype_id: selectedDocType,
            // branch: selectedBranch,
            requested_amount: selectedRequestedAmount,
            customer_number: selectedCustomerNumber,
            details: details,
            doc_id: docId,
            user_id: user.id
          },{withCredentials: true});

          console.log("Response:", response);
          if(response.data.code === "201") {
            notifySuccess(response.data.result);
            setModalType(null);
          }else{
            notifyError(response.data.result);
          }
          resetForm();
    } catch (error) {
      notifyError(error.response?.data?.result || "An error occurred while generating document");
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
        spacing={2}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 1, sm: 2, md: 6 },
          py: { xs: 1, sm: 2, md: 3 },
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
          <Stack spacing={2}>
            <Stack 
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 4 }}
            >
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
                  {availableDocTypes.map((availableDocType) => (
                    <Option key={availableDocType.id} value={availableDocType.id}>
                      {availableDocType.description}
                    </Option>
                  ))}
                </Select>
                {/* <CountrySelector /> */}
              </FormControl>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel required>Document Id (Upload file to generate id)</FormLabel>
                <Input
                  size="sm"
                  value={docId}
                  placeholder="document id"
                  disabled
                  sx={{ backgroundColor: "#eaecee",fontWeight: "bold" }}
                  onChange={(e) => setGeneratedDocId(e.target.value)}
                />
              </FormControl>
            </Stack>

            {isTransType !== "0" && (
              <Stack 
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 2, sm: 4 }}
              >
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>Requested Amount (GH)</FormLabel>
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
              </Stack>
            )}

            <Stack 
              direction="row" 
              spacing={{ xs: 2, sm: 4 }}
            >
              <FormControl sx={{ width: "100%" }}>
                <FormLabel required>Details</FormLabel>
                <Textarea
                  color="neutral"
                  minRows={2}
                  value={details}
                  // size="sm"
                  height="100px"
                  placeholder="Enter Document Details"
                  onChange={(e) => setDetails(e.target.value)}
                />
              </FormControl>
            </Stack>

            {validationError && (
              <Alert type="error" message={validationError} showIcon />
            )}

            <div className="w-full">
              <Stack 
                direction="row" 
                spacing={{ xs: 2, sm: 4 }} 
                sx={{ width: '100%' }}
              >
                <DocumentScan
                  selectedFile={selectedFile}
                  modalOpened={modalOpened}
                  loading={loading}
                  setModalType={setModalType}
                  handleGenerateDocId={handleGenerateDocId}
                  handleFileDrop={handleFileDrop}
                  handleFile={handleFile}
                  closeModal={closeModal}
                  handleFileChange={handleFileChange}
                  sx={{ 
                    flexGrow: 1,
                    width: '100%'
                  }}
                />
              </Stack>
            </div>

            <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
              <CardActions 
                sx={{ 
                  alignSelf: "flex-end", 
                  pt: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 2 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  onClick={() => handleClear()}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  sx={{ 
                    backgroundColor: "#00357A",
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  onClick={() => {
                    handleSave();
                  }}
                >
                  <AddDocIcon style={{ width: 25, height: 25 }} />
                  Save
                </Button>
              </CardActions>
            </CardOverflow>
          </Stack>

          <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={modalType === 'result'} onClose={handleClose}
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
                  margin: { xs: 2, sm: '15%' },
                }}
              >
                <Sheet
                  variant="outlined"
                  sx={{
                    maxWidth: { xs: '95%', sm: 500 },
                    borderRadius: "md",
                    p: { xs: 2, sm: 3 },
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
         
          <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={modalType === 'progress'} 
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
                  margin: { xs: 2, sm: '15%' },
                }}
              >
                <Sheet
                  variant="outlined"
                  sx={{
                    maxWidth: { xs: '95%', sm: 500 },
                    borderRadius: "md",
                    p: { xs: 2, sm: 3 },
                    boxShadow: "lg",
                  }}
                >
                  <ModalClose variant="plain" sx={{ m: 1 }} />
                  <Typography id="modal-desc" textColor="text.tertiary">
                  <Result subTitle="Generating Document id"/>
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {progress && <CircularProgress />}
                  </div>
                  </Typography>
                </Sheet>
          </Modal>

        </Card>
      </Stack>
    </div>
  );
};

export default Initial;