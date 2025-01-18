import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Textarea,CardOverflow,Card,CardContent,AspectRatio} from "@mui/joy";
import { Result,notification } from "antd";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ParamsTable from './ParamsTable';
import AddIcon from "@mui/icons-material/Add";
import { API_SERVER1,API_SERVER, headers } from "../constant";
import { SearchableSelect } from './SearchableSelect';
import axios from "axios";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

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
        accounts: [], // Array to store the accounts
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
                description: rowData.description,
                trans_type: rowData.trans_type,
                expense_code: rowData.expense_code,
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

     //this function is used to save the document type
     const handleSave = useCallback(async () => {
        try {
            // Define an array of required fields with their corresponding display names
            const requiredFields = [
                { field: state.description?.trim(), name: 'Description' },
                { field: state.trans_type?.toString(), name: 'Is this a transactional type of document?' }, // Convert to string
                { field: state.status?.toString(), name: 'Status' }, // Convert to string
                state.trans_type === "1" ? { field: state.expense_code, name: 'Expense code' } : { field: "data", name: "" }
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
                description: state.description.trim(),
                trans_type: state.trans_type,
                expense_code: state.trans_type === "1" ? state.expense_code : null,
                status: state.status
            };

            // Make API call
            const response = await axios.post(`${API_SERVER}/code_creation_details`, data, { headers });
           
            if (response.data.code === '200') {
                notifySuccess(response.data.message);
                handleClose("add"); // Close modal
                fetchDocs(); // Refresh the list
            }
        } catch (error) {
            notifyError(error.response.data.message);
        }
    }, [state.description, state.trans_type, state.status, state.expense_code]);

    //this function is used to update the document type
    const handleUpdate = useCallback(async () => {
        try {
            //get the data from the state and validate it, making sure all required fields are filled
            // Define an array of required fields with their corresponding display names
            const requiredFields = [
                { field: state.description?.trim(), name: 'Description' }, // Check for empty strings after trimming
                { field: state.trans_type, name: 'Is this a transactional type of document?' },
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
            const response = await axios.put(`${API_SERVER}/code_creation_details/${state.selectedDocId}`, data, { headers });
           
            if (response.data.code === '200') {
                notifySuccess(response.data.message);
                handleClose("edit"); // Close modal
                fetchDocs(); // Refresh the list
            }
        } catch (error) {
            notifyError(error.response.data.message);
        }
    }, [state.description, state.trans_type, state.status, state.expense_code]);


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

    //this function fetches all accounts
    const fetchAccounts = useCallback(async () => {
        try {
           

            const response = await axios.get(`${API_SERVER1}/get-all-accounts`, { headers });
            const data = response.data.accounts;
            setState((prevState) => ({
                ...prevState,
                accounts: data
            }));
        } catch (error) {
            console.error("Error:", error);
            setState((prevState) => ({
                ...prevState,
            }));
        }
    }, []);

   

    //this useEffect fetches the submitted documents
    useEffect(() => {
        fetchDocs();
        fetchAccounts();
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
                                            
                                            
                                            <FormLabel>Is this a transactional type of document?</FormLabel>
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
                                                <FormLabel> Account</FormLabel>
                                            )}
                                            {state.trans_type === "1" && (
                                                <FormControl sx={{ width: "100%" }}>
                                                    <SearchableSelect 
                                                        options={state.accounts.map(account => ({ label: account.account_name, value: account.id }))}
                                                        onChange={(newValue) => handleInputChange("expense_code", newValue)}
                                                        label="Account"
                                                        placeholder="Select Account"
                                                        initialValue={state.expense_code ? {
                                                            label: state.accounts.find(account => account.id.toString() === state.expense_code)?.account_name || '',
                                                            value: state.expense_code
                                                        } : null}
                                                    />
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

                    {/* Edit Account Modal */}
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
                                    
                                   <Stack spacing={2}>
                                        <Stack spacing={1}>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl sx={{ width: "100%" }}>
                                            <Input
                                            size="sm"
                                            placeholder="Enter Description"
                                            value={state.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}/>
                                        </FormControl>
                                        
                                        
                                         <FormLabel>Is this a transactional type of document?</FormLabel>
                                        <FormControl sx={{ width: "100%" }}>
                                            <Select
                                            placeholder="Select Transaction type"
                                            value={state.trans_type}
                                            onChange={(e,newValue) => handleInputChange("trans_type", newValue)}
                                            >
                                            <Option value="1">Yes</Option>
                                            <Option value="0">No</Option>
                                            </Select>
                                        </FormControl>

                                        {state.trans_type === "1" && (
                                            <FormLabel> Account</FormLabel>
                                        )}
                                        {state.trans_type === "1" && (
                                            <FormControl sx={{ width: "100%" }}>
                                                <SearchableSelect 
                                                    options={state.accounts.map(account => ({ label: account.account_name, value: account.id }))}
                                                    onChange={(newValue) => handleInputChange("expense_code", newValue)}
                                                    label="Account"
                                                    placeholder="Select Account"
                                                    initialValue={state.expense_code ? {
                                                        label: state.accounts.find(account => account.id.toString() === state.expense_code)?.account_name || '',
                                                        value: state.expense_code
                                                    } : null}
                                                />
                                            </FormControl>
                                        )}
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

export default React.memo(Params);
