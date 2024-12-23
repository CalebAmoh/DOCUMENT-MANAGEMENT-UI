import React, { useState, useEffect, useCallback } from 'react';
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Textarea,CardOverflow,Card,CardContent,AspectRatio,Alert} from "@mui/joy";
import { Result,notification } from "antd";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ParamsTable from './ParamsTable';
import AddIcon from "@mui/icons-material/Add";
import { API_SERVER1,API_SERVER, headers } from "../constant";
import axios from "axios";
import Checkbox from '@mui/joy/Checkbox';
import Chip from '@mui/joy/Chip';
import { SearchableSelect } from './SearchableSelect'

const ApprovalSetup = () => {

    const [alertMessage, setAlertMessage] = useState('');

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
            // Define an array of required fields with their corresponding display names
            const requiredFields = [
                { field: state.description?.trim(), name: 'Description' },
                { field: state.trans_type?.toString(), name: 'Transaction Document Type' }, // Convert to string
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


    //this useEffect fetches the submitted documents
    useEffect(() => {
        fetchDocs();
    }, []);

    // Inside your component, add this new state
    const [approvalStages, setApprovalStages] = useState([]);
    const [numStages, setNumStages] = useState(0);

    // Add these handler functions
    const handleNumStagesChange = (value) => {
        if(value === ""){
            value = 0;
        }
        const num = parseInt(value);
        setNumStages(num);
        
        setApprovalStages(prev => {
            const newStages = [];
            for (let i = 0; i < num; i++) {
                newStages[i] = prev[i] || {
                    name: '',
                    approvers: [], // Will now store objects: { userId, name, isMandatory }
                };
            }
            return newStages;
        });
    };

    const handleStageNameChange = (index, value) => {
        setApprovalStages(prev => {
            const newStages = [...prev];
            newStages[index] = { ...newStages[index], name: value };
            return newStages;
        });
    };

    const handleApproversChange = (index, value) => {
        setApprovalStages(prev => {
            const newStages = [...prev];
            newStages[index] = { ...newStages[index], approvers: value };
            return newStages;
        });
    };

    // Add this new handler for mandatory status
    // const handleMandatoryChange = (stageIndex, userId) => {
        
    //     setApprovalStages(prev => {
    //         const newStages = [...prev];
    //         const stage = {...newStages[stageIndex]};
            
    //         stage.approvers = stage.approvers.map(approver => {
    //             if (approver.userId === userId) {
    //                 return { ...approver, isMandatory: !approver.isMandatory };
    //             }
    //             return approver;
    //         });
            
            
    //         newStages[stageIndex] = stage;
    //         return newStages;
    //     });
    // };

    const handleMandatoryChange = (stageIndex, userId) => {
        setApprovalStages((prevStages) => {
            const newStages = [...prevStages];
            const stage = { ...newStages[stageIndex] };
            const approver = stage.approvers.find((a) => a.userId === userId);
            if (approver) {
                const mandatoryCount = stage.approvers.filter((a) => a.isMandatory).length;
                if (!approver.isMandatory && mandatoryCount >= stage.requiredApprovers) {
                    setAlertMessage('Mandatory users limit reached');
                    return newStages;
                }
                approver.isMandatory = !approver.isMandatory;
                setAlertMessage('');
            }
            newStages[stageIndex] = stage;
            return newStages;
        });
    };

    const handleApproversNeededChange = (index, value) => {
        setApprovalStages(prev => {
            const newStages = [...prev];
            newStages[index] = { 
                ...newStages[index], 
                approversNeeded: value 
            };
            return newStages;
        });
    };
    
    const handleRequiredApproversChange = (index, value) => {

        // Get the current stage's needed approvers
        const neededApprovers = approvalStages[index]?.approversNeeded || 0;
        
        // Convert value to number
        const requiredValue = parseInt(value) || 0;
        
        // Check if required approvers exceed needed approvers
        if (requiredValue > neededApprovers) {
            notifyError("Required approvers cannot be more than approvers needed");
            return;
        }

        setApprovalStages(prev => {
            const newStages = [...prev];
            newStages[index] = { 
                ...newStages[index], 
                requiredApprovers: value 
            };
            return newStages;
        });
    };

    // Add these new state variables at the top of your component
    const [currentStage, setCurrentStage] = useState(0);
    const [isStageValid, setIsStageValid] = useState(false);

    // Add this validation function
    const validateCurrentStage = useCallback(() => {
        // If we're on the initial setup stage (stage 0)
        if (currentStage === 0) {
            return numStages > 0 && state.trans_type;
        }
        
        // For approval stages (stage 1 and above)
        const stage = approvalStages[currentStage - 1];
        return stage && 
               stage.name?.trim() && 
               stage.approversNeeded && 
               stage.requiredApprovers && 
               stage.approvers?.length > 0;
    }, [approvalStages, currentStage, numStages, state.trans_type]);

    // // Add these handler functions
    // const handleNext = () => {
    //     console.log('Current Stage:', currentStage);
    //     console.log('Current Stage Data:', approvalStages[currentStage - 1]);
        
    //     if (validateCurrentStage()) {
    //         setCurrentStage(prev => prev + 1);
    //     } else {
    //         notifyError("Please fill in all required fields for this stage");
    //     }
    // };
        // Modify the handleNext function to use the validation result more efficiently
        
    const handleNext = useCallback(() => {
        const isValid = validateCurrentStage();

        // Approval stages validation
        const stage = approvalStages[currentStage - 1];
        
        if(currentStage > 0){
            // Add required vs needed approvers validation

            const requiredApprovers = parseInt(stage.requiredApprovers) || 0;
            const neededApprovers = parseInt(stage.approversNeeded) || 0;
            const selectedApprovers = parseInt(stage.approvers.length) || 0;
            // Count mandatory approvers
            const mandatoryApproversCount = stage.approvers?.filter(a => a.isMandatory)?.length || 0;

            // Combined validation for mandatory and needed approvers
            if ((requiredApprovers > 0 && mandatoryApproversCount < requiredApprovers) || selectedApprovers < neededApprovers) {
                if (mandatoryApproversCount < requiredApprovers) {
                    notifyError(`Please select ${requiredApprovers} mandatory approvers for this stage`);
                } else {
                    notifyError(`You need ${neededApprovers} approvers to proceed`);
                }
                return false;
            }

        }
        
        
        
        if (isValid) {
            setCurrentStage(prev => prev + 1);
        } else {
            notifyError("Please fill in all required fields for this stage");
        }
    }, [validateCurrentStage, notifyError,approvalStages]);

    const handlePrevious = () => {
        // Allow going back to stage 0 (initial setup)
        setCurrentStage(prev => Math.max(0, prev - 1));
    };

    // Add this to your state declarations at the top
    const [availableUsers] = useState([
        { userId: 'user1', name: 'John Doe', department: 'Finance' },
        { userId: 'user2', name: 'Jane Smith', department: 'HR' },
        { userId: 'user3', name: 'Bob Johnson', department: 'Operations' },
        { userId: 'user4', name: 'Alice Williams', department: 'Finance' },
        { userId: 'user5', name: 'Mike Brown', department: 'IT' },
        { userId: 'user6', name: 'Sarah Davis', department: 'Marketing' },
        { userId: 'user7', name: 'David Lee', department: 'Sales' },
        { userId: 'user8', name: 'Emily White', department: 'Engineering' },
        { userId: 'user9', name: 'Michael Green', department: 'Legal' },
        { userId: 'user10', name: 'Olivia Black', department: 'Customer Service' },
    ]);

    console.log('Current stage approvers:', approvalStages[currentStage - 1]?.approvers);
    console.log('Available users:', availableUsers);

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
                        Document Approval Setup
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
                                width: 800,
                                maxHeight: '85vh',
                                borderRadius: "md",
                                boxShadow: "lg",
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden', // Prevent overall overflow
                            }}
                            >
                            <ModalClose variant="plain" sx={{ m: 1 }} />
                            
                                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography level="title-md">
                                        Setup Document Approval
                                    </Typography>
                                </Box>

                                <Box sx={{ 
                                    p: 3,
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                }}>
                                    {currentStage === 0 ? (
                                        // Initial Setup Content
                                        <Stack spacing={2}>
                                            <Stack direction="row" spacing={2}>
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Document Type</FormLabel>
                                                    <FormControl sx={{ width: "100%" }}>
                                                        {/* <Select
                                                            size="sm"
                                                            placeholder="Select Document type"
                                                            value={state.trans_type}
                                                            onChange={(e, newValue) => handleInputChange("trans_type", newValue)}
                                                        >
                                                            {state.docs.map((doc) => (
                                                                <Option value={doc.id}>{doc.description}</Option>
                                                            ))}
                                                        </Select> */}
                                                        {/* <SearchableSelect 
                                                            options={state.docs.map(doc => ({ label: doc.description, value: doc.id }))}
                                                            onChange={(e, newValue) => handleInputChange("trans_type", newValue)}
                                                            value={state.trans_type}
                                                        /> */}
                                                        <SearchableSelect 
                                                            options={state.docs.map(doc => ({ label: doc.description, value: doc.id.toString() }))}
                                                            onChange={(newValue) => handleInputChange("trans_type", newValue)}
                                                            label="Document Type"
                                                            placeholder="Select Document type"
                                                            initialValue={state.trans_type ? {
                                                                label: state.docs.find(doc => doc.id.toString() === state.trans_type)?.description || '',
                                                                value: state.trans_type
                                                            } : null}
                                                        />
                                                    </FormControl>
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Number of Approval Stages</FormLabel>
                                                    <FormControl sx={{ width: "100%" }}>
                                                        <Input
                                                            size="sm"
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            placeholder="Enter Number of Stages"
                                                            value={numStages}
                                                            onChange={(e) => handleNumStagesChange(e.target.value)}
                                                        />
                                                    </FormControl>
                                                </Box>
                                            </Stack>
                                            {/* <Button
                                                sx={{ backgroundColor: "#00357A", mt: 2,width:"30%",display: "flex" }}
                                                onClick={() => {
                                                    if (numStages > 0 && state.trans_type) {
                                                        setCurrentStage(1);
                                                    } else {
                                                        notifyError("Please set document type and number of stages");
                                                    }
                                                }}
                                            >
                                                Continue to Stage Setup
                                            </Button> */}
                                        </Stack>
                                    ) : (
                                        // Stage Setup Content
                                        <Box>
                                            <Typography level="h4" sx={{ mb: 2 }}>
                                                Stage {currentStage} of {numStages}
                                            </Typography>
                                            
                                            <Card variant="outlined" sx={{ p: 2 }}>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={2}>
                                                    <FormControl sx={{ flex: 1 }}>
                                                    <FormLabel>Stage Description</FormLabel>
                                                            <Input
                                                                size="sm"
                                                                placeholder="Enter stage description"
                                                                value={approvalStages[currentStage - 1]?.name || ''}
                                                                onChange={(e) => handleStageNameChange(currentStage - 1, e.target.value)}
                                                            />
                                                    </FormControl>
                                                    <FormControl sx={{ flex: 1 }}>
                                                        <FormLabel>Approvers Needed </FormLabel>
                                                        <Input 
                                                            size="sm" 
                                                            type="number"
                                                            placeholder="Select number of approvers needed"
                                                            value={approvalStages[currentStage - 1]?.approversNeeded || ''}
                                                            onChange={(e) => handleApproversNeededChange(currentStage - 1, e.target.value)}
                                                        />
                                                    </FormControl>
                                                    </Stack>
                                                </Stack>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={2}>
                                                        <FormControl sx={{ flex: 1 }}>
                                                            <FormLabel>Required Approvers</FormLabel>
                                                            <Input 
                                                                size="sm" 
                                                                type="number"
                                                                placeholder="Select number of required approvers"
                                                                value={approvalStages[currentStage - 1]?.requiredApprovers || ''}
                                                                onChange={(e) => handleRequiredApproversChange(currentStage - 1, e.target.value)}
                                                            />
                                                        </FormControl>
                                                        <FormControl sx={{ flex: 1 }}>
                                                        <FormLabel>
                                                            Select Approvers
                                                            {/* <Typography level="body-sm" sx={{ color: 'text.secondary', ml: 1, display: 'inline' }}>
                                                                (Check box to make approver mandatory)
                                                            </Typography> */}
                                                        </FormLabel>
                                                        {/* User Selection */}
                                                        <Select
                                                            multiple
                                                            size="sm"
                                                            
                                                            sx={{ minWidth: '15rem', mb: 2,maxWidth: '343px' }}
                                                            value={approvalStages[currentStage - 1]?.approvers?.map(a => a.userId) || []}
                                                            onChange={(e, newValues) => {
                                                                const currentStageIndex = currentStage - 1;
                                                                setApprovalStages(prev => {
                                                                    const newStages = [...prev];
                                                                    const stage = {...newStages[currentStageIndex]};
                                                                    
                                                                    // Preserve existing approvers' mandatory status
                                                                    const existingApprovers = stage.approvers.reduce((acc, curr) => {
                                                                        acc[curr.userId] = curr.isMandatory;
                                                                        return acc;
                                                                    }, {});

                                                                    // Check if the new selection exceeds the approvers needed
                                                                    if (newValues.length > stage.approversNeeded) {
                                                                        notifyError(`You can only select up to ${stage.approversNeeded} approvers.`);
                                                                        return prev; // Return the previous state without updating
                                                                    }
                                                                    
                                                                    // Update approvers list with new selections, limited by approversNeeded
                                                                    stage.approvers = newValues.slice(0, stage.approversNeeded).map(userId => {
                                                                        const user = availableUsers.find(u => u.userId === userId);
                                                                        return {
                                                                            userId,
                                                                            name: user.name,
                                                                            department: user.department,
                                                                            isMandatory: existingApprovers[userId] || false
                                                                        };
                                                                    });
                                                                    
                                                                    newStages[currentStageIndex] = stage;
                                                                    return newStages;
                                                                });
                                                            }}
                                                            slotProps={{
                                                                listbox: {
                                                                    sx: { width: '100%', maxHeight: '200px', overflow: 'auto' }
                                                                }
                                                            }}
                                                        >
                                                            {availableUsers.map((user) => (
                                                                <Option 
                                                                    key={user.userId} 
                                                                    value={user.userId}
                                                                >
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                        <Typography>{user.name}</Typography>
                                                                        {/* <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                                                                            {user.department}
                                                                        </Typography> */}
                                                                    </Box>
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                        
                                                        
                                                        {alertMessage && (
                                                            <Alert severity="warning" onClose={() => setAlertMessage('')}>
                                                                {alertMessage}
                                                            </Alert>
                                                        )}    
                                                        {/* Selected Approvers List */}
                                                        {approvalStages[currentStage - 1]?.approvers.length > 0 ? (
                                                            <Card variant="outlined" sx={{ p: 1.5, maxWidth: '400px' }}>
                                                                <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                                    Selected Approvers:
                                                                </Typography>
                                                                <Stack spacing={1}>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                                                        {approvalStages[currentStage - 1]?.approvers.map((approver) => (
                                                                            <Box 
                                                                                key={approver.userId}
                                                                                sx={{
                                                                                    display: 'flex',
                                                                                    flexDirection: 'column',
                                                                                    p: 1,
                                                                                    bgcolor: 'background.level1',
                                                                                    borderRadius: 'sm',
                                                                                    '&:hover': {
                                                                                        bgcolor: 'background.level2',
                                                                                    },
                                                                                    width: 'calc(50% - 8px)' // Two items per row
                                                                                }}
                                                                            >
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                                                        <Typography level="body-xs">{approver.name}</Typography>
                                                                                        {/* <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                                                                                            {approver.department}
                                                                                        </Typography> */}
                                                                                    </Box>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                                    <Checkbox
                                                                                        size="sm"
                                                                                        checked={approver.isMandatory}
                                                                                        onChange={() => handleMandatoryChange(currentStage - 1, approver.userId)}
                                                                                        label="Mandatory"
                                                                                        disabled={
                                                                                            approvalStages[currentStage - 1]?.approvers.filter(a => a.isMandatory).length >= approvalStages[currentStage - 1]?.requiredApprovers && !approver.isMandatory
                                                                                        }
                                                                                    />
                                                                                    {approver.isMandatory && (
                                                                                        <Typography 
                                                                                            level="body-xs"
                                                                                            sx={{ 
                                                                                                color: 'warning.main',
                                                                                                bgcolor: 'warning.softBg',
                                                                                                px: 0.5,
                                                                                                borderRadius: 'xs',
                                                                                                ml: 1
                                                                                            }}
                                                                                        >
                                                                                            Required
                                                                                        </Typography>
                                                                                    )}
                                                                                </Box>
                                                                            </Box>
                                                                        ))}
                                                                    </Box>
                                                                </Stack>
                                                            </Card>
                                                        ) : (
                                                            <Typography level="body-sm" sx={{ color: 'text.secondary', textAlign: 'center', py: 1.5 }}>
                                                                No approvers selected yet
                                                            </Typography>
                                                        )}
                                                    </FormControl>
                                                        {/* <FormControl sx={{ flex: 1 }}>
                                                        <FormLabel>
                                                            Approvers
                                                            <Typography level="body-sm" sx={{ color: 'text.secondary', ml: 1, display: 'inline' }}>
                                                                (Check box to make approver mandatory)
                                                            </Typography>
                                                        </FormLabel>
                                                                <Input
                                                                    size="sm"
                                                                    placeholder="Select approvers"
                                                                    value={approvalStages[currentStage - 1]?.name || ''}
                                                                    onChange={(e) => handleStageNameChange(currentStage - 1, e.target.value)}
                                                                />
                                                        </FormControl> */}
                                                    
                                                    </Stack>
                                                </Stack>
                                              
                                            </Card>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ 
                                    p: 3,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.surface',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2
                                }}>
                                    {/* Navigation Buttons */}
                                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handlePrevious}
                                        >
                                            Previous
                                        </Button>
                                        
                                        {currentStage === numStages ? (
                                            <Button
                                                sx={{ backgroundColor: "#00357A" }}
                                                onClick={handleSave}
                                                disabled={!validateCurrentStage()}
                                            >
                                                Save All Stages
                                            </Button>
                                        ) : (
                                            <Button
                                                sx={{ backgroundColor: "#00357A" }}
                                                onClick={handleNext}
                                                disabled={!validateCurrentStage()}
                                            >
                                                Next Stage
                                            </Button>
                                        )}
                                    </Stack>

                                    {/* Progress Indicator */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        {[...Array(numStages + 1)].map((_, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    backgroundColor: index === currentStage ? '#00357A' : '#ccc'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Sheet>
                    </Modal>

                    {/* Display document */}
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
                                        
                                        
                                         <FormLabel>Transaction Document Type</FormLabel>
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
                                            <FormLabel>Expense code</FormLabel>
                                        )}
                                        {state.trans_type === "1" && (
                                            <FormControl sx={{ width: "100%" }}>
                                            <Select
                                                placeholder="Select Type of Expense"
                                                value={state.expense_code}
                                                onChange={(e,newValue) => handleInputChange("expense_code", newValue)}
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

export default React.memo(ApprovalSetup);