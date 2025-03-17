import React, { useState, useEffect } from "react";
import { Result,notification } from "antd";
import { CloseCircleOutlined, EyeInvisibleFilled } from '@ant-design/icons';
import GeneratedDocsTable from "../components/GeneratedDocsTable";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import CardOverflow from "@mui/joy/CardOverflow";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Sheet from "@mui/joy/Sheet";
import ModalClose from "@mui/joy/ModalClose";
import Divider from "@mui/joy/Divider";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Stack from "@mui/joy/Stack";
import FormControl from "@mui/joy/FormControl";
import {FormLabel,Input,Textarea} from "@mui/joy";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Typography from "@mui/joy/Typography";
import CardActions from "@mui/joy/CardActions";
import useAuth from "../hooks/useAuth";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import axios from "axios";
import Modal from "@mui/joy/Modal";
import {API_SERVER, headers,API_SERVER1, axiosPrivate} from "../constant";
import CircularProgress from "@mui/material/CircularProgress";
import DocumentScan from "./DocumentScan";
import InfoIcon from '@mui/icons-material/Info';
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

// import Layout from "../components/layout";

const GeneratedDocs = () => {

  const [api, contextHolder] = notification.useNotification();
  //use state setups
  const [modalType, setModalType] = useState(null); // 'add' | 'view' | 'update'
  const [modalProgress, setModalProgress] = useState(null); // 'add' | 'view' | 'update'
  const [branches, setBranches] = useState([]); // State to manage branches
  const [docTypes, setDocTypes] = useState([]); // State to manage doc types
  const [success, setSuccess] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedRequestedAmount, setSelectedRequestedAmount] = useState("");
  const [selectedCustomerNumber, setSelectedCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const [generatedDocId, setGeneratedDocId] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isFetching, setIsFetching] = useState(false); // State to manage fetching approvers
  const [docId, setDocId] = useState(null); // State to manage approver id
  const [tempDocId, setTempDocId] = useState(null); // state to manage temp approver id
  const [deactivateApproverId, setDeactivateApproverId] = useState(null); // State to manage approver id
  const [selectedDocId, setSelectedDocId] = useState(""); // State to manage approver id
  const [selectedDocTypeId, setSelectedDocTypeId] = useState(""); // State to manage document id
  const [isTransType, setIsTransType] = useState(""); // State to manage document id
  const [selectedBranchId, setSelectedBranchId] = useState(""); // State to manage branch id
  const [selectedStatus, setSelectedStatus] = useState(""); // State to manage branch id
  const [selectedFile, setSelectedFile] = useState(null); // State to manage selected file
  const [modalOpened, setModalOpened] = useState(false); // State to manage modal opened
  const [loading, setLoading] = useState(false); // State to manage loading
  const [showIframe, setShowIframe] = useState(false); // State to manage iframe modal opened
  const [progress, setProgress] = useState(false);
  const {user} = useAuth();

  const [formValues, setFormValues] = useState({
    user_id: "",
    doctype_id: "",
    branch_id: "",
    Status: "1",
    doc_id: "",
    details: ""
  });

  const axiosPrivate = useAxiosPrivate();


  //fetches documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosPrivate.get(`/get-generated-docs/${user.id}/${user.roles}`,{withCredentials:true});
        console.log("all documents11",response.data.result);
        setDocuments(response.data.result);
        setIsFetching(false);
      } catch (error) {
        console.log("Error fetching data:", error);
        if (error.response && error.response.data && error.response.data.message) {
          notifyError(error.response.data.message);
        } else {
          notifyError("An error occurred while fetching bank names");
        }
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isFetching]);

  //fetches parameters
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await axiosPrivate.get(`/get-parameters`, {withCredentials: true});
        setDocTypes(response.data.result.doctypes.data);
        // setBranches(response.data.branches);
        // console.log("Bank names:", response.data);
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          notifyError(error.response.data.message);
        } else {
          notifyError("An error occurred while fetching bank names");
        }
        console.error("Error fetching bank names:", error);
      }
    };

    fetchParameters();
  }, []);

  

  //when the doc id changes fetch the details of the doc
  useEffect(() => {
    if (!docId) return;

    // Fetch the doc details
    if(modalType !== "submit"){
      fetchDocDetails(docId,modalType);
    }

    // Set the temp doc ID to the current doc ID
    setTempDocId(docId);

    // Reset the doc ID after fetching the details
    setDocId(null);

  }, [docId]);

  //get the trans type of the document type
  useEffect(() => {
    const getTransType = async () => {
      try {
          if(selectedDocTypeId != null){
            const response = await axiosPrivate.get(`/get-code-creation-details${selectedDocTypeId}`, {
              withCredentials: true,
            });
            
            console.log("trans type",response);
            const transType = response.data.result[0].trans_type;

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

    getTransType();
  }, [selectedDocTypeId]);

  
  //function to open notification
  const openDeclineNotification = (pauseOnHover) => (message) => {
    api.open({
      message: 'DECLINED REASON',
      description:message,
      duration: 10,
      icon: <InfoIcon style={{ color: '#3498db' }} />, // Icon to display in the notification
    });
  };

  //handles error notifications
  const openErrorNotification = (pauseOnHover) => (message) => {
      api.open({
        message: 'ERROR MESSAGE',
        description:message,
        showProgress: true,
        duration: 20,
        pauseOnHover,
        icon: <CancelOutlinedIcon style={{ color: '#c0392b' }} />
      });
  };

  //handles success notifications
  const openNotification = (pauseOnHover) => (message) => {
    api.open({
      message: 'SUCCESS MESSAGE',
      description:message,
      showProgress: true,
      duration: 20,
      pauseOnHover,
      icon: <CheckCircleOutlineOutlinedIcon style={{ color: '#45b39d' }} />
    });
  };

  const notifySuccess = openNotification(true);
  const notifyError = openErrorNotification(true);
  const notifyDecline = openDeclineNotification(true);


  //handleOpen function mostly to open the modal
  const handleOpen = (type,row) => {
    
    // setSelectedRow(row);

    setFormValues({
      user_id: "",
      doctype_id: "",
      branch_id: "",
      Status: "1",
      doc_id: ""
    });

    
    
    if(type === "update") {
        // alert("Update");
        setDocId(row);
    }else if(type === "submit") {
      setDocId(row);
      setModalType(type);
    }else{
      setDocId(row);
      setModalType(type);
    }
  };

  //function to handle button click
  const handleButtonClick = () => {
    setShowIframe(true);
  };

  //function to handle file drop event
  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
  };


  //this function handles the file upload
  const handleFile = (file) => {
    setSelectedFile(file);
    setLoading(true); // Set loading to true immediately after file selection
    setTimeout(() => {
      setModalOpened(true);
      setLoading(false); // Set loading to false when modal is opened
    }, 2000); // Simulate delay for demonstration purpose (2 seconds)
  };


  //this function handles the file change event
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);

      // Reset the input value to allow re-selecting the same file
      event.target.value = "";
    }
  };

  //handle document uploads and generating od doc id
  const handleGenerateDocId = async  (doc) => {
    setModalProgress('progress');
    setProgress(true); // Set loading to true before making the API call
    try {
      const response = await axios.post(`http://10.203.14.169/dms/scan/insert_doc_api.php`, {
        file: doc,
      });
      setSelectedDocId(response.data.token);
      notifySuccess("Document uploaded successfully");
      handleClose(true);
    } catch (error) {
      notifyError("Error uploading document");
      console.error("Error uploading document:", error);
    } finally {
      // console.log(modalType);
      // closeModal();
      // setModalType('');
      setModalProgress('');
      setProgress(false); //Set loading to false after the API call is complete
    }
  }

  const closeModal = () => {
    setSelectedFile(null);
    // setModalType(null);
    setModalOpened(false);
  };

  /**
   * 
   * @param {Object} field - The field to update
   * @param {string} value - The value to update the field with
   */
  const handleInputChange = (field, value) => {
    console.log(`Updating ${field} with value:`, value); // Debug log
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));

    // Update individual state if needed for visual sync
    const fieldSetters = {
      'doctype_id': setSelectedDocTypeId,
      'branch_id': setSelectedBranchId,
      'Status': setSelectedStatus,
      'details': setDetails,
      'requested_amount': setSelectedRequestedAmount,
      'customer_no': setSelectedCustomerNumber
      // 'user_id': setSelectedUserId,
    };
    
    if (fieldSetters[field]) {
      fieldSetters[field](value);
    } else {
      console.warn(`Unknown field: ${field}`);
    }
  };


  // to handle closing of the modal
  const handleClose = () => setModalType(null);
  const handleCloseIframe = () => setShowIframe(false); //closes iframe modals only 


  

  //handles updating of approver's details
  const handleUpdate = () => {
    try{
      
      // Validate form values
      // Define an array of required fields with their corresponding display names
      const requiredFields = [
        { field: selectedDocTypeId, name: 'Document Type' },
        { field: selectedBranchId, name: 'Branch' },
        // { field: selectedStatus, name: 'Status' },
        { field: details, name: 'Details' },
        { field: selectedDocId, name: 'Document Id' },
        //if the document type is a transactional document, then the requested amount and customer number are required
        isTransType === "1" ? { field: selectedRequestedAmount, name: 'Requested Amount' } : { field: "data", name: "" },
        isTransType === "1" ? { field: selectedCustomerNumber, name: 'Customer Number' } : { field: "data", name: "" }
      ];
      
      // Filter out the fields that are empty and map them to their display names
      const validationErrors = requiredFields
        .filter(({ field }) => field === "" || field === null) // Check if the field is empty
        .map(({ name }) => name); // Extract the display name of the missing field
        
      // If there are any missing fields, show a notification with the list of missing fields
      if (validationErrors.length > 0) {
        let errors = validationErrors;
        if (errors.length > 1) {
            errors = errors.slice(0, -1).join(", ") + " and " + errors.slice(-1);
        } else {
            errors = errors.join(", ");
        }
        notifyError("Please provide: " + errors);
        return;
      }
    
    

      //post request to update parameter
      handlePostUpdate(tempDocId);

      // setShowAlert(false); // Hide alert if validation passes
      console.log("Form Values:", formValues);

      // setOpen(false);
      setFormValues({
        user_id: "",
        branch_id: "",
        doctype_id: "",
        Status: "1",
        details: "",
        doc_id: ""
      });
    }catch (error) {
      console.error("Error updating parameter:", error);
    }
  };

  
  //handles submit of document
  const handleSubmit = () => {
    try{
      //post request to update parameter
      axiosPrivate.put(`/submit-doc${tempDocId}`, {}, {
        withCredentials:true
      }).then((response) => {
        console.log("Response submit:", response);
        setIsFetching(true);
        notifySuccess(response.data.result);
        handleClose(true);
      }).catch((error) => {
        console.error("Error:", error);
        notifyError(error.response.data.result);
      });
    }catch (error) {
      console.error("Error updating parameter:", error);
    }
  };


  //handles post update request
  const handlePostUpdate = async (id) => {
    try {
      const response = await axiosPrivate.put(`/update-doc${id}`, {
        doctype_id: selectedDocTypeId,
        branch: selectedBranchId,
        requested_amount: isTransType === "1" ? selectedRequestedAmount: null,
        customer_no: isTransType === "1" ? selectedCustomerNumber: null,
        details: details,
        doc_id: selectedDocId,
        user_id: user.id
      },{withCredentials:true});

      //if the response is successful, fetch the approvers again
      if(response.data.code === "200") {
        setIsFetching(true);
        console.log("update response",response);
        notifySuccess(response.data.result) 
      }else{
        notifyError(response.data.message);
      }

      handleClose(true);
      
    } catch (error) {
      notifyError(error.response.data.result);
      console.error("Error:", error);
    }
  };

  const handleMessage = async (id) => {
    try {
      const response = await axiosPrivate.get(`/get-doc${id}`, {
        withCredentials: true,
      });
      console.log("Response doc details:", response.data.result[0].decline_reason);
      notifyDecline(response.data.result[0].decline_reason);
    } catch (error) {
      notifyError(error.response.data.message);
      console.error("Error:", error);
    }
  };

  //fetches doc details based on idd
  const fetchDocDetails = async (id,type) => {
    try {
      const response = await axiosPrivate.get(`/get-doc${id}`, {
        withCredentials: true,
      });
      console.log("Response doc details:", response);
      
      setSelectedDocId(response.data.result[0].doc_id);
      setSelectedDocTypeId(response.data.result[0].doctype_id);
      setSelectedBranchId(response.data.result[0].branch);
      setSelectedRequestedAmount(response.data.result[0].requested_amount);
      setSelectedCustomerNumber(response.data.result[0].customer_no);
      setDetails(response.data.result[0].details);
      // setSelectedStatus(response.data.approver.status);
      if(type === "view") {
          //open update modal
          setModalType("view");
      }else{
        //open update modal
        setModalType("update");
      }
    } catch (error) {
      // notifyError(error.response.data.message);
      console.error("Error:", error);
    }
  };
  

  
  return (
    <div>
      {/* this is the notification holder */}
      {contextHolder}
      {" "}

      {/* main content */}
      <Box
        component="main"
        className="MainContent"
        sx={{
          px: { xs: 1, md: 6 },
          pt: {
            xs: "calc(12px + var(--Header-height))",
            sm: "calc(12px + var(--Header-height))",
            md: 3,
          },
          pb: { xs: 1, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: "flex",
            mb: 1,
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "start", sm: "center" },
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {/* <Typography level="h2" component="h1">
            Generated Documents
          </Typography> */}
          
        </Box>
        <GeneratedDocsTable  data={documents} handleOpen={handleOpen} handleMessage={handleMessage}/>

        {/* <OrderList /> */}
      </Box>
      
      
      {/* Modal for viewing doc details */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'view'} onClose={handleClose}
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
                width: 800,
                borderRadius: "md",
                p: 3,
                boxShadow: "lg",
              }}
            >
              <ModalClose variant="plain" sx={{ m: 1 }} />
             
                <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">
                      View Details
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  
                  <Stack spacing={4}>
                    <Stack direction="row" spacing={4}>
                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel >Document</FormLabel>
                          <Select
                            autoFocus={true}
                            size="sm"
                            startDecorator={<AccountBalanceIcon />}
                            value={selectedDocTypeId}
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            placeholder="Select Document Type"
                            onChange={(e, newValue) => handleInputChange("doctype_id",newValue)}
                          >
                            {docTypes.map((docType) => (
                              <Option key={docType.id} value={docType.id}>
                                {docType.description}
                              </Option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl sx={{ width: "80%" }}>
                          <FormLabel >Document Id</FormLabel>
                          <Input
                            size="sm"
                            value={selectedDocId}
                            placeholder="document id"
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            onChange={(e) => handleInputChange("doc_id",e.target.value)}
                          />
                        </FormControl>
                        <Button
                          size="sm"
                          variant="solid"
                          sx={{ height: '30px', marginTop: '24px!important', backgroundColor: "#229954" }}
                          color="neutral"
                          onClick={handleButtonClick}>
                          <RemoveRedEyeIcon/>
                        </Button>
                        {/* <FormControl sx={{ width: "100%" }}>
                          <FormLabel >Branch</FormLabel>
                          <Select
                            size="sm"
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            value={selectedBranchId}
                            placeholder="Select Branch"
                            onChange={(e, newValue) => handleInputChange("branch_id",newValue)}
                          >
                            {branches.map((branch) => (
                              <Option key={branch.id} value={branch.id}>
                                {branch.description}
                              </Option>
                            ))}
                          </Select>
                        </FormControl> */}
                    </Stack>
                    {isTransType === "1" && (
                      <Stack direction="row" spacing={4}>
                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel>Requested Amount</FormLabel>
                          <Input
                            size="sm"
                            type="text"
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            value={selectedRequestedAmount}
                            placeholder="Enter requested Amount"
                            onChange={(newValue) => handleInputChange("requested_amount",newValue)} 
                          />
                        </FormControl>

                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel>Customer number</FormLabel>
                          <Input
                            size="sm"
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            value={selectedCustomerNumber}
                            placeholder="Enter customer number"
                            onChange={(newValue) => handleInputChange("customer_no",newValue)}
                          />
                        </FormControl>
                      
                      </Stack>
                       )}        
                      <Stack direction="row" spacing={4}>
                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel >Details</FormLabel>
                          <Textarea
                            color="neutral"
                            minRows={2}
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            value={details}
                            // size="sm"
                            height="100px"
                            placeholder="Enter Document Details"
                            onChange={(e) => handleInputChange("details",e.target.value)}
                          />
                        </FormControl>
                      </Stack>
                      {/* <Stack direction="row" spacing={2} sx={{display: "flex",justifyContent: "center"}}>
                      <FormControl sx={{ width: "44%" }}>
                          <FormLabel >Document Id (Upload doc to generate new id)</FormLabel>
                          <Input
                            size="sm"
                            value={selectedDocId}
                            placeholder="document id"
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            onChange={(e) => handleInputChange("doc_id",e.target.value)}
                          />
                        </FormControl>
                        <Button
                          size="sm"
                          variant="solid"
                          sx={{ height: '30px', marginTop: '24px!important', backgroundColor: "#229954" }}
                          color="neutral"
                          onClick={handleButtonClick}>
                          View Doc
                        </Button>
                      </Stack> */}
                      
                  </Stack>
                
                </Typography>
           

            </Sheet>
      </Modal>
      
      {/* Modal for updating doc details */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'update'} 
            onClose={handleClose}
            slotProps={{
              backdrop: {
                sx: {
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                },
              },
            }}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: { xs: '16px', md: '0 15%' },
            }}
          >
            <Sheet
              variant="outlined"
              sx={{
                width: { xs: '100%', sm: 800 },
                maxWidth: '100%',
                borderRadius: "md",
                p: { xs: 2, sm: 3 },
                boxShadow: "lg",
                overflow: 'auto',
                maxHeight: '90vh',
              }}
            >
              <ModalClose variant="plain" sx={{ m: 1 }} />
             
                <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">
                      Update Details
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  
                  <Stack spacing={{ xs: 2, sm: 4 }}>
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
                          value={selectedDocTypeId}
                          placeholder="Select Document Type"
                          onChange={(e, newValue) => handleInputChange("doctype_id",newValue)}
                        >
                          {docTypes.map((docType) => (
                            <Option key={docType.id} value={docType.id}>
                              {docType.description}
                            </Option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl sx={{ width: "80%" }}>
                        <FormLabel required>Document Id (Upload file to generate id)</FormLabel>
                        <Input
                          size="sm"
                          value={selectedDocId}
                          placeholder="document id"
                          disabled
                          sx={{ backgroundColor: "#eaecee" }}
                          onChange={(e) => setSelectedCustomerNumber(e.target.value)}
                        />
                      </FormControl>
                      <Button
                        size="sm"
                        variant="solid"
                        sx={{ height: '30px', marginTop: '24px!important', backgroundColor: "#229954" }}
                        color="neutral"
                        onClick={handleButtonClick}>
                        <RemoveRedEyeIcon/>
                      </Button>
                      
                    </Stack>
                    {isTransType === "1" && (
                      <Stack direction="row" spacing={4}>
                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel>Requested Amount</FormLabel>
                          <Input
                            size="sm"
                            type="text"
                            value={selectedRequestedAmount}
                            placeholder="Enter requested Amount"
                            onChange={(e) => handleInputChange("requested_amount",e.target.value)} 
                          />
                        </FormControl>

                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel>Customer number</FormLabel>
                          <Input
                            size="sm"
                            value={selectedCustomerNumber}
                            placeholder="Enter customer number"
                            onChange={(e) => handleInputChange("customer_no",e.target.value)}
                          />
                        </FormControl>
                      
                      </Stack>
                       )}        

                      <Stack direction="row" spacing={4}>
                        <FormControl sx={{ width: "100%" }}>
                          <FormLabel required>Details</FormLabel>
                          <Textarea
                            color="neutral"
                            minRows={2}
                            value={details}
                            height="100px"
                            placeholder="Enter Document Details"
                            onChange={(e) => handleInputChange("details",e.target.value)}
                          />
                        </FormControl>
                      </Stack>
                      <div className="w-full">
                        <Stack direction="row" spacing={4} sx={{ width: '100%' }} >
                          <DocumentScan
                            selectedFile={selectedFile}
                            modalOpened={modalOpened}
                            loading={loading}
                            handleFileDrop={handleFileDrop}
                            handleGenerateDocId={handleGenerateDocId}
                            handleFile={handleFile}
                            closeModal={closeModal}
                            handleFileChange={handleFileChange}
                            sx={{ flexGrow: 1 }}
                          />
                        </Stack>
                      </div>
                      {/* <Stack direction="row" spacing={2} sx={{display: "flex",justifyContent: "center"}}>
                        <FormControl sx={{ width: "44%" }}>
                          <FormLabel required>Document Id (Upload doc to generate new id)</FormLabel>
                          <Input
                            size="sm"
                            value={selectedDocId}
                            placeholder="document id"
                            disabled
                            sx={{ backgroundColor: "#eaecee" }}
                            onChange={(e) => setSelectedCustomerNumber(e.target.value)}
                          />
                        </FormControl>
                        <Button
                          size="sm"
                          variant="solid"
                          sx={{ height: '30px', marginTop: '24px!important', backgroundColor: "#229954" }}
                          color="neutral"
                          onClick={handleButtonClick}>
                          <RemoveRedEyeIcon/>
                        </Button>
                      </Stack> */}
                      
                  </Stack>
                  <CardOverflow sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                      
                      <Button
                        size="sm"
                        variant="solid"
                        sx={{ backgroundColor: "#00357A",marginLeft: "8px" }}
                        onClick={() => {
                          handleUpdate();
                        }}
                      >
                        Update
                      </Button>
                    </CardActions>
                  </CardOverflow>
                </Typography>
           

            </Sheet>
      </Modal>

      {/* Success Modal */}
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
      
      
      {/* Submit Modal */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'submit'} onClose={handleClose}
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
              <Result subTitle={<span style={{ fontSize: 'larger', fontWeight: 'bold', color: 'black' }}>Do you want to submit the document ?</span>} />
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <Button
                    size="sm"
                    variant="solid"
                    sx={{ backgroundColor: "#00357A" }}
                    onClick={() => {
                      handleSubmit();
                    }}
                  >
                    Submit
                  </Button>
                  <Button
                    size="sm"
                    variant="solid"
                    sx={{
                      backgroundColor: "#4d5656",
                      marginLeft: "8px",
                      '&:hover': {
                        backgroundColor: "#6b7b7b", // lighter color of #4d5656
                      },
                    }}
                    onClick={() => {
                      handleClose();
                    }}
                  >
                    Cancel
                  </Button>
                </div>


                
              </Typography>
            </Sheet>
      </Modal>
      
      {/* Display document */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={showIframe} onClose={handleCloseIframe}
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
              margin: { xs: '16px', md: '0 15%' },
            }}
          >
            <Sheet
              variant="outlined"
              sx={{
                maxWidth: '90%',
                width: "100%",
                borderRadius: "md",
                p: { xs: 1, sm: 3 },
                boxShadow: "lg",
                height: { xs: 'calc(80vh)', sm: 'auto' },
              }}
            >
              <ModalClose variant="plain" sx={{ m: 1 }} />
              <Typography id="modal-desc" textColor="text.tertiary">
                  
                    <iframe
                      src={`http://10.203.14.169/dms/filesearch-${selectedDocId}`}
                      width="100%"
                      height="100%"
                      title="Document Viewer"
                      style={{ 
                        marginTop: '20px',
                        height: '500px',
                        '@media (max-width: 600px)': {
                          height: 'calc(70vh)'
                        }
                      }}
                    />

                
              </Typography>
            </Sheet>
      </Modal>

       {/* Progress indicator */}
       <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={modalProgress === 'progress'} 
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
                  <Result subTitle="Generating Document id"/>
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    {progress && <CircularProgress />}
                  </div>
                  </Typography>
                </Sheet>
       </Modal>
    </div>
  )
};

export default GeneratedDocs;
