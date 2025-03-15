import React, { useState, useEffect, useCallback,useRef } from 'react';
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Card,AspectRatio} from "@mui/joy";
import { Result,notification } from "antd";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GlSetupTable from './GlSetupTable';
import AddIcon from "@mui/icons-material/Add";
import { API_SERVER1,API_SERVER, headers, axiosPrivate } from "../constant";
import axios from "axios";
import Checkbox from '@mui/joy/Checkbox';
import { SearchableSelect } from './SearchableSelect';
import { ReactComponent as UpdateIcon } from "../utils/icons/update-page-svgrepo-com.svg";
import { ReactComponent as PreviousIcon } from "../utils/icons/previous-svgrepo-com.svg";
import { ReactComponent as NextIcon } from "../utils/icons/next-svgrepo-com.svg";
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';


const GlSetup = () => {

    // Initialize state with an object to track modals
    const [modals, setModals] = useState({
        view: false,
        viewDoc: false,
        decline: false,
        response: false,
        edit: false,
    });


    const {user} = useAuth();
    const actionRef = useRef(null);
    const anchorRef = useRef(null);
    const axiosPrivate = useAxiosPrivate();
     // this handles the state of the component
    const [state, setState] = useState({
        setups: [], // Array to store the accounts
        account_name: "", // Description of the document type
        account_number: "", // Description of the document type
        account_type: "", // Transaction type of the document
        status: "", // Status of the document
        openMenu:false,
    });

    
    // Initialize notification
    const [api, contextHolder] = notification.useNotification();

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

    //opens success notification
    const notifySuccess = openNotification(true);

    //opens error notification
    const notifyError = openErrorNotification(true);

    // to toggle modals
    const handleOpen = useCallback((modalType, rowData) => {
        setModals((prevModals) => ({
        ...prevModals,
        [modalType]: true,
        }));

        // If we're opening edit modal and have row data, set the form state
        if (modalType === 'edit' && rowData) {

            setState((prevState) => ({
                ...prevState,
                account_name: rowData.account_name,
                account_number: rowData.account_number,
                account_type: rowData.account_type,
                status: rowData.status,
                selectedDocId: rowData.id // Store the ID for update API call
            }));
        }
    }, []);  

    

    // handleClose to close all modals when called without an argument
    const handleClose = useCallback((modalType) => {

        // Clear form inputs
        setState(prevState => ({
            ...prevState,
            currentStage: 0,
            numStages: 0,
            approvalStages: [],
            doc_type: "",
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

    //this function fetches all accounts
    const fetchAccounts = useCallback(async () => {
        try {
            setState((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await axiosPrivate.get(`get-all-accounts`);
            const data = response.data.accounts;
            setState((prevState) => ({
                ...prevState,
                setups: data,
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
    


   

    //this useEffect fetches the submitted documents
    useEffect(() => {
        fetchAccounts();
    }, []);

  
    


    //this function is used to save the account details
    const handleSave = useCallback(async () => {
        try {
            // Define an array of required fields with their corresponding display names
            const requiredFields = [
                { field: state.account_name?.trim(), name: 'Account Name' },
                { field: state.account_number?.trim(), name: 'Account Number' },
                { field: state.account_type?.toString(), name: 'Account Type' }, // Convert to string
                { field: state.status?.toString(), name: 'Status' }, // Convert to string
            ];

            // Filter out the fields that are empty and map them to their display names
            const validationErrors = requiredFields
                .filter(({ field }) => !field || field === "" || field === null)
                .map(({ name }) => name);

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
                account_name: state.account_name.trim(),
                account_number: state.account_number.trim(),
                account_type: state.account_type,
                status: state.status,
                posted_by: user.id
            };

            // Make API call
            const response = await axiosPrivate.post(`/add-account`, data, { withCredentials:true });
           
            if (response.data.code === '200') {
                notifySuccess(response.data.message);
                handleClose("add"); // Close modal
                fetchAccounts(); // Refresh the list
            }
        } catch (error) {
            notifyError(error.response.data.message);
        }
    }, [state.account_name, state.account_number, state.status, state.account_type]);

    //this function is used to update the account details
    const handleUpdate = useCallback(async () => {
        try {
            //get the data from the state and validate it, making sure all required fields are filled
            // Define an array of required fields with their corresponding display names
            const requiredFields = [
                { field: state.account_name?.trim(), name: 'Account Name' }, // Check for empty strings after trimming
                { field: state.account_number, name: 'Account Number' },
                { field: state.account_type, name: 'Account Type' },
                { field: state.status, name: 'Status' }
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
                account_name: state.account_name.trim(),
                account_number: state.account_number,
                account_type: state.account_type,
                status: state.status,
                posted_by: user.id
            };
            
            // Make API call
            const response = await axiosPrivate.put(`/update-account${state.selectedDocId}`, data, { withCredentials:true });
           
            if (response.data.code === '200') {
                notifySuccess(response.data.message);
                handleClose("edit"); // Close modal
                fetchAccounts(); // Refresh the list
            }
        } catch (error) {
            notifyError(error.response.data.message);
        }
    }, [state.account_name, state.account_number, state.status, state.account_type]);

  
   


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
                        Account Setup
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
                    <GlSetupTable setups={state.setups} handleOpen={handleOpen} />

                    {/* Modal for adding accounts */}
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
                                        Add Account
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    
                                    <Stack spacing={2}>
                                        {/* add fields here for the form a description and status */}
                                        <Stack spacing={1}>
                                            <FormLabel>Account Name</FormLabel>
                                            <FormControl sx={{ width: "100%" }}>
                                                <Input
                                                size="sm"
                                                placeholder="Enter Account Name"
                                                value={state.account_name}
                                                onChange={(e) =>
                                                    handleInputChange("account_name", e.target.value)
                                                }
                                                />
                                            </FormControl>
                                            <FormLabel>Account Number</FormLabel>
                                            <FormControl sx={{ width: "100%" }}>
                                                <Input
                                                size="sm"
                                                placeholder="Enter Account Number"
                                                value={state.account_number}
                                                onChange={(e) =>
                                                    handleInputChange("account_number", e.target.value)
                                                }
                                                />
                                            </FormControl>
                                            
                                            
                                            <FormLabel>Account Type</FormLabel>
                                            <FormControl sx={{ width: "100%" }}>
                                                <Select
                                                placeholder="Select Account type"
                                                value={state.account_type}
                                                onChange={(e, newValue) => handleInputChange("account_type", newValue)}
                                                >
                                                <Option value="1">Payment</Option>
                                                <Option value="0">Deduction</Option>
                                                </Select>
                                            </FormControl>

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

                     <Modal
                        aria-labelledby="modal-title"
                        aria-describedby="modal-desc"
                        open={modals.edit} 
                        onClose={() => handleClose("edit")}
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
                            <Sheet variant="outlined" sx={{width: 500,borderRadius: "md",p: 3,boxShadow: "lg", }}>
                                    <ModalClose variant="plain" sx={{ m: 1 }} />
                                    <Typography id="modal-desc" textColor="text.tertiary">
                                    <Box sx={{ mb: 1 }}>
                                                <Typography level="title-md">
                                                Update Account
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ marginBottom: 2 }} />
                                            
                                            <Stack spacing={2}>
                                                <Stack spacing={1}>
                                                <FormLabel>Account Name</FormLabel>
                                                <FormControl sx={{ width: "100%" }}>
                                                    <Input
                                                    size="sm"
                                                    placeholder="Enter Account Name"
                                                    value={state.account_name}
                                                    onChange={(e) => handleInputChange("account_name", e.target.value)}/>
                                                </FormControl>
                                                
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl sx={{ width: "100%" }}>
                                                    <Input
                                                    size="sm"
                                                    placeholder="Enter Account Number"
                                                    value={state.account_number}
                                                    onChange={(e) => handleInputChange("account_number", e.target.value)}/>
                                                </FormControl>
                                                
                                                
                                                    <FormLabel>Account Type</FormLabel>
                                                <FormControl sx={{ width: "100%" }}>
                                                    <Select
                                                    placeholder="Select Account Type"
                                                    value={state.account_type}
                                                    onChange={(e,newValue) => handleInputChange("account_type", newValue)}
                                                    >
                                                    <Option value="1">Payment</Option>
                                                    <Option value="0">Deduction</Option>
                                                    </Select>
                                                </FormControl>

                                                
                               
                                                <FormLabel>Status</FormLabel>
                                                <FormControl sx={{ width: "100%" }}>
                                                    <Select
                                                    placeholder="Select Status"
                                                    value={state.status}
                                                    onChange={(e,newValue) =>
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
                                                onClick={handleUpdate}
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

export default React.memo(GlSetup);