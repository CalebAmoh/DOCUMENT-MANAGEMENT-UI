import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Textarea,CardOverflow,Card,CardContent,AspectRatio} from "@mui/joy";
import { Result,notification } from "antd";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ParamsTable from './ParamsTable';
import AddIcon from "@mui/icons-material/Add";
import { API_SERVER1,API_SERVER, headers } from "../constant";
import InfoIcon from '@mui/icons-material/Info';
import axios from "axios";

const Params = () => {

    // Initialize state with an object to track modals
    const [modals, setModals] = useState({
        view: false,
        viewDoc: false,
        decline: false,
        response: false,
    });

     // this handles the state of the component
     const [state, setState] = useState({
        docs: [], // Array to store the generated documents
        description: "", // Description of the document type
        trans_type: "", // Transaction type of the document
        expense_code: "", // Expense code of the document
        status: "", // Status of the document
        // modals: null, // Modal type
        // selectedDocId: null, // Selected document id
        // docNumber: null, // Selected document number
        // docTypeId: null, // Selected document type id
        // branchId: null, // Selected branch id
        // requestedAmount: null, // Selected requested amount
        // customerNumber: null, // Selected customer number
        // details: null, // Selected details
        // docTypes: [], // Array to store the document types
        // branches: [], // Array to store the branches
        // decline_reason: null, // Decline reason
        // success: null, // Success message
        // loading : false
    });
   

    // Initialize notification
    const [api, contextHolder] = notification.useNotification();

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

     // to toggle modals
    const handleOpen = useCallback((modalType, id) => {
        setModals((prevModals) => ({
        ...prevModals,
        [modalType]: true,
        }));
        if (id) {
        setState((prevState) => ({
            ...prevState,
            selectedDocId: id,
        }));
        }
    }, []);  

    // handleClose to close all modals when called without an argument
    const handleClose = useCallback((modalType) => {

        // Clear form inputs
        setState(prevState => ({
            ...prevState,
            description: "",
            trans_type: "",
            expense_code: "",
            status: ""
        }));
        if (modalType) {
          setModals((prevModals) => ({
            ...prevModals,
            [modalType]: false,
          }));
        } else {
          // Close all modals
          setModals({
            view: false,
            viewDoc: false,
            decline: false,
            response: false,
          });
        }
    }, []);

    //this function is used to update the state when input changes
    const handleInputChange = useCallback((key, value) => {
        setState((prevState) => ({
            ...prevState,
            [key]: value
        }));
    }, []);

    //this function fetches all document types
    const fetchDocs = useCallback(async () => {
        try {
            setState((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await axios.get(`${API_SERVER1}/get-doc-types`, { headers });
            const data = response.data.documents;
            setState((prevState) => ({
                ...prevState,
                docs: data,
                loading: false
            }));
        } catch (error) {
            console.error("Error:", error);
            setState((prevState) => ({
                ...prevState,
                loading: false
            }));
        }
    }, []);

    //this function is used to save the document type
    const handleSave = useCallback(async () => {
        try {
            //get the data from the state and validate it, making sure all required fields are filled
            // Define an array of required fields with their corresponding display names
            const requiredFields = [
                { field: state.description?.trim(), name: 'Description' }, // Check for empty strings after trimming
                { field: state.trans_type, name: 'Transaction Document Type' },
                { field: state.status, name: 'Status' },
                //if the document type is a transactional document, then the expense code is required
                state.trans_type === "1" ? { field: state.expense_code, name: 'Expense code' } : { field: "data", name: "" }
            ];

            // Filter out the fields that are empty and map them to their display names
            const validationErrors = requiredFields
            .filter(({ field }) => !field || field === "" || field === null) // Check for falsy values including empty strings
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

            // If validation passes, prepare data for API call
            const data = {
                description: state.description.trim(),
                trans_type: state.trans_type,
                expense_code: state.trans_type === "1" ? state.expense_code : null,
                status: state.status
            };

            // Make API call
            const response = await axios.post(`${API_SERVER}/code_creation_details`, data, { headers });
            
            if (response.data.success) {
                notifySuccess("Document type added successfully");
                handleClose("add"); // Close modal
                fetchDocs(); // Refresh the list
            }
        } catch (error) {
            console.error("Error:", error);
            notifyError(error.response.data.message);
        }
    }, [state.description, state.trans_type, state.status, state.expense_code]);


    //this useEffect fetches the submitted documents
    useEffect(() => {
        fetchDocs();
    }, []);

    return (
        <div>
             {/* this is the notification holder */}
            {contextHolder}
            <div>
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
                        Parameters
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
                    <ParamsTable data={state.docs} handleOpen={handleOpen} />

                    {/* Modal for adding document type */}
                    <Modal
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            open={modals.add} 
                            onClose={() => handleClose("add")}
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
                                        Add Document Type
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    
                                    <Stack spacing={2}>
                                        {/* add fields here for the form a description and status */}
                                        <Stack spacing={1}>
                                             <FormLabel>Description</FormLabel>
                                            <FormControl sx={{ width: "100%" }}>
                                                <Input
                                                size="sm"
                                                placeholder="Enter Description"
                                                value={state.description}
                                                onChange={(e) =>
                                                    handleInputChange("description", e.target.value)
                                                }
                                                />
                                            </FormControl>
                                            
                                            
                                            <FormLabel>Transaction Document Type</FormLabel>
                                            <FormControl sx={{ width: "100%" }}>
                                                <Select
                                                placeholder="Select Transaction type"
                                                value={state.trans_type}
                                                onChange={(e, newValue) => handleInputChange("trans_type", newValue)}
                                                >
                                                <Option value="1">Yes</Option>
                                                <Option value="0">No</Option>
                                                </Select>
                                            </FormControl>

                                            {state.trans_type === "1" && (
                                                <FormLabel>Expense code</FormLabel>
                                            )}
                                            {state.trans_type === "1" && (
                                                <FormControl sx={{ width: "100%" }}>
                                                <Select
                                                    placeholder="Select Type of Expense"
                                                    value={state.expense_code}
                                                    onChange={(e, newValue) => handleInputChange("expense_code", newValue)}
                                                >
                                                    <Option value="">Select Type of Expense</Option>
                                                    <Option value="1">Donation</Option>
                                                    <Option value="0">Procument</Option>
                                                </Select>
                                                </FormControl>
                                            )}
                                            <FormLabel>Status</FormLabel>
                                            <FormControl sx={{ width: "100%" }}>
                                                <Select
                                                placeholder="Select Status"
                                                value={state.status}
                                                onChange={(e, newValue) =>
                                                    handleInputChange("status", newValue)
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

                    {/* Display document */}
                    <Modal
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            open={modals.edit} 
                            // onClose={() => handleClose("edit")}
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
                                        Update Document Type
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    
                                    {/* <Stack spacing={2}>
                                        <Stack spacing={1}>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl sx={{ width: "100%" }}>
                                            <Input
                                            size="sm"
                                            placeholder="Enter Description"
                                            value={state.description}
                                            onChange={(e,newValue) =>
                                                handleInputChange("description", newValue)
                                            }
                                            />
                                        </FormControl>
                                        
                                        
                                        <FormLabel>Transaction Document Type</FormLabel>
                                        <FormControl sx={{ width: "100%" }}>
                                            <Select
                                            placeholder="Select Transaction type"
                                            value={state.transType}
                                            onChange={(e, newValue) => handleInputChange("transType", newValue)}
                                            >
                                            <Option value="1">Yes</Option>
                                            <Option value="0">No</Option>
                                            </Select>
                                        </FormControl>

                                        {state.transType === "1" && (
                                            <FormLabel>Expense code</FormLabel>
                                        )}
                                        {state.transType === "1" && (
                                            <FormControl sx={{ width: "100%" }}>
                                            <Select
                                                placeholder="Select Type of Expense"
                                                value={state.expenseCode}
                                                onChange={(e, newValue) => handleInputChange("expenseCode", newValue)}
                                            >
                                                <Option value="1">Donation</Option>
                                                <Option value="0">Procument</Option>
                                            </Select>
                                            </FormControl>
                                        )}
                                        <FormLabel>Status</FormLabel>
                                        <FormControl sx={{ width: "100%" }}>
                                            <Select
                                            placeholder="Select Status"
                                            value={state.status}
                                            onChange={(e, newValue) =>
                                                handleInputChange("Status", newValue)
                                            }
                                            >
                                            <Option value="1">Active</Option>
                                            <Option value="0">Inactive</Option>
                                            </Select>
                                        </FormControl>

                                        </Stack>
                                    </Stack> */}
                                    <CardActions>
                                        <Button
                                        sx={{
                                            backgroundColor: "#00357A",
                                            color: "#fff",
                                            marginTop: "16px",
                                        }}
                                        onClick={null}
                                        >
                                        Update
                                        </Button>
                                    </CardActions>
                            </Typography>
                            </Sheet>
                    </Modal>
                </Box>
            </div>
        </div>
    );
};

export default React.memo(Params);
