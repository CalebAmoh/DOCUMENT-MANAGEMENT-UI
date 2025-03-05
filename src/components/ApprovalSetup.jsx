import React, { useState, useEffect, useCallback,useRef } from 'react';
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Card,AspectRatio} from "@mui/joy";
import { Result,notification } from "antd";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ApprovalSetupTable from './ApprovalSetupTable';
import AddIcon from "@mui/icons-material/Add";
import { API_SERVER1,API_SERVER, headers } from "../constant";
import axios from "axios";
import Checkbox from '@mui/joy/Checkbox';
import { SearchableSelect } from './SearchableSelect';
import { ReactComponent as UpdateIcon } from "../utils/icons/update-page-svgrepo-com.svg";
import { ReactComponent as PreviousIcon } from "../utils/icons/previous-svgrepo-com.svg";
import { ReactComponent as NextIcon } from "../utils/icons/next-svgrepo-com.svg";
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const ApprovalSetup = () => {

    // Initialize state with an object to track modals
    const [modals, setModals] = useState({
        view: false,
        viewDoc: false,
        decline: false,
        response: false,
        edit: false,
    });


    const actionRef = useRef(null);
    const anchorRef = useRef(null);
    
     // this handles the state of the component
    const [state, setState] = useState({
        docs: [], // Array to store the generated documents
        docsAvailable: [], // Array to store the generated documents
        setups: [], // Array to store the approver setups
        description: "", // Description of the document type
        trans_type: "", // Transaction type of the document
        doc_type: "", // Document type 
        expense_code: "", // Expense code of the document
        status: "", // Status of the document
        numOfNeededApprovers: 0,
        numOfRequiredApprovers: 0,
        openMenu:false,
        selectedIndex:1,
        numStages: 0, // Number of approval stages
        currentStage: 0, // Current stage of the approval setup
        approvalStages: [], // Array to store the approval stages
        availableUsers: [], // Array to store the approvers
    });

    const axiosPrivate = useAxiosPrivate();
    
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

            // Parse the approval stages from the details field
            let approval_stages = JSON.parse(rowData.details);

            setState((prevState) => ({
                ...prevState,
                doc_type: rowData.doctype_id.toString(),
                numStages: rowData.approval_stages,
                approvalStages: approval_stages
                // description: rowData.description,
                // trans_type: rowData.trans_type,
                // expense_code: rowData.expense_code,
                // status: rowData.status,
                // selectedDocId: rowData.id // Store the ID for update API call
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

    //this function fetches all available doc types
    const fetchAvailableDocTypes = useCallback(async () => {
        try {
            setState((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await axiosPrivate.get('get-available-doc-types');
            const data = response.data.documents;
            setState((prevState) => ({
                ...prevState,
                docsAvailable: data,
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
    
    //this function fetches all doc types
    const fetchDocTypes = useCallback(async () => {
        try {
            setState((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await axiosPrivate.get(`get-doc-types`);
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
    
    //this function fetches all doc types
    const fetchApproverUsers = useCallback(async () => {
        try {
            setState((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await axiosPrivate.get(`get-approver-users`);
            const data = response.data.approvers;
            console.log("users data",data);
            setState((prevState) => ({
                ...prevState,
                availableUsers: data,
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
    
    
    //this function fetches all approver setups
    const fetchApproverSetups = useCallback(async () => {
        try {
            setState((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await axiosPrivate.get(`get-approver-setups`);
            const data = response.data.setups;
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
        fetchAvailableDocTypes();
        fetchDocTypes();
        fetchApproverSetups();
        fetchApproverUsers();
    }, []);

   
    // Add these handler functions
    const handleNumStagesChange = (value) => {
        if(value === ""){
            value = 0;
        }
        const num = parseInt(value);
        setState(prevState => {
            const newStages = [];
            for (let i = 0; i < num; i++) {
                newStages[i] = prevState.approvalStages[i] || {
                    name: '',
                    approvers: [], // Will now store objects: { userId, name, isMandatory }
                };
            }
            return {
                ...prevState,
                numStages: num,
                approvalStages: newStages
            }
        });
        
    };


    //this function handles the stage name change
    const handleStageNameChange = (index, value) => {
        setState(prevState => {
            const newStages = [...prevState.approvalStages];
            newStages[index] = { ...newStages[index], name: value };
            return {
                ...prevState,
                approvalStages: newStages
            };
        });
    };

    //this function handles the quorum change
    const handleQuorumChange = (index, value) => {
        setState(prevState => {
            const newStages = [...prevState.approvalStages];
            const stage = { ...newStages[index] };
            const currentMandatoryCount = stage.approvers?.filter(a => a.isMandatory).length || 0;
            
            // Convert value to number
            const newQuorum = parseInt(value) || 0;
            
            // Check if new quorum would be less than current mandatory approvers
            if (newQuorum < currentMandatoryCount) {
                notifyError(`Quorum cannot be less than current required approvers (${currentMandatoryCount})`);
                return prevState;
            }
            
            stage.quorum = value;
            newStages[index] = stage;
            return {
                ...prevState,
                approvalStages: newStages
            };
        });
    };

   

    // Add this new handler for mandatory status
    const handleMandatoryChange = (stageIndex, userId) => {
        setState(prevState => {
            const newStages = [...prevState.approvalStages];
            const stage = { ...newStages[stageIndex] };
            
            // Count current mandatory approvers
            const mandatoryApproversCount = stage.approvers.filter(a => a.isMandatory).length;
            const quorum = parseInt(stage.quorum) || 0;

            // Update the approvers' mandatory status
            stage.approvers = stage.approvers.map(approver => {
                if (approver.userId === userId) {
                    const isCurrentlyMandatory = approver.isMandatory;
                    // If toggling to mandatory, check if we can allow it based on quorum
                    if (!isCurrentlyMandatory && mandatoryApproversCount >= quorum) {
                        notifyError(`Required approvers cannot exceed the quorum number (${quorum})`);
                        return { ...approver }; // Keep current state
                    }
                    return { ...approver, isMandatory: !isCurrentlyMandatory };
                }
                return approver;
            });
            
            newStages[stageIndex] = stage;
            return {
                ...prevState,
                approvalStages: newStages
            };
        });
    };

    //this function handles the approvers needed change
    const handleApproversNeededChange = (index, value) => {
        // Get current number of selected approvers
        // const currentApprovers = state.approvalStages[index]?.approvers?.length || 0;

        setState(prevState => {
            const newStages = [...prevState.approvalStages];
            newStages[index] = { 
                ...newStages[index], 
                // Set approversNeeded to the current number of selected approvers
                // approversNeeded: currentApprovers.toString() == "0" ? value : currentApprovers.toString()
                approversNeeded: value 
            };
            return {
                ...prevState,
                approvalStages: newStages
            };
        });
    };
    
    //this function handles the required approvers change
    // const handleRequiredApproversChange = (index, value) => {
    //     // Get the current stage's needed approvers
    //     const neededApprovers = state.approvalStages[index]?.approversNeeded || 0;
        
    //     // Convert value to number
    //     const requiredValue = parseInt(value) || 0;
        
    //     // Check if required approvers exceed needed approvers
    //     if (requiredValue > neededApprovers) {
    //         notifyError("Required approvers cannot be more than approvers needed");
    //         return;
    //     }
        
    //     setApprovalStages(prev => {
    //         const newStages = [...prev];
    //         newStages[index] = { 
    //             ...newStages[index], 
    //             requiredApprovers: value 
    //         };
    //         return newStages;
    //     });
    // };


    // Modify the validateCurrentStage function to use useCallback with proper dependencies
    const validateCurrentStage = useCallback(() => {
        // Initial setup stage validation
        if (state.currentStage === 0) {
            return state.numStages > 0 && state.doc_type;
        }
        
        // Approval stages validation
        const stage = state.approvalStages[state.currentStage - 1];
        if (!stage) return false;


        // Add required vs needed approvers validation
        const requiredApprovers = parseInt(stage.requiredApprovers) || 0;
        const neededApprovers = parseInt(stage.approversNeeded) || 0;
        
        
        // if (requiredApprovers > neededApprovers) {
        //     notifyError("Required approvers cannot be more than approvers needed");
        //     return false;
        // }
        
        

        return Boolean(
            stage.name?.trim() && stage.quorum?.trim &&
            // stage.approversNeeded && 
            // stage.requiredApprovers && 
            stage.approvers?.length > 0
        );
    }, [state.currentStage, state.numStages, state.doc_type, state.approvalStages, notifyError]);

    // Modify the handleNext function to use the validation result more efficiently
    const handleNext = useCallback(() => {
        const isValid = validateCurrentStage();

        // Approval stages validation
        const stage = state.approvalStages[state.currentStage - 1];
        
        if(state.currentStage > 0){

            //ensures the selected approvers is not less than the quorum
            const selectedApproversCount = stage.approvers?.length || 0;
            const quorum = parseInt(stage.quorum) || 0;

            if (quorum > 0 && selectedApproversCount < quorum) {
                notifyError(`You need at least ${quorum} approvers to match the quorum requirement`);
                return false;
            }

            // Add required vs needed approvers validation

            const neededApprovers = parseInt(stage.approversNeeded) || 0;
            const selectedApprovers = parseInt(stage.approvers.length) || 0;
            
            
            //Check if the selected approvers match the needed approvers
            if (selectedApprovers < neededApprovers) {
                notifyError(`You need ${neededApprovers} approvers to proceed`);
                return false;
            }

        }
       
        
        
        if (isValid) {
            // setCurrentStage(prev => prev + 1);
            setState((prevState) => ({
                ...prevState,
                currentStage: prevState.currentStage + 1
            }))
        } else {
            notifyError("Please fill in all required fields for this stage");
        }
    }, [validateCurrentStage, notifyError,state.approvalStages,state.currentStage]);

    // handles previous stages
    const handlePrevious = useCallback(() =>{
        setState((prevState) => ({
            ...prevState,
            currentStage: Math.max(0,prevState.currentStage - 1)
        }))
    },[state.currentStage])
    


    //this function handles the save all stages
    const handleSave = useCallback(async() => {
        // Validate the last stage before saving
        const isValid = validateCurrentStage();
        if (!isValid) {
            notifyError("Please fill in all required fields for this stage");
            return;
        }

        try {
            
            // Prepare the payload
            const payload = {
                doctype_id: state.doc_type, // Document type ID
                stages: state.approvalStages, // Array of approval stages
            };
            // console.log(payload);return;
            // Send the payload to the server
            const response = await axios.post(`${API_SERVER}/approvers`, payload, { headers });
            if (response.status === 200) {
                notifySuccess("Document approval stages saved successfully");
                // Reset the form
                handleClose("add");
                fetchApproverSetups();
                fetchAvailableDocTypes();
                fetchDocTypes();
                setState(prevState => ({
                    ...prevState,
                    currentStage: 0,
                    numStages: 0,
                    approvalStages: []
                }));
            }
        } catch (error) {
            console.error("Error:", error);
            notifyError("An error occurred while saving document approval stages");
            
        }
    }, [state.approvalStages,state.doc_type,validateCurrentStage]);
    
    
    //this function handles the update all stages
    const handleUpdate = useCallback(async() => {
        // Validate the last stage before saving
        const isValid = validateCurrentStage();
        if (!isValid) {
            notifyError("Please fill in all required fields for this stage");
            return;
        }

        try {
            
            // Prepare the payload
            const payload = {
                doctype_id: state.doc_type, // Document type ID
                stages: state.approvalStages, // Array of approval stages
            };
            // console.log(payload);return;
            // Send the payload to the server
            const response = await axios.post(`${API_SERVER}/approvers/update`, payload, { headers });
            if (response.status === 200) {
                notifySuccess("Document approval stages updated successfully");
                // Reset the form
                handleClose("edit");
                fetchApproverSetups();
                setState(prevState => ({
                    ...prevState,
                    currentStage: 0,
                    numStages: 0,
                    approvalStages: []
                }));
            }
        } catch (error) {
            console.error("Error:", error);
            notifyError("An error occurred while saving document approval stages");
            
        }
    }, [state.approvalStages,state.doc_type,validateCurrentStage]);

    // Add this to your state declarations at the top
    // const [availableUsers] = useState([
    //     { userId: 'user1', name: 'John Doe', department: 'Finance' },
    //     { userId: 'user2', name: 'Jane Smith', department: 'HR' },
    //     { userId: 'user3', name: 'Bob Johnson', department: 'Operations' },
    //     { userId: 'user4', name: 'Alice Williams', department: 'Finance' },
    //     { userId: 'user5', name: 'Mike Brown', department: 'IT' },
    //     { userId: 'user6', name: 'Sarah Davis', department: 'Marketing' },
    //     { userId: 'user7', name: 'David Lee', department: 'Sales' },
    //     { userId: 'user8', name: 'Emily White', department: 'Engineering' },
    //     { userId: 'user9', name: 'Michael Green', department: 'Legal' },
    //     { userId: 'user10', name: 'Olivia Black', department: 'Customer Service' },
    // ]);


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
                    <ApprovalSetupTable setups={state.setups} handleOpen={handleOpen} />

                    {/* Modal for adding approval setup */}
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
                                width: 650,
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
                                    {state.currentStage === 0 ? (
                                        // Initial Setup Content
                                        <Stack spacing={2}>
                                            <Stack direction="row" spacing={2}>
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Document Type</FormLabel>
                                                    <FormControl sx={{ width: "100%" }}>
                                                        
                                                        <SearchableSelect 
                                                            options={state.docsAvailable.map(doc => ({ label: doc.description, value: doc.id.toString() }))}
                                                            onChange={(newValue) => handleInputChange("doc_type", newValue)}
                                                            label="Document Type"
                                                            placeholder="Select Document type"
                                                            initialValue={state.doc_type ? {
                                                                label: state.docs.find(doc => doc.id.toString() === state.doc_type)?.description || '',
                                                                value: state.doc_type
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
                                                            value={state.numStages}
                                                            onChange={(e) => handleNumStagesChange(e.target.value)}
                                                        />
                                                    </FormControl>
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    ) : (
                                        // Stage Setup Content
                                        <Box>
                                            <Typography level="h4" sx={{ mb: 2 }}>
                                                Stage {state.currentStage} of {state.numStages}
                                            </Typography>
                                            
                                            <Card variant="outlined" sx={{ p: 2 }}>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={2}>
                                                        <FormControl sx={{ flex: 1 }}>
                                                                <FormLabel>Stage Description</FormLabel>
                                                                <Input
                                                                    size="sm"
                                                                    placeholder="Enter stage description"
                                                                    value={state.approvalStages[state.currentStage - 1]?.name || ''}
                                                                    onChange={(e) => handleStageNameChange(state.currentStage - 1, e.target.value)}
                                                                />
                                                        </FormControl>
                                                        <FormControl sx={{ flex: 1 }}>
                                                            <FormLabel>Quorum</FormLabel>
                                                            <Input 
                                                                size="sm" 
                                                                type="number"
                                                                placeholder="Select quorum number"
                                                                value={state.approvalStages[state.currentStage - 1]?.quorum || ''}
                                                                onChange={(e) => handleQuorumChange(state.currentStage - 1, e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </Stack>
                                                </Stack>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={2}>
                                                        {/* <FormControl sx={{ flex: 1 }}>
                                                            <FormLabel>Required Approvers</FormLabel>
                                                            <Input 
                                                                size="sm" 
                                                                type="number"
                                                                placeholder="Select number of required approvers"
                                                                value={state.approvalStages[state.currentStage - 1]?.requiredApprovers || ''}
                                                                onChange={(e) => handleRequiredApproversChange(state.currentStage - 1, e.target.value)}
                                                            />
                                                        </FormControl> */}
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
                                                            sx={{ minWidth: '16rem', mb: 2, maxWidth: '563px' }}
                                                            value={state.approvalStages[state.currentStage - 1]?.approvers?.map(a => a.userId) || []}
                                                            onChange={(e, newValues) => {
                                                                const currentStageIndex = state.currentStage - 1;
                                                                setState(prevState => {
                                                                    const newStages = [...prevState.approvalStages];
                                                                    const stage = {...newStages[currentStageIndex]};
                                                                    
                                                                    // Preserve existing approvers' mandatory status
                                                                    const existingApprovers = stage.approvers?.reduce((acc, curr) => {
                                                                        acc[curr.userId] = curr.isMandatory;
                                                                        return acc;
                                                                    }, {}) || {};
                                                                    
                                                                    // Check if the new selection exceeds the approvers needed
                                                                    if (newValues.length > stage.approversNeeded) {
                                                                        notifyError(`You can only select up to ${stage.approversNeeded} approvers.`);
                                                                        return prevState; // Return the previous state without updating
                                                                    }

                                                                    // Update approvers list with new selections, limited by approversNeeded
                                                                    stage.approvers = newValues.slice(0, stage.approversNeeded).map(userId => {
                                                                        const user = state.availableUsers.find(u => u.userId === userId);
                                                                        return {
                                                                            userId,
                                                                            name: user.name,
                                                                            isMandatory: existingApprovers[userId] || false
                                                                        };
                                                                    });
                                                                    
                                                                    newStages[currentStageIndex] = stage;
                                                                    return {
                                                                        ...prevState,
                                                                        approvalStages: newStages
                                                                    };
                                                                })
                                                            }}
                                                            slotProps={{
                                                                listbox: {
                                                                    sx: { width: '100%', maxHeight: '200px', overflow: 'auto' }
                                                                }
                                                            }}
                                                        >
                                                            {state.availableUsers.map((user) => (
                                                                <Option 
                                                                    key={user.userId} 
                                                                    value={user.userId}
                                                                    disabled={state.approvalStages[state.currentStage - 1]?.approvers.filter(a => a.isMandatory).length >= state.approvalStages[state.currentStage - 1]?.requiredApprovers && !state.approvalStages[state.currentStage - 1]?.approvers.find(a => a.userId === user.userId)?.isMandatory}
                                                                >
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                        <Typography>{user.name}</Typography>
                                                                    </Box>
                                                                </Option>
                                                            ))}
                                                        </Select>
                
                                                        {/* Selected Approvers List */}
                                                        {state.approvalStages[state.currentStage - 1]?.approvers.length > 0 ? (
                                                            <Card variant="outlined" sx={{ p: 1.5,maxWidth: '550px',mt:2 }}>
                                                                <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                                    Select Mandatory Approvers:
                                                                </Typography>
                                                                <Stack spacing={1}>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                                                        {state.approvalStages[state.currentStage - 1]?.approvers.map((approver) => (
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
                                                                                        onChange={() => handleMandatoryChange(state.currentStage - 1, approver.userId)}
                                                                                        label="Mandatory"
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
                                                                    value={state.approvalStages[state.currentStage - 1]?.name || ''}
                                                                    onChange={(e) => handleStageNameChange(state.currentStage - 1, e.target.value)}
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
                                        
                                        {state.currentStage === state.numStages ? (
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
                                                Next Stage <NextIcon style={{width:25, height:25}}/>
                                            </Button>
                                        )}
                                    </Stack>

                                    {/* Progress Indicator */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        {[...Array(state.numStages + 1)].map((_, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    backgroundColor: index === state.currentStage ? '#00357A' : '#ccc'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Sheet>
                    </Modal>
                   
                    {/* Modal for editing approval setup */}
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
                                width: 650,
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
                                        Edit Document Approval Setup
                                    </Typography>
                                </Box>

                                <Box sx={{ 
                                    p: 3,
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                }}>
                                    {state.currentStage === 0 ? (
                                        // Initial Setup Content
                                        <Stack spacing={2}>
                                            <Stack direction="row" spacing={2}>
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Document Type</FormLabel>
                                                    <FormControl sx={{ width: "100%" }}>
                                                        <SearchableSelect 
                                                            options={state.docs.map(doc => ({ label: doc.description, value: doc.id.toString() }))}
                                                            onChange={(newValue) => handleInputChange("doc_type", newValue)}
                                                            label="Document Type"
                                                            placeholder="Select Document type"
                                                            initialValue={state.doc_type ? {
                                                                label: state.docs.find(doc => doc.id.toString() === state.doc_type)?.description || '',
                                                                value: state.doc_type
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
                                                            value={state.numStages}
                                                            onChange={(e) => handleNumStagesChange(e.target.value)}
                                                        />
                                                    </FormControl>
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    ) : (
                                        // Stage Setup Content
                                        <Box>
                                            <Typography level="h4" sx={{ mb: 2 }}>
                                                Stage {state.currentStage} of {state.numStages}
                                            </Typography>
                                            
                                            <Card variant="outlined" sx={{ p: 2 }}>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={2}>
                                                        <FormControl sx={{ flex: 1 }}>
                                                                <FormLabel>Stage Description</FormLabel>
                                                                <Input
                                                                    size="sm"
                                                                    placeholder="Enter stage description"
                                                                    value={state.approvalStages[state.currentStage - 1]?.name || ''}
                                                                    onChange={(e) => handleStageNameChange(state.currentStage - 1, e.target.value)}
                                                                />
                                                        </FormControl>
                                                        <FormControl sx={{ flex: 1 }}>
                                                            <FormLabel>Quorum</FormLabel>
                                                            <Input 
                                                                size="sm" 
                                                                type="number"
                                                                placeholder="Select quorum number"
                                                                value={state.approvalStages[state.currentStage - 1]?.quorum || ''}
                                                                onChange={(e) => handleQuorumChange(state.currentStage - 1, e.target.value)}
                                                            />
                                                        </FormControl>
                                                        {/* <FormControl sx={{ flex: 1 }}>
                                                            <FormLabel>Approvers Needed </FormLabel>
                                                            <Input 
                                                                size="sm" 
                                                                type="number"
                                                                placeholder="Select number of approvers needed"
                                                                value={state.approvalStages[state.currentStage - 1]?.approversNeeded || ''}
                                                                onChange={(e) => handleApproversNeededChange(state.currentStage - 1, e.target.value)}
                                                            />
                                                        </FormControl> */}
                                                    </Stack>
                                                </Stack>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={2}>
                                                        {/* <FormControl sx={{ flex: 1 }}>
                                                            <FormLabel>Required Approvers</FormLabel>
                                                            <Input 
                                                                size="sm" 
                                                                type="number"
                                                                placeholder="Select number of required approvers"
                                                                value={state.approvalStages[state.currentStage - 1]?.requiredApprovers || ''}
                                                                onChange={(e) => handleRequiredApproversChange(state.currentStage - 1, e.target.value)}
                                                            />
                                                        </FormControl> */}
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
                                                            sx={{ minWidth: '15rem', mb: 2, maxWidth: '550px' }}
                                                            value={state.approvalStages[state.currentStage - 1]?.approvers?.map(a => a.userId) || []}
                                                            onChange={(e, newValues) => {
                                                                const currentStageIndex = state.currentStage - 1;
                                                                setState(prevState => {
                                                                    const newStages = [...prevState.approvalStages];
                                                                    const stage = {...newStages[currentStageIndex]};
                                                                    
                                                                    // Preserve existing approvers' mandatory status
                                                                    const existingApprovers = stage.approvers?.reduce((acc, curr) => {
                                                                        acc[curr.userId] = curr.isMandatory;
                                                                        return acc;
                                                                    }, {}) || {};
                                                                    
                                                                    // Check if the new selection exceeds the approvers needed
                                                                    if (newValues.length > stage.approversNeeded) {
                                                                        notifyError(`You can only select up to ${stage.approversNeeded} approvers.`);
                                                                        return prevState; // Return the previous state without updating
                                                                    }

                                                                    // Update approvers list with new selections, limited by approversNeeded
                                                                    stage.approvers = newValues.slice(0, stage.approversNeeded).map(userId => {
                                                                        const user = state.availableUsers.find(u => u.userId === userId);
                                                                        return {
                                                                            userId,
                                                                            name: user.name,
                                                                            isMandatory: existingApprovers[userId] || false
                                                                        };
                                                                    });
                                                                    
                                                                    newStages[currentStageIndex] = stage;
                                                                    return {
                                                                        ...prevState,
                                                                        approvalStages: newStages
                                                                    };
                                                                })
                                                            }}
                                                            slotProps={{
                                                                listbox: {
                                                                    sx: { width: '100%', maxHeight: '200px', overflow: 'auto' }
                                                                }
                                                            }}
                                                        >
                                                            {state.availableUsers.map((user) => (
                                                                <Option 
                                                                    key={user.userId} 
                                                                    value={user.userId}
                                                                    disabled={state.approvalStages[state.currentStage - 1]?.approvers.filter(a => a.isMandatory).length >= state.approvalStages[state.currentStage - 1]?.requiredApprovers && !state.approvalStages[state.currentStage - 1]?.approvers.find(a => a.userId === user.userId)?.isMandatory}
                                                                >
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                        <Typography>{user.name}</Typography>
                                                                    </Box>
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                        
                                                        

                                                        {/* Selected Approvers List */}
                                                        {state.approvalStages[state.currentStage - 1]?.approvers.length > 0 ? (
                                                            <Card variant="outlined" sx={{ p: 1.5,maxWidth: '550px',mt:2 }}>
                                                                <Typography level="body-sm" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                                    Select Mandatory Approvers:
                                                                </Typography>
                                                                <Stack spacing={1}>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                                                        {state.approvalStages[state.currentStage - 1]?.approvers.map((approver) => (
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
                                                                                        onChange={() => handleMandatoryChange(state.currentStage - 1, approver.userId)}
                                                                                        label="Mandatory"
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
                                                                    value={state.approvalStages[state.currentStage - 1]?.name || ''}
                                                                    onChange={(e) => handleStageNameChange(state.currentStage - 1, e.target.value)}
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
                                            <PreviousIcon style={{width:25, height:25}}/> Previous
                                        </Button>
                                        
                                        {state.currentStage === state.numStages ? (
                                            <Button
                                                sx={{ backgroundColor: "#00357A" }}
                                                onClick={handleUpdate}
                                                disabled={!validateCurrentStage()}
                                            >
                                               <UpdateIcon style={{width:25, height:25}}/> Update All Stages
                                            </Button>
                                        ) : (
                                            <Button
                                                sx={{ backgroundColor: "#00357A" }}
                                                onClick={handleNext}
                                                disabled={!validateCurrentStage()}
                                            >
                                                Next Stage <NextIcon style={{width:25, height:25}}/>
                                            </Button>
                                        )}
                                    </Stack>

                                    {/* Progress Indicator */}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        {[...Array(state.numStages + 1)].map((_, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '50%',
                                                    backgroundColor: index === state.currentStage ? '#00357A' : '#ccc'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Sheet>
                    </Modal>

                  
                </Box>
            </div>
        </div>
    );
};

export default React.memo(ApprovalSetup);

