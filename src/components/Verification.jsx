import React, { useState, useEffect, useCallback } from 'react';
import GeneratedDocsTable from "../components/GeneratedDocsTable"; // Child component for table
import { Stack, Modal, ModalClose, Sheet, Divider, Typography, Box, CardActions, Button, FormControl,FormLabel
    ,Select,Option,Input,Textarea,CardOverflow
 } from "@mui/joy";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VerificationTable from './VerificationTable';
import { API_SERVER, headers } from "../constant";
import axios from "axios";

const Verification = () => {

    // this handles the state of the component
    const [state, setState] = useState({
        docs: [], // Array to store the generated documents
        modalType: null, // Modal type
        selectedDocId: null, // Selected document id
        docNumber: null, // Selected document number
        docTypeId: null, // Selected document type id
        branchId: null, // Selected branch id
        requestedAmount: null, // Selected requested amount
        customerNumber: null, // Selected customer number
        details: null, // Selected details
        docTypes: [], // Array to store the document types
        branches: [], // Array to store the branches
    });

    //this function is used to close the modal
    const handleOpen = useCallback((action,id) => {
        // Open Modal
        setState((prevState) => ({
            ...prevState,
            modalType: action,
            selectedDocId: id
        }));
        console.log("Open Modal", id);
    }, []);



    //this function is used to close the modal
    const handleClose = useCallback(() => {
        // Close Modal
        setState((prevState) => ({
            ...prevState,
            modalType: null
        }));
    }, []);

    //this function is used to handle input change
    const handleInputChange = useCallback((key, value) => {
        setState((prevState) => ({
            ...prevState,
            [key]: value
        }));
    }, []);

    //this function fetches submitted documents
    const fetchDocs = useCallback(async () => {
        try {
            const response = await axios.get(`${API_SERVER}/get-submitted-docs`, { headers });
            const data = response.data.documents;
            console.log("Data", data);
            setState((prevState) => ({
                ...prevState,
                docs: data
            }));
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);

    //this function fetches document types
    const fetchDocTypes = useCallback(async () => {
        try {
            const response = await axios.get(`${API_SERVER}/get-parameters`, { headers });
            const doc_types = response.data.doc_types;
            const branches = response.data.branches;
            console.log("Data", data);
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
            console.log("Data", data);
            setState((prevState) => ({
                ...prevState,
                docNumber: data.doc_id,
                docTypeId: data.doctype_id,
                branchId: data.branch_id,
                requestedAmount: data.requested_amount,
                customerNumber: data.customer_no,
                details: data.details
            }));
        } catch (error) {
            console.error("Error:", error);
        }
    }, []);


    
    //this useEffect fetches the submitted documents
    useEffect(() => {
        fetchDocs();
        fetchDocTypes();
    }, [fetchDocs, fetchDocTypes]);

    //when the selectedDocId changes, fetch the details of the document
    useEffect(() => {
        if (state.selectedDocId) {
            fetchDocDetails(state.selectedDocId);
        }
    }, [state.selectedDocId, fetchDocDetails]);

    return (
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
                <VerificationTable data={state.docs} handleOpen={handleOpen} />

                {/* Modal for viewing doc details */}
                <Modal
                        aria-labelledby="modal-title"
                        aria-describedby="modal-desc"
                        open={state.modalType === 'view'} onClose={handleClose}
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
                                    <FormControl sx={{ width: "100%" }}>
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
                                    </FormControl>
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
                                <Stack direction="row" spacing={2} sx={{display: "flex",justifyContent: "center"}}>
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
                                    sx={{ height: '40px',marginTop: '20px!important',backgroundColor: "#229954" }}
                                    color="neutral" onClick={() => handleOpen("view-doc")}>
                                    View Document
                                    </Button>
                                </Stack>
                                
                            </Stack>
                                <CardOverflow sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                    <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
                                    
                                    <Button
                                        size="lg"
                                        variant="solid"
                                        sx={{ backgroundColor: "#00357A",marginLeft: "8px" }}
                                        // onClick={() => {
                                        // handleUpdate();
                                        // }}
                                    >
                                        Update
                                    </Button>
                                    </CardActions>
                                </CardOverflow>
                            
                            </Typography>
                    

                        </Sheet>
                </Modal>

                {/* Display document */}
                <Modal
                        aria-labelledby="modal-title"
                        aria-describedby="modal-desc"
                        open={state.modalType === 'view-doc'} onClose={handleClose}
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
    );
};

export default React.memo(Verification);