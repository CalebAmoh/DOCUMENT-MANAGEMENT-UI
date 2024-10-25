import React, { useState, useEffect } from "react";
import { Result,notification } from "antd";
import { CloseCircleOutlined } from '@ant-design/icons';
import ApproversTempTable from "../components/ApproversTempTable";
import OrderList from "../components/OrderList";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Breadcrumbs from "@mui/joy/Breadcrumbs";
import Link from "@mui/joy/Link";
import Sheet from "@mui/joy/Sheet";
import ModalClose from "@mui/joy/ModalClose";
import Divider from "@mui/joy/Divider";
import Stack from "@mui/joy/Stack";
import FormControl from "@mui/joy/FormControl";
import {FormLabel,Input} from "@mui/joy";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/joy/Typography";
import CardActions from "@mui/joy/CardActions";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import axios from "axios";
import Modal from "@mui/joy/Modal";
import {API_SERVER, headers} from "../constant";
const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

// import Layout from "../components/layout";

const TempApprovers = () => {

  const [api, contextHolder] = notification.useNotification();
  //use state setups
  const [modalType, setModalType] = useState(null); // 'add' | 'view' | 'update'
  const [branches, setBranches] = useState([]); // State to manage branches
  const [docTypes, setDocTypes] = useState([]); // State to manage doc types
  const [users, setUsers] = useState([]); // State to manage users
  const [showAlert, setShowAlert] = useState(false); // State to manage alert visibility
  const [success, setSuccess] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [isFetching, setIsFetching] = useState(false); // State to manage fetching approvers
  const [approverId, setApproverId] = useState(null); // State to manage approver id
  const [tempApproverId, setTempApproverId] = useState(null); // state to manage temp approver id
  const [deactivateApproverId, setDeactivateApproverId] = useState(null); // State to manage approver id
  const [selectedUserId, setSelectedUserId] = useState(""); // State to manage approver id
  const [selectedDocTypeId, setSelectedDocTypeId] = useState(""); // State to manage document id
  const [selectedPermission, setSelectedPermission] = useState(""); // State to manage branch id
  const [selectedStatus, setSelectedStatus] = useState(""); // State to manage branch id
  const [validationError, setValidationError] = useState(""); // State to manage validation error
  const [response, setResponse] = useState(null); // State to manage response
  const [error, setError] = useState(null); // State to manage error
  const [formValues, setFormValues] = useState({
    user_id: "",
    // doc_type_id: "",
    permission: "",
    Status: "1",
  });


  //fetches approvers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_SERVER}/temp-approvers`, { headers });
        setApprovers(response.data.temporaryApprovers);
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

  

  //when the approver id changes fetch the details of the approver
  useEffect(() => {

    if (!approverId) return;
    fetchApproverDetails(approverId);

    // Set the temp approver ID to the current approver ID
    setTempApproverId(approverId);

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
    //   doc_type_id: "",
      permission: "",
      Status: "1",
    });

    
    if(type === "update") {
      // Set approver id
      setApproverId(row);
    }else if(type === "delete" || type === "activate") {
      setDeactivateApproverId(row);
      setModalType(type);
    }else{
      setModalType(type);
    }
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
    //   'doc_type_id': setSelectedDocTypeId,
      'permission': setSelectedPermission,
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
    const requiredFields = [
      { field: 'user_id', name: 'User' },
    //   { field: 'doc_type_id', name: 'Document Type' },
      { field: 'permission', name: 'Permission' },
      { field: 'Status', name: 'Status' }
    ];
    
    const missingFields = requiredFields
      .filter(({ field }) => !formValues[field])
      .map(({ name }) => name);
    
    if (missingFields.length > 0) {
      openNotification(`Please fill in the following fields: ${missingFields.join(", ")}`);
      return;
    }
    
    setShowAlert(false); // Hide alert if validation passes
    
    
    //post request to create parameter
    handlePost();
    
    // Reset form values
    setFormValues({
      user_id: "",
    //   doc_type_id: "",
      permission: "",
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
        // { field: selectedDocTypeId, name: 'Document Type' },
        { field: selectedPermission, name: 'Permission' },
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

      setShowAlert(false); // Hide alert if validation passes

      // setOpen(false);
      setFormValues({
        user_id: "",
        // branch_id: "",
        permission: "",
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
      const response = await axios.put(`${ENDPOINT}/temp-approvers/deactivate/${deactivateApproverId}`,{}, { headers });
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
      const response = await axios.put(`${ENDPOINT}/temp-approvers/activate/${deactivateApproverId}`,{}, { headers });
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
      const response = await axios.post(ENDPOINT + `/temp-approvers`, {
        user_id: formValues.user_id,
        // doctype_id: formValues.doc_type_id,
        permission: formValues.permission,
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
      const response = await axios.put(`${ENDPOINT}/temp-approvers/${id}`, {
        user_id: selectedUserId,
        doctype_id: 'NULL',
        permission: selectedPermission,
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
      const response = await axios.get(`${ENDPOINT}/temp-approvers/${id}`, {
        headers: headers
      });
    //   console.log("Response approver details:", response.data.temporaryApprover);
      
      setSelectedUserId(response.data.temporaryApprover.user_id);
    //   setSelectedDocTypeId(response.data.temporaryApprover.doctype_id);
      setSelectedPermission(response.data.temporaryApprover.permission);
      setSelectedStatus(response.data.temporaryApprover.status);
      
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
            Temporary Approvers
          </Typography>
          <Button
            // color="#00357A"
            sx={{ backgroundColor: "#00357A" }}
            onClick={() => handleOpen("add")}
            startDecorator={<AddIcon />}
            size="md"
          >
            Add New
          </Button>
        </Box>
        <ApproversTempTable  data={approvers} handleOpen={handleOpen}/>

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
                      Add Temporary Approver
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

                        {/* <FormLabel>Document Type</FormLabel>
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
                        </FormControl> */}
                        
                        
                        <FormLabel>Permission</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Permission"
                            value={formValues.permission}
                            onChange={(e, newValue) =>
                                handleInputChange("permission", newValue)
                            }
                            >
                            <Option value="V">View</Option>
                            <Option value="A">Approve</Option>
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
                      Update Details
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
                          value={selectedUserId}
                          onChange={(e,newValue) => handleInputChange("user_id", newValue)}
                        >
                          {users.map((user) => (
                            <Option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name}
                            </Option>
                          ))}
                        </Select>
                        </FormControl>

                        {/* <FormLabel>Document Type</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                        <Select
                          placeholder="Select Type of Document"
                          value={selectedDocTypeId}
                          onChange={(e, newValue) => {
                            handleInputChange("doc_type_id", newValue);
                          }}
                        >
                          {docTypes.map((doctype) => (
                            <Option key={doctype.id} value={doctype.id}>
                              {doctype.description}
                            </Option>
                          ))}
                        </Select>
                        </FormControl> */}
                        
                        
                        <FormLabel>Permission</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Branch"
                            value={selectedPermission}
                            onChange={(e, newValue) =>
                                handleInputChange("permission", newValue)
                            }
                            >
                            <Option value="V">View</Option>
                            <Option value="A">Approve</Option>
                            </Select>
                        </FormControl>
                        
                        <FormLabel>Status</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                        <Select
                                value={selectedStatus}
                                onChange={(e, newValue) => handleInputChange("Status", newValue)}
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
                      onClick={handleUpdate}
                    >
                      Update
                    </Button>
                  </CardActions>
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
                    title={"Deactivate approver?"}
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
                    title={"Activate approver?"}
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

export default TempApprovers;
