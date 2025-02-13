import React, { useState, useEffect, useCallback } from 'react';
import GeneratedDocsTable from "../components/GeneratedDocsTable"; // Child component for table
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Textarea,CardOverflow,Card,CardContent,AspectRatio} from "@mui/joy";
import { Result,notification } from "antd";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ApprovalActivityTable from './ApprovalActivityTable';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { API_SERVER, API_SERVER1, headers } from "../constant";

import axios from "axios";

const ApprovalActivity = () => {

    // Initialize state with an object to track modals
    const [modals, setModals] = useState({
        view: false,
        viewDoc: false,
        approvalDetails: false,
        decline: false,
        approval: false,
        response: false,
    });

    // Initialize notification
    const [api, contextHolder] = notification.useNotification();

    // this handles the state of the component
    const [state, setState] = useState({
        docs: [], // Array to store the generated documents
        modals: null, // Modal type
        selectedDocId: null, // Selected document id
        docNumber: null, // Selected document number
        docTypeId: null, // Selected document type id
        branchId: null, // Selected branch id
        requestedAmount: null, // Selected requested amount
        customerNumber: null, // Selected customer number
        details: null, // Selected details
        docTypes: [], // Array to store the document types
        branches: [], // Array to store the branches
        decline_reason: null, // Decline reason
        success: null, // Success message
        loading : false,
        recommended_amount : "",
        remarks : null
    });

    // the maximum number of characters allowed
    const maxChars = 255;

    // Add a useState hook for tracking the remaining characters
    const [remainingChars, setRemainingChars] = useState(maxChars);

    // Add a handler for text changes
    const handleDeclineReasonChange = (value) => {
        console.log(value,"remain")
        setState(prev => ({
            ...prev,
            declineReason: value
        }));
        // Update remaining characters
        setRemainingChars(maxChars - (value?.length || 0));
    };
   
    // Add a handler for remarks changes
    const handleRemarksChange = (value) => {
        if (value.length <= maxChars) {
            console.log(value,"remain");
            setState(prev => ({
                ...prev,
                remarks: value
            }));
            
            // Update remaining characters
            setRemainingChars(maxChars - (value?.length || 0));
        }
    };

    //this function fetches submitted documents
    const fetchDocs = useCallback(async () => {
        try {
            setState((prevState) => ({
                ...prevState,
                loading: true
            }));

            const data = {
                userId: 4,
            };

            const response = await axios.post(`${API_SERVER1}/get-pending-docs`,data, { headers });
            const pending_docs = response.data.documents;
            setState((prevState) => ({
                ...prevState,
                docs: pending_docs,
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

    
    //this function fetches document types
    const fetchDocTypes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_SERVER}/get-parameters`, { headers });
            const doc_types = response.data.doc_types;
            const branches = response.data.branches;
            // console.log("Data", data);
            setState((prevState) => ({
                ...prevState,
                docTypes: doc_types,
                branches: branches
            }));
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);


    //this function fetches details of a document
    const fetchDocDetails = useCallback(async (docId) => {
        try {
            const response = await axios.get(`${API_SERVER}/get-doc/${docId}`, { headers });
            const data = response.data.document;
            setState((prevState) => ({
                ...prevState,
                docNumber: data.doc_id,
                docTypeId: data.doctype_id,
                branchId: data.branch,
                requestedAmount: data.requested_amount,
                customerNumber: data.customer_no,
                details: data.details
            }));
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);


    //handle success notification
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
    
    //handle error notification
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

    // This function is used to handle input change
    const handleInputChange = useCallback((key, value) => {
        setState((prevState) => ({
            ...prevState,
            [key]: value
        }));
    }, []);

    //this function is used to handle verification
    const handleApprove = useCallback(async () => {
        try {

            //holds data to be sent to the server
            const data = {
                docId: state.selectedDocId,
                userId: 4,
                // recommended_amount: state.recommended_amount,
                remarks: state.remarks
            };

            // console.log(data);return;

            const response = await axios.put(`${API_SERVER1}/approve-doc`, {docId:data.docId,userId:data.userId,recommended_amount:data.recommended_amount,remarks:data.remarks}, {headers});
            
            fetchDocs();
            handleClose();
            const notify = openNotification(true);
            notify(response.data.message);
        } catch (error) {
            handleClose();
            const notify = openErrorNotification(true);
            notify(error.response.data.message);

            console.error("Error:", error);
        }
    }, [state.selectedDocId,state.recommended_amount,state.remarks]);

    //this function is used to handle decline
    const handleDecline = useCallback(async () => {
        try {
            const response = await axios.put(`${API_SERVER}/decline-doc/${state.selectedDocId}`, {
                decline_reason: state.declineReason
            }, {headers: headers})
            fetchDocs();
            handleClose();
            handleOpen("response");
            const notify = openNotification(true);
            notify(response.data.message);
        } catch (error) {
            handleClose();
            const notify = openErrorNotification(true);
            notify(error.response.data.message);
            console.error("Error:", error);
        }
    }, [state.selectedDocId, state.declineReason]);


    


    
    //this useEffect fetches the submitted documents
    useEffect(() => {
        fetchDocs();
    }, []);

    //when the selectedDocId changes, fetch the details of the document
    useEffect(() => {
        if (state.selectedDocId) {
            fetchDocDetails(state.selectedDocId);
            fetchDocTypes();
        }
    }, [state.selectedDocId, fetchDocDetails]);

    return (
        <div>
             {/* this is the notification holder */}
            {contextHolder}
            {state.loading ? (
                <div>Loading...</div> // Loading indicator
            ) : (
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
                    </Box>
                    <ApprovalActivityTable data={state.docs} handleOpen={handleOpen} />

                    {/* Modal for viewing doc details */}
                   

                    {/* Display document */}
                    <Modal
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            open={modals.viewDoc} onClose={() => handleClose("viewDoc")}
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
                                maxWidth: '90%',
                                width: "100%",
                                borderRadius: "md",
                                p: 3,
                                boxShadow: "lg",
                            }}
                            >
                            <ModalClose variant="plain" sx={{ m: 1 }} />
                            <Typography id="modal-desc" textColor="text.tertiary">
                                
                                    <iframe
                                    src={`http://10.203.14.169/dms/filesearch-${state.docNumber}`}
                                    width="100%"
                                    height="500px"
                                    title="Document Viewer"
                                    style={{ marginTop: '20px' }}
                                    />

                                
                            </Typography>
                            </Sheet>
                    </Modal>
                 
                    
                    {/* Approval modal */}
                    <Modal
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            open={modals.approvalDetails} onClose={() => handleClose("approvalDetails")}
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
                                maxWidth: '50%',
                                width: "40%",
                                borderRadius: "md",
                                p: 3,
                                boxShadow: "lg",
                            }}
                            >
                            <ModalClose variant="plain" sx={{ m: 1 }} />
                            <Typography id="modal-desc" textColor="text.tertiary">
                                
                                <Box sx={{ mb: 1 }}>
                                    <Typography level="title-md">
                                     Approval
                                    </Typography>
                                </Box>
                                <Divider sx={{ marginBottom: 2 }} />
                                <Stack spacing={4}>
                                    <Stack direction="row" spacing={4}>
                                        {/* <FormControl sx={{ width: "100%" }}>
                                            <FormLabel>Recommended Amount</FormLabel>
                                            <Input
                                                size="sm"
                                                type="text"
                                                value={state.recommended_amount}
                                                placeholder="Enter a recommended Amount"
                                                onChange={(e) => handleInputChange("recommended_amount", e.target.value)} 
                                            />
                                            
                                        </FormControl> */}
                                        
                                    </Stack>
                                    <Stack direction="row" spacing={4}>
                                        <FormControl sx={{ width: "100%" }}>
                                            <FormLabel>Remarks</FormLabel>
                                            <Textarea
                                            color="neutral"
                                            minRows={4}
                                            value={state.remarks}
                                            placeholder="Enter Approval Remarks"
                                            onChange={(e) => handleRemarksChange(e.target.value)}
                                            />
                                            <Typography level="body-sm">
                                            {remainingChars} characters left
                                            </Typography>
                                        </FormControl>
                                    </Stack>
                                    <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            sx={{ backgroundColor: "#00357A" }}
                                            onClick={() => {
                                            handleApprove();
                                            }}
                                        >
                                            Approve
                                        </Button>
                                    </CardActions>
                                </Stack>

                                
                            </Typography>
                            </Sheet>
                    </Modal>

                    {/* Modal for viewing doc details */}
                    <Modal
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            open={modals.view} onClose={() => handleClose("view")}
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
                                            value={state.docTypeId}
                                            disabled
                                            sx={{ backgroundColor: "#eaecee" }}
                                            placeholder="Select Document Type"
                                            onChange={(e, newValue) => handleInputChange("doctype_id",newValue)}
                                        >
                                            {state.docTypes.map((docType) => (
                                            <Option key={docType.id} value={docType.id}>
                                                {docType.description}
                                            </Option>
                                            ))}
                                        </Select>
                                        </FormControl>
                                        {/* <FormControl sx={{ width: "100%" }}>
                                        <FormLabel >Branch</FormLabel>
                                        <Select
                                            size="sm"
                                            disabled
                                            sx={{ backgroundColor: "#eaecee" }}
                                            value={state.branchId}
                                            placeholder="Select Branch"
                                            onChange={(e, newValue) => handleInputChange("branch_id",newValue)}
                                        >
                                            {state.branches.map((branch) => (
                                            <Option key={branch.id} value={branch.id}>
                                                {branch.description}
                                            </Option>
                                            ))}
                                        </Select>
                                        </FormControl> */}
                                        <FormControl sx={{ width: "80%" }}>
                                            <FormLabel >Document Id (Upload file to generate id)</FormLabel>
                                            <Input
                                                size="sm"
                                                value={state.docNumber}
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
                                            onClick={() => handleOpen("viewDoc")}
                                        >
                                            <RemoveRedEyeIcon/>
                                        </Button>
                                    </Stack>
                                    {state.requestedAmount !== null && (
                                    <Stack direction="row" spacing={4}>
                                        <FormControl sx={{ width: "100%" }}>
                                        <FormLabel>Requested Amount</FormLabel>
                                        <Input
                                            size="sm"
                                            type="text"
                                            disabled
                                            sx={{ backgroundColor: "#eaecee" }}
                                            value={state.requestedAmount}
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
                                            value={state.customerNumber}
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
                                            value={state.details}
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
                                                value={state.docNumber}
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
                                            onClick={() => handleOpen("viewDoc")}
                                        >
                                            View Doc
                                        </Button>
                                    </Stack> */}
                                    
                                </Stack>
                                    <CardOverflow sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                        <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                                        
                                            <Button size="sm"  sx={{ml:"3px"}} variant="outlined" onClick={() => {handleOpen("decline",state.selectedDocId);}}>Decline</Button>
                                            <Button
                                                size="sm"
                                                variant="solid"
                                                sx={{ backgroundColor: "#00357A",marginLeft: "8px" }}
                                                onClick={() => {
                                                    handleOpen("approvalDetails","");
                                                }}
                                            >
                                                Approve
                                            </Button>
                                        
                                        </CardActions>
                                    </CardOverflow>
                                
                                </Typography>
                        

                            </Sheet>
                    </Modal>

                  
                    {/* Decline Reason */}
                    <Modal
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            open={modals.decline1} onClose={() => handleClose("decline")}
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
                                maxWidth: '80%',
                                width: "80%",
                                borderRadius: "md",
                                p: 3,
                                boxShadow: "lg",
                            }}
                            >
                            <ModalClose variant="plain" sx={{ m: 1 }} />
                            <Typography id="modal-desc" textColor="text.tertiary">
                                
                                <Box sx={{ mb: 1 }}>
                                    <Typography level="title-md">
                                    Decline Reason
                                    </Typography>
                                </Box>
                                <Divider sx={{ marginBottom: 2 }} />
                                <Stack spacing={4}>
                                    <Stack direction="row" spacing={4}>
                                        <FormControl sx={{ width: "100%" }}>
                                            <FormLabel>Reason</FormLabel>
                                            <Textarea
                                            color="neutral"
                                            minRows={4}
                                            value={state.declineReason || ""}
                                            placeholder="Enter Decline Reason"
                                            onChange={(e) => {
                                                if (e.target.value.length <= maxChars) {
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    declineReason: e.target.value,
                                                }));
                                                handleInputChange("decline_reason", e.target.value);
                                                }
                                            }}
                                            />
                                            <Typography variant="body2">
                                            {maxChars - (state.declineReason?.length || 0)} characters left
                                            </Typography>
                                        </FormControl>
                                    </Stack>
                                    <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                                        <Button
                                            size="sm"
                                            variant="solid"
                                            sx={{ backgroundColor: "#00357A" }}
                                            onClick={() => {
                                            handleDecline();
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    </CardActions>
                                </Stack>

                                
                            </Typography>
                            </Sheet>
                    </Modal>

                    {/* Display document */}
                    <Modal
                            aria-labelledby="modal-title"
                            aria-describedby="modal-desc"
                            open={modals.viewDoc} onClose={() => handleClose("viewDoc")}
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
                                maxWidth: '90%',
                                width: "100%",
                                borderRadius: "md",
                                p: 3,
                                boxShadow: "lg",
                            }}
                            >
                            <ModalClose variant="plain" sx={{ m: 1 }} />
                            <Typography id="modal-desc" textColor="text.tertiary">
                                
                                    <iframe
                                    src={`http://10.203.14.169/dms/filesearch-${state.docNumber}`}
                                    width="100%"
                                    height="500px"
                                    title="Document Viewer"
                                    style={{ marginTop: '20px' }}
                                    />

                                
                            </Typography>
                            </Sheet>
                    </Modal>


                </Box>
            </div>
                )}
        </div>
    );
};

export default React.memo(ApprovalActivity);


