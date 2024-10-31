import React, { useState, useEffect } from "react";
import { Result,notification } from "antd";
import { CloseCircleOutlined } from '@ant-design/icons';
import GeneratedDocsTable from "../components/GeneratedDocsTable";
import OrderList from "../components/OrderList";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import CardOverflow from "@mui/joy/CardOverflow";
import Sheet from "@mui/joy/Sheet";
import ModalClose from "@mui/joy/ModalClose";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import FormControl from "@mui/joy/FormControl";
import {FormLabel,Input,Textarea} from "@mui/joy";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/joy/Typography";
import CardActions from "@mui/joy/CardActions";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import axios from "axios";
import Modal from "@mui/joy/Modal";
import {API_SERVER, headers} from "../constant";
import DocumentScan from "./DocumentScan";

const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

// import Layout from "../components/layout";

const GeneratedDocs = () => {

  const [api, contextHolder] = notification.useNotification();
  //use state setups
  const [modalType, setModalType] = useState(null); // 'add' | 'view' | 'update'
  const [branches, setBranches] = useState([]); // State to manage branches
  const [docTypes, setDocTypes] = useState([]); // State to manage doc types
  const [users, setUsers] = useState([]); // State to manage users
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [success, setSuccess] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [selectedRequestedAmount, setSelectedRequestedAmount] = useState("");
  const [selectedCustomerNumber, setSelectedCustomerNumber] = useState("");
  const [details, setDetails] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isFetching, setIsFetching] = useState(false); // State to manage fetching approvers
  const [approverId, setApproverId] = useState(null); // State to manage approver id
  const [tempApproverId, setTempApproverId] = useState(null); // state to manage temp approver id
  const [deactivateApproverId, setDeactivateApproverId] = useState(null); // State to manage approver id
  const [selectedUserId, setSelectedUserId] = useState(""); // State to manage approver id
  const [selectedDocTypeId, setSelectedDocTypeId] = useState(""); // State to manage document id
  const [selectedBranchId, setSelectedBranchId] = useState(""); // State to manage branch id
  const [selectedStatus, setSelectedStatus] = useState(""); // State to manage branch id
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    user_id: "",
    doc_type_id: "",
    branch_id: "",
    Status: "1",
  });


  //fetches approvers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_SERVER}/get-docs`, { headers });
        setApprovers(response.data.documents);
        console.log("Approvers:", response.data.documents);
        setIsFetching(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isFetching]);

  //fetches parameters
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await axios.get(ENDPOINT + `/get-parameters`, {headers: headers});
        setDocTypes(response.data.doc_types);
        setBranches(response.data.branches);
        setUsers(response.data.users);
        console.log("Bank names:", response.data);
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };

    fetchParameters();
  }, []);

  const handleClear = () => {
    setSelectedDocType("");
    setSelectedBranch("");
    setSelectedRequestedAmount("");
    setSelectedCustomerNumber("");
    details("");
    setValidationError("");
  };

  //when the approver id changes fetch the details of the approver
  useEffect(() => {
    if (!approverId) return;

    // Fetch the approver details
    fetchApproverDetails(approverId);

    // Set the temp approver ID to the current approver ID
    setTempApproverId(approverId);

    // Reset the approver ID after fetching the details
    setApproverId(null);

  }, [approverId]);


  //function to open notification
  const openNotification = (message) => {
    api.open({
      message: 'Error message',
      description:message,
      duration: 10,
      icon: <CloseCircleOutlined style={{ color: '#ff0000' }} />, // Icon to display in the notification
    });
  };

  //handleOpen function mostly to open the modal
  const handleOpen = (type,row) => {
    
    // setSelectedRow(row);

    setFormValues({
      user_id: "",
      doc_type_id: "",
      branch_id: "",
      Status: "1",
    });

    
    
    if(type === "update") {
        // alert("Update");
        setApproverId(row);
    }else if(type === "delete" || type === "activate") {
      setDeactivateApproverId(row);
      setModalType(type);
    }else{
      setModalType(type);
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);

      // Reset the input value to allow re-selecting the same file
      event.target.value = "";
    }
  };

  const closeModal = () => {
    setSelectedFile(null);
    setModalType(null);
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
      'doc_type_id': setSelectedDocTypeId,
      'branch_id': setSelectedBranchId,
      'Status': setSelectedStatus,
      'user_id': setSelectedUserId,
    };
    
    if (fieldSetters[field]) {
      fieldSetters[field](value);
    } else {
      console.warn(`Unknown field: ${field}`);
    }
  };


  // to handle closing of the modal
  const handleClose = () => setModalType(null);

  //handles creation of new parameter
  const handleSave = () => {
    
    // Validate form values
    console.log("Form Values:", formValues); // Debug log
    const requiredFields = [
      { field: 'user_id', name: 'User' },
      { field: 'doc_type_id', name: 'Document Type' },
      { field: 'branch_id', name: 'Branch' },
      { field: 'Status', name: 'Status' }
    ];
    
    const missingFields = requiredFields
      .filter(({ field }) => !formValues[field])
      .map(({ name }) => name);
    
    if (missingFields.length > 0) {
      // setModalType("result");
      // setValidationError(`Please fill in the following fields: ${missingFields.join(", ")}`);
      openNotification(`Please fill in the following fields: ${missingFields.join(", ")}`);
      return;
    }
    
    // setShowAlert(false); // Hide alert if validation passes
    
    
    //post request to create parameter
    handlePost();
    
    // Reset form values
    setFormValues({
      user_id: "",
      doc_type_id: "",
      branch_id: "",
      Status: "1",
    });
  };

  //handles updating of approver's details
  const handleUpdate = () => {
    try{
      
      
      // Validate form values
      // Define an array of required fields with their corresponding display names
      const requiredFields = [
        { field: selectedUserId, name: 'User' },
        { field: selectedDocTypeId, name: 'Document Type' },
        { field: selectedBranchId, name: 'Branch' },
        { field: selectedStatus, name: 'Status' }
      ];
      
      // Filter out the fields that are empty and map them to their display names
      const missingFields = requiredFields
        .filter(({ field }) => field === "") // Check if the field is empty
        .map(({ name }) => name); // Extract the display name of the missing field
      
      // If there are any missing fields, show a notification with the list of missing fields
      if (missingFields.length > 0) {
        openNotification(`Please fill in the following fields: ${missingFields.join(", ")}`);
        return; // Exit the function early since the validation failed
      }
    
    

      //post request to update parameter
      handlePostUpdate(tempApproverId);

      // setShowAlert(false); // Hide alert if validation passes
      console.log("Form Values:", formValues);

      // setOpen(false);
      setFormValues({
        user_id: "",
        branch_id: "",
        doc_type_id: "",
        Status: "1",
      });
    }catch (error) {
      console.error("Error updating parameter:", error);
    }
  };

  //handles deactivation of approver
  const handleDeactivate = async () => {
    try {
      //post delete request to deactivate parameter
      const response = await axios.put(`${ENDPOINT}/approvers/deactivate/${deactivateApproverId}`,{}, { headers });
      console.log("Response after deactivating:", response);
      setIsFetching(true);
      handleOpen('result');
      setSuccess(response.data);

    } catch (error) {
      console.error("Error deactivating parameter:", error);
    }
  };
 
 
  //handles deactivation of approver
  const handleactivate = async () => {
    try {
      //post delete request to deactivate parameter
      const response = await axios.put(`${ENDPOINT}/approvers/activate/${deactivateApproverId}`,{}, { headers });
      console.log("Response after activating:", response);
      setIsFetching(true);
      handleOpen('result');
      setSuccess(response.data);

    } catch (error) {
      console.error("Error activating parameter:", error);
    }
  };


  //handles post request
  const handlePost = async () => {
    try {
      const response = await axios.post(ENDPOINT + `/approvers`, {
        user_id: formValues.user_id,
        doctype_id: formValues.doc_type_id,
        branch_id: formValues.branch_id,
        status: formValues.Status
      },{
        headers: headers});
      console.log("Response after adding:", response.data.code);

      handleOpen('result');
      setSuccess(response.data);

      if(response.data.code === "200") {
        setIsFetching(true);
      }
      console.log(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //handles post update request
  const handlePostUpdate = async (id) => {
    try {
      const response = await axios.put(`${ENDPOINT}/approvers/${id}`, {
        user_id: selectedUserId,
        doctype_id: selectedDocTypeId,
        branch_id: selectedBranchId,
        status: selectedStatus
      },{
        headers: headers});

      //if the response is successful, fetch the approvers again
      if(response.data.code === "200") {
        setIsFetching(true);
      }

      handleOpen('result');
      // setSuccessModal(true);
      setSuccess(response.data);
      
    } catch (error) {
      console.error("Error:", error);
    }
  };


  //fetches approvers details based on idd
  const fetchApproverDetails = async (id) => {
    try {
      
      const response = await axios.get(`${ENDPOINT}/get-doc/${id}`, {
        headers: headers
      });
      console.log("Response doc details:", response.data.document);
      
      // setSelectedUserId(response.data.approver.user_id);
      // setSelectedDocTypeId(response.data.approver.doctype_id);
      // setSelectedBranchId(response.data.approver.branch_id);
      // setSelectedStatus(response.data.approver.status);
      
      //open update modal
      setModalType("update");
    } catch (error) {
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
          px: { xs: 2, md: 6 },
          pt: {
            xs: "calc(12px + var(--Header-height))",
            sm: "calc(12px + var(--Header-height))",
            md: 3,
          },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100dvh",
          gap: 1,
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
          <Typography level="h2" component="h1">
            Generated Documents
          </Typography>
          
        </Box>
        <GeneratedDocsTable  data={approvers} handleOpen={handleOpen}/>

        {/* <OrderList /> */}
      </Box>
      
      {/* Modal for adding approver */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'add'} onClose={handleClose}
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
                width: 500,
                borderRadius: "md",
                p: 3,
                boxShadow: "lg",
              }}
            >
              <ModalClose variant="plain" sx={{ m: 1 }} />
             
                <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">
                      Add Approver
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  
                  <Stack spacing={2}>
                    {/* add fields here for the form a description and status */}
                    <Stack spacing={1}>
              
                        <FormLabel>User</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select User"
                            value={formValues.user_id}
                            onChange={(e, newValue) => handleInputChange("user_id", newValue)}
                            >
                            {users.map((user) => (
                                <Option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                                </Option>
                            ))}
                            </Select>
                        </FormControl>

                        <FormLabel>Document Type</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Type of Document"
                            value={formValues.doc_type_id}
                            onChange={(e, newValue) => handleInputChange("doc_type_id", newValue)}
                            >
                            {docTypes.map((doctype) => (
                                <Option key={doctype.id} value={doctype.id}>
                                {doctype.description} 
                                </Option>
                            ))}
                            </Select>
                        </FormControl>
                        
                        
                        <FormLabel>Branch</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Branch"
                            value={formValues.branch_id}
                            onChange={(e, newValue) =>
                                handleInputChange("branch_id", newValue)
                            }
                            >
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                {branch.description} 
                                </Option>
                            ))}
                            </Select>
                        </FormControl>
                        
                        <FormLabel>Status</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Status"
                            value={formValues.Status}
                            onChange={(e,newValue) =>
                                handleInputChange("Status", newValue)
                            }
                            >
                            <Option value="1">Active</Option>
                            <Option value="0">Inactive</Option>
                            </Select>
                        </FormControl>

                    </Stack>
                  </Stack>
                  <CardActions>
                    <Button
                      sx={{
                        backgroundColor: "#00357A",
                        color: "#fff",
                        marginTop: "16px",
                      }}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                  </CardActions>
                </Typography>
           

            </Sheet>
      </Modal>
      
      {/* Modal for updating approval details */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'update'} onClose={handleClose}
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
                      Update Details
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  
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
                            {docTypes.map((docType) => (
                              <Option key={docType.id} value={docType.id}>
                                {docType.description}
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
                    {/* {isTransType !== "0" && ( */}
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
                      
                      </Stack>
                      {/* )}         */}
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
                          handleUpdate();
                        }}
                      >
                        Save
                      </Button>
                    </CardActions>
                  </CardOverflow>
                </Typography>
           

            </Sheet>
      </Modal>

      {/* Deactivate or delete modal */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'delete'} onClose={handleClose}
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
                
                  <Result
                    title={"Are you sure you want to deactivate this approver?"}
                  />

                  <CardActions>
                  <Button
                    sx={{
                      backgroundColor: "#00357A",
                      color: "#fff",
                      width: "48%", // Adjust width to fit both buttons in a row
                    }}
                    onClick={handleDeactivate}
                  >
                    Deactivate
                  </Button>
                  {/* <Button
                    sx={{
                      backgroundColor: "#f44336", // Red color for cancel button
                      color: "#fff",
                      width: "48%", // Adjust width to fit both buttons in a row
                    }}
                    // onClick={handleCancel} // Add your cancel handler here
                  >
                    Cancel
                  </Button> */}
                  </CardActions>
                
              </Typography>
            </Sheet>
      </Modal>
      
      {/* Activate or delete modal */}
      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'activate'} onClose={handleClose}
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
                
                  <Result
                    title={"Are you sure you want to activate this approver?"}
                  />

                  <CardActions>
                  <Button
                    sx={{
                      backgroundColor: "#00357A",
                      color: "#fff",
                      width: "48%", // Adjust width to fit both buttons in a row
                    }}
                    onClick={handleactivate}
                  >
                    Activate
                  </Button>
                  {/* <Button
                    sx={{
                      backgroundColor: "#f44336", // Red color for cancel button
                      color: "#fff",
                      width: "48%", // Adjust width to fit both buttons in a row
                    }}
                    // onClick={handleCancel} // Add your cancel handler here
                  >
                    Cancel
                  </Button> */}
                  </CardActions>
                
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
    </div>
  )
};

export default GeneratedDocs;
