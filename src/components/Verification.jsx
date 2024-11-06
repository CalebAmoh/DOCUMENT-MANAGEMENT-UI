import React from 'react';
import GeneratedDocsTable from "../components/GeneratedDocsTable"; // Child component for table
import { Stack,Modal,ModalClose,Sheet,Divider,Typography,Box,CardActions,Button } from "@mui/joy";
import VerificationTable from './VerificationTable';
const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

const Verification = () => {

    //usestate to handle the verification process
    const[state,setState] = React.useState({
        docs: [] // Array to store the generated documents
    });

    //all functions to handle actions in the verification process
    const handleOpen = (id) => {
        // Open the modal
        console.log("Open Modal", id);
    };

    //fetch all generated documents
    const fetchDocs = async() => {
        try {
            const response = await fetch(`${ENDPOINT}/get-docs`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            console.log("Data", data);
            setState({
                ...state,
                docs: data.data
            });
        } catch (error) {
            console.error("Error:", error);
        }
    };

    //useeffect to fetch all generated documents
    React.useEffect(() => {
        fetchDocs();
    }, []);

    return (
        <div>
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
                
                </Box>
                <VerificationTable  data={state.docs} handleOpen={handleOpen}/>
            </Box>
        </div>
    );
};

export default Verification;