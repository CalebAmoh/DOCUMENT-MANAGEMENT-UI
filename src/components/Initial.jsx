import React, { useState, useEffect } from "react";
import axios from "axios";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
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
import {Textarea,FormHelperText} from '@mui/joy';
import { Alert, notification, Result,Skeleton } from "antd";
import { API_SERVER, headers,API_SERVER_CORE,headers_core } from "../constant";
import DocumentScan from "./DocumentScan";
import CountrySelector from "./DocumentSelector";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactComponent as AddDocIcon } from "../utils/icons/add-file-svgrepo.svg";
import { ReactComponent as PreviousIcon } from "../utils/icons/previous-svgrepo-com.svg";
import { Add,InfoOutlined} from "@mui/icons-material";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import swal from "sweetalert";


// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const Initial = () => {
  const [open, setOpen] = useState(false);
  const [codeTypes, setCodeTypes] = useState([]);
  const [availableDocTypes, setAvailableDocTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selected, setSelected] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRequestedAmount, setSelectedRequestedAmount] = useState("");
  const [selectedCustomerNumber, setSelectedCustomerNumber] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [progress, setProgress] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [accountDescription, setAccountDescription] = useState("");
  const [filter, setFilter] = useState([]);
  

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

  //modal to show customers
  const handleShowCustom = async  () => {
    setModalType('showCustomers');
  }


  //function to return validation messages
  const getFieldError = (fieldValue, fieldName) => {
    if (isSubmitted && !fieldValue) {
      return (
        <FormHelperText sx={{ color: 'var(--joy-palette-danger-500)' }}>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <InfoOutlined sx={{color: 'var(--joy-palette-danger-500)'}}/>
            {fieldName} is required
          </Box>
        </FormHelperText>
      );
    }
    return null;
  };

  //find accounts by name
  async function handleFind(e) {
    setLoading1(true);
    try {
      // const response = await axios.post(
      //   API_SERVER_CORE + "/api/find-by-name",
      //   {
      //     accountName: accountDescription,
      //   },
      //   { 
      //     "x-api-key":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      //     "Content-Type": "application/json"
      //   }
      // );
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://10.203.14.195:3320/api/find-by-name',
        headers: headers_core,
        data : {'accountName': accountDescription}
      };
      
      axios.request(config)
      .then((response) => {
        console.log("dataaa",JSON.stringify(response.data));

        if (response.data?.length > 0) {
          setLoading1(false);
  
          setFilter(response.data);
        } else {
          swal({
            title: "Oops !!!",
            text: `No record match for account name '${accountDescription}' `,
            icon: "warning",
            buttons: "Ok",
            dangerMode: true,
          }).then((result) => {
            setFilter([]);
            setLoading(false);
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });


    } catch (error) {
      console.log(error);
    }
  }

  const closeModal = () => {
    setSelectedFile(null);
    setModalType(null);
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
    setSelectedCustomerName("");
    setDetails("");
    setValidationError("");
  };

  function handleSelected(value) {
    console.log(value);
    setSelectedCustomerNumber(value.accountNumber);
    setSelectedCustomerName(value.accountNumber+"-"+value.accountName);
    setFilter([]);
    setModalType(null);
    // setAccountNumber(value.accountNumber);
    // setAccountNumberFromSearchModal(value.accountNumber);
    // document.getElementById("accNumber11").value = value.accountNumber;
    // setFindById(false);
  }

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
    setSelectedCustomerName("");
    setGeneratedDocId("");
    setDetails("");
    setIsSubmitted(false);
  };

  //post generated doc
  const handleSave = async () => {

    setIsSubmitted(true); // Set to true when the form is submitted

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
            customer_desc: selectedCustomerName,
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
                    </Select>{getFieldError(selectedDocType, 'Document Type')}
                    
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
                        {getFieldError(docId, 'Document Id')}
                        </FormControl>
                        </Stack>

                        {isTransType !== "0" && (
                        <Stack 
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 2, sm: 4 }}
                        >
                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel>Requested Amount </FormLabel>
                          <Input
                          size="sm"
                          type="number"
                          min="0"
                          value={selectedRequestedAmount}
                          placeholder="Enter requested Amount"
                          onChange={(e) => {
                          const value = Math.max(0, Number(e.target.value));
                          setSelectedRequestedAmount(value);
                          }}
                          onKeyPress={(e) => {
                          if(e.key === '-') {
                            e.preventDefault();
                          }
                          }}
                          />
                          {getFieldError(selectedRequestedAmount, 'Requested Amount')}
                        </FormControl>

                        <FormControl sx={{ width: "100%"}}>
                          <FormLabel>Customer number</FormLabel>
                          <Stack direction="row" spacing={1}>
                          <Input
                          size="sm"
                          value={selectedCustomerName}
                          placeholder="Enter customer number"
                          disabled
                          onChange={(e) => setSelectedCustomerName(e.target.value)}
                          sx={{ flex: 1,backgroundColor: "#eaecee",fontWeight: "bold" }}
                          />
                          <Button
                          size="sm"
                          variant="solid"
                          sx={{ backgroundColor: "#229954" }}
                          color="neutral"
                          onClick={handleShowCustom}>
                          SEARCH
                          </Button>
                          </Stack>
                          {getFieldError(selectedCustomerName, 'Customer Number')}
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
                            height="100px"
                            placeholder="Enter Document Details"
                            onChange={(e) => setDetails(e.target.value)}
                          />
                          {getFieldError(details, 'Details')}
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

          <Modal
            open={modalType === 'showCustomers'}
            aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                onClose={handleClose}
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
            <div className=" text-gray-700  " style={{ zoom: "85%" }}>
              <div>
                <div
                  style={{
                    backgroundColor: "#b8b6b6",
                  }}
                  className=" w-full  shadow"
                >
                  <div className=" flex justify-between py-[6px] px-2 items-center ">
                    <div className="text-white font-semibold">
                      SEARCH ACCOUNT BY NAME
                    </div>

                    <svg
                      onClick={() => handleClose()}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      // style={{ padding: "10px" }}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 cursor-pointer fill-cyan-500 stroke-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                {/* <hr style={{ marginTop: "-10%" }} /> */}
              </div>
              <div className="bg-gray-200 rounded-b ">
                <div className="bg-white shadow rounded px-2 pt-1 pb-8   ">
                  <div className="rounded p-2 space-y-2 border-2 mb-3 ">
                    <div>
                      Find a partial value to limit the list , %% to see all values
                    </div>
                    <div className="border-l-4 border-yellow-500 rounded leading-6  px-3 py-2 bg-yellow-50">
                      <span className="font-semibold flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                        <div>Warning</div>
                      </span>{" "}
                      Entering % to see all values may take a very long time <br />
                      Entering criteria that can be used to reduce the list may be
                      significantly faster
                    </div>
                  </div>
                  <div className="">
                    <div className="mb-3 flex items-center space-x-2">
                      <Input
                        label={"Find"}
                        labelWidth={"10%"}
                        inputWidth={"70%"}
                        onChange={(e) => {
                          setAccountDescription(e.target.value);
                        }}
                        onKeyPress={(e) => {
                          e.key === "Enter" && handleFind();
                        }}
                      />
                      <Button
                        label={"Find"}
                        onClick={handleFind}
                        buttonWidth={"15%"}
                        buttonHeight={"30px"}
                      >FIND</Button>
                    </div>
                    <div style={{ maxHeight: "400px", overflow: "auto" }} className>
                      {/* <DataTable
                      data={filter}
                      rowsPerPage={10}
                      columns={[
                        "Account Name",
                        "Account Number",
                        "ISO code",
                        "Customer Number",
                        "Status Indicator",
                      ]}
                    /> */}

                      <table className="w-full text-[90%]  bg-white rounded-sm   even:bg-gray-100  border-spacing-2 border border-gray-400">
                        <thead>
                          <tr
                            className="py-1 uppercase font-semibold text-gray-100  "
                            // style={{
                            //   background:
                            //     `url(` +
                            //     window.location.origin +
                            //     `/assets/images/background/` +
                            //     getTheme.theme.backgroundImage +
                            //     `)`,
                            // }}
                            style={{
                              backgroundColor: "#0580c0",
                            }}
                          >
                            <th className=" px-2 py-2 border border-gray-400">
                              Account Name
                            </th>
                            <th className=" px-2 py-2 border border-gray-400">
                              Account Number
                            </th>
                            <th className=" px-2 py-2 border w-32 border-gray-400">
                              ISO Code
                            </th>
                            <th className=" px-2 py-2 border border-gray-400">
                              Customer Number
                            </th>
                          </tr>
                        </thead>
                        <tbody className="">
                          {!loading1 &&
                            filter.map((i, key) => {
                              return (
                                <tr
                                  // onDoubleClick={() => {
                                  //   handleSelected(i);
                                  //   setSelected("");
                                  // }}
                                  onClick={() => {
                                    handleSelected(i);
                                  }}
                                  key={key}
                                  className={`${
                                    selected === i.accountNumber
                                      ? "bg-blue-400 text-white"
                                      : "bg-[#f9f9f9] hover:bg-zinc-200"
                                  } h-8 border-spacing-2   cursor-pointer border border-gray-400`}
                                >
                                  <td
                                    // style={{
                                    //   background: getTheme.theme.navBarColor,
                                    // }}
                                    className="   capitalize px-2 py-1"
                                  >
                                    {i.accountName}
                                  </td>
                                  <td className="    px-2 py-1">
                                    {i.accountNumber === "null"
                                      ? "0.00"
                                      : i.accountNumber}
                                  </td>
                                  <td className="    px-2 py-1">
                                    {i.isoCode === "null" ? "0.00" : i.isoCode}
                                  </td>
                                  <td className="    px-2 py-1">
                                    {i.customer_number === "null"
                                      ? "0.00"
                                      : i.customer_number}
                                  </td>
                                </tr>
                              );
                            })}

                          {loading1 && (
                            <tr className="">
                              <td className="px-2 pt-2">
                                <Skeleton active />
                              </td>
                              <td className="px-2">
                                <Skeleton active />
                              </td>
                              <td className="px-2">
                                <Skeleton active />
                              </td>
                              <td className="px-2">
                                <Skeleton active />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </Sheet>
          </Modal>

        </Card>
      </Stack>
    </div>
  );
};

export default Initial;