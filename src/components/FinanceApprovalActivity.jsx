import React, { useState, useEffect, useCallback } from 'react';
import GeneratedDocsTable from "../components/GeneratedDocsTable"; // Child component for table
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Textarea,CardOverflow,Card,CardContent,AspectRatio} from "@mui/joy";
import { Result,notification,Skeleton } from "antd";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import FinanceApprovalActivityTable from './FinanceApprovalActivityTable';
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { API_SERVER, API_SERVER1, headers,headers_core } from "../constant";
import useAuth from '../hooks/useAuth';
import swal from "sweetalert";

import axios from "axios";
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const FinanceApprovalActivity = () => {

    // Initialize state with an object to track modals
    const [modals, setModals] = useState({
        view: false,
        viewDoc: false,
        approvalDetails: false,
        decline: false,
        approval: false,
        response: false,
    });

    const { user } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    // Initialize notification
    const [api, contextHolder] = notification.useNotification();

    // this handles the state of the component
    const [state, setState] = useState({
        docs: [], // Array to store the generated documents
        modals: null, // Modal type
        selectedDocId: null, // Selected document id
        docNumber: null, // Selected document number
        docTypeId: null, // Selected document type id
        docTypeName: null, // Selected document type name
        branchId: null, // Selected branch id
        requestedAmount: null, // Selected requested amount
        requestedAmount: null, // Selected approved amount
        customerNumber: null, // Selected customer number
        details: null, // Selected details
        docTypes: [], // Array to store the document types
        branches: [], // Array to store the branches
        decline_reason: null, // Decline reason
        success: null, // Success message
        loading : false,
        recommended_amount : "",
        remarks : null,
        db_account: null,
    });

    // the maximum number of characters allowed
    const maxChars = 255;

    // Add a useState hook for tracking the remaining characters
    const [remainingChars, setRemainingChars] = useState(maxChars);
    const [showCustomers, setShowCustomers] = useState(false); // State to manage iframe modal opened
    const [accountDescription, setAccountDescription] = useState("");
    const [loading1, setLoading1] = useState(false);
    const [filter, setFilter] = useState([]);
    const [loading, setLoading] = useState(false); // State to manage loading spinner
    const [selected, setSelected] = useState("");

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
   

    function handleSelected(value) {
        setState((prevState) => ({
            ...prevState,
            customerDesc:value.accountNumber+"-"+value.accountName,
            selectedCustomerNumber:value.accountNumber,
            customerNumber:value.accountNumber,
        }));
        
        setFilter([]);
        setShowCustomers(false);
        // setAccountNumber(value.accountNumber);
        // setAccountNumberFromSearchModal(value.accountNumber);
        // document.getElementById("accNumber11").value = value.accountNumber;
        // setFindById(false);
    }
    
    
    //modal to show customers
    const handleShowCustom = async  () => {
        setShowCustomers(true);
    } 

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

            console.log("user id for approver", user.id);
            const data = {
                userId: user.id,
                role: user.roles
            };

            const response = await axiosPrivate.post(`/get-pending-docs`,data, {withCredentials: true });
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
            const response = await axiosPrivate.get(`/get-parameters`, { withCredentials:true });
            
            const doc_types = response.data.result.doctypes.data;
            const branches = response.data.branches;
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
            const response = await axiosPrivate.get(`/get-doc${docId}`, {
                withCredentials: true,
              });
            const data = response.data.result[0];
            const expense = response.data.expense_details;
            console.log("check what's here",response.data)
            console.log("check what's here for expensse",expense)
            setState((prevState) => ({
                ...prevState,
                docNumber: data.doc_id,
                docTypeId: data.doctype_id,
                docTypeName: data.doctype_name,
                branchId: data.branch,
                requestedAmount: data.requested_amount,
                approvedAmount: data.approved_amount,
                customerNumber: data.customer_no,
                customerDesc:data.customer_desc,
                details: data.details,
                db_account: expense ? expense.account_number : null
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
                userId: user.id,
                recommended_amount: state.recommended_amount,
                requested_amount: state.approvedAmount? state.approvedAmount : state.requestedAmount,
                remarks: state.remarks,
                db_account: state.db_account,
                cr_account: state.customerNumber,
                trans_type: state.docTypeName
            };

            // console.log(data);return;

            const response = await axiosPrivate.post(`/make-transaction`, {data}, {withCredentials: true });
            
            fetchDocs();
            handleClose();
            const notify = openNotification(true);
            notify(response.data.message);
            //clear the approval form
            setState((prevState) => ({
                ...prevState,
                remarks: ""
            }));
        } catch (error) {
            handleClose();
            const notify = openErrorNotification(true);
            notify(error.response.data.message);
            //clear the approval form
            setState((prevState) => ({
                ...prevState,
                remarks: ""
            }));
            console.error("Error:", error);
        }
    }, [state.selectedDocId,state.recommended_amount,state.remarks,state.requestedAmount]);

    //this function is used to handle decline
    const handleDecline = useCallback(async () => {
        try {

            //holds data to be sent to the server
            const data = {
                docId: state.selectedDocId,
                userId: user.id,
                // recommended_amount: state.recommended_amount,
                remarks: state.remarks
            };
            const response = await axios.put(`${API_SERVER1}/reject-doc`, {data}, {headers: headers})
            fetchDocs();
            handleClose();
            handleOpen("response");
            const notify = openNotification(true);
            notify(response.data.message);

            //clear the approval form
            setState((prevState) => ({
                ...prevState,
                remarks: ""
            }));
        } catch (error) {
            handleClose();
            const notify = openErrorNotification(true);
            notify(error.response.data.message);
            //clear the approval form
            setState((prevState) => ({
                ...prevState,
                remarks: ""
            }));
            console.error("Error:", error);
        }
    }, [state.selectedDocId, state.declineReason, state.remarks]);


    


    
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
                    <FinanceApprovalActivityTable data={state.docs} handleOpen={handleOpen} />

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
                                    {state.requestedAmount && (  
                                        <FormControl sx={{ width: "100%" }}>
                                            <FormLabel>Recommended Amount</FormLabel>
                                            <Input
                                                size="sm"
                                                type="text"
                                                value={state.recommended_amount}
                                                placeholder="Enter a recommended Amount"
                                                onChange={(e) => handleInputChange("recommended_amount", e.target.value)} 
                                            />
                                            
                                        </FormControl>)}
                                        
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
                                    {state.requestedAmount && (
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
                                        <FormLabel>Approved Amount</FormLabel>
                                        <Input
                                            size="sm"
                                            type="text"
                                            disabled
                                            sx={{ backgroundColor: "#eaecee" }}
                                            value={state.approvedAmount}
                                            placeholder="Enter requested Amount"
                                            onChange={(newValue) => handleInputChange("requested_amount",newValue)} 
                                        />
                                        </FormControl>

                                       
                                    
                                    </Stack>
                                    )}
                                    {state.requestedAmount && (
                                        <FormControl sx={{ width: "48%" }}>
                                        <FormLabel>Customer number</FormLabel>
                                        {/* <Input
                                            size="sm"
                                            value={state.customerNumber}
                                            placeholder="Enter customer number"
                                            onChange={(newValue) => handleInputChange("customer_no",newValue)}
                                        /> */}
                                        <Stack direction="row" spacing={1}>
                                            <Input
                                            size="sm"
                                            value={state.customerDesc}
                                            placeholder="Enter customer number"
                                            disabled
                                            onChange={(e) => handleInputChange("customer_name",e.target.value)}
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
                                        </FormControl>
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
                                        
                                            <Button size="sm"  sx={{ml:"3px"}} variant="outlined" onClick={() => {handleOpen("decline","");}}>Decline</Button>
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
                            open={modals.decline} onClose={() => handleClose("decline")}
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
                                    Decline Reason
                                    </Typography>
                                </Box>
                                <Divider sx={{ marginBottom: 2 }} />
                                <Stack spacing={4}>
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

                    <Modal
                        open={showCustomers}
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
                                    onClick={handleFind}
                                    buttonWidth={"15%"}
                                    buttonHeight={"30px"}
                                    >Find</Button>
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


                </Box>
            </div>
                )}
        </div>
    );
};

export default React.memo(FinanceApprovalActivity);


