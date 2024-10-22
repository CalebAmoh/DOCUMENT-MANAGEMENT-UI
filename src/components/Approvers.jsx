import React, { useState, useEffect } from "react";
import { Result } from "antd";
import ApproversTable from "../components/ApproversTable";
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
import FormLabel from "@mui/joy/FormLabel";
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

const Approvers = () => {

  //use state setups
  const [modalType, setModalType] = useState(null); // 'add' | 'view' | 'update'
  const [selectedRow, setSelectedRow] = useState(null);
  const [codeId, setCodeId] = useState(null);
  const [parameterId, setParameterId] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [branches, setBranches] = useState([]); // State to manage branches
  const [docTypes, setDocTypes] = useState([]); // State to manage doc types
  const [users, setUsers] = useState([]); // State to manage users
  const [showAlert, setShowAlert] = useState(false); // State to manage alert visibility
  const [success, setSuccess] = useState(false);
  const [approvers, setApprovers] = useState([]);
  const [formValues, setFormValues] = useState({
    user_id: "",
    doc_type_id: "",
    branch_id: "",
    Status: "1",
  });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_SERVER}/approvers`, { headers });
        setApprovers(response.data.approvers);
        console.log("Approvers:", response.data.approvers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  //handleOpen function
  const handleOpen = (type) => {
    
    // setSelectedRow(row);
    console.log("type", type);

    setFormValues({
      user_id: "",
      doc_type_id: "",
      branch_id: "",
      Status: "1",
    });

    
    if(type === "add") {
        setModalType('add');

        //fetch the id of the code
        // fetchCodeTypes(row.parameter);
    }else {
      console.log("Type:", type);
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
  };


  // to handle closing of the modal
  const handleClose = () => setModalType(null);

  //handles creation of new parameter
  const handleSave = () => {
    
    // Validate form values
    console.log("Form Values:", formValues); // Debug log
    if (!formValues.user_id || !formValues.doc_type_id || !formValues.branch_id || !formValues.Status) {
      console.log("Validation failed"); // Debug log
      setShowAlert(true); // Show alert if description is empty or if trans_type is "1" and expense code is empty
      return;
    }
    
    setShowAlert(false); // Hide alert if validation passes
    
    
    //post request to create parameter
    handlePost();
    
    // Reset form values
    setFormValues({
      user_id: "",
      doc_type_id: "",
      branch_id: "",
      Status: "1",
    });
  };

  //handles post request
  const handlePost = async () => {
    try {
      const response = await axios.post(ENDPOINT + `/approvers`, {
        user_id: formValues.user_id,
        doctype_id: formValues.doc_type_id,
        branch_id: formValues.branch_id,
        status: formValues.Status
      },{
        headers: headers});
      console.log("Response:", response.data);

      handleOpen('result');
      setSuccess(response.data);
      console.log(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const fetchCodeTypes = async (code) => {
    try {
      // this endpoint will get the id of the code
      const response = await axios.get(
            ENDPOINT + `/code_creations/code/${code}`
            ,{
              headers: headers});

      //setCodeId
      setCodeId(response.data.id);

    } catch (error) {
      console.error("Error fetching parameters:", error);
    }
  };

  //fetches parameters
  const fetchApprovers = async (description) => {
    console.log("Description:", description);
    try {
      const response = await axios.get(
        ENDPOINT + `/approvers`
      ,{
        headers: headers});
      setParameters(response.data.approvers);
      console.log("Parameters:", response.data);
    } catch (error) {
      console.error("Error fetching parameters:", error);
    }
  };

  //fetches parameter details
  const codeTypeMapping = {
    "APPROVERS": "1",
    "TEMPORARY APPROVERS": "2",
    // "Approvers": "Approvers",
    // "Temporary Approvers": "TemporaryApprovers",
  };

  //fetches parameter details
  const fetchParameterDetails = async (id) => {
    try {
      const response = await axios.get(`${ENDPOINT}/code_creation_details/${id}`, {
        headers: headers
      });

      const data = response.data;
      console.log("Data:", data);
      setFormValues({
        description: data.code_detail[0].description, // Use description correctly
        trans_type: data.code_detail[0].trans_type,
        expense_code: data.code_detail[0].expense_code,
        Status: data.code_detail[0].status
      });

      //set parameter id
      setParameterId(data.code_detail[0].id);

      console.log("Form Values:", formValues);
    } catch (error) {
      console.error("Error fetching parameter details:", error);
    }
  };
  

  
  return (
    <div>
      {" "}
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
        {/* <Box sx={{ display: "flex", alignItems: "center" }}>
          <Breadcrumbs
            size="sm"
            aria-label="breadcrumbs"
            separator={<ChevronRightRoundedIcon className="text-sm" />}
            sx={{ pl: 0 }}
          >
            <Link
              underline="none"
              color="neutral"
              href="#some-link"
              aria-label="Home"
            >
              <HomeRoundedIcon />
            </Link>
            <Link
              underline="hover"
              color="neutral"
              href="#some-link"
              fontSize={12}
              fontWeight={500}
            >
              Dashboard
            </Link>
            <Typography color="primary" fontWeight={500} fontSize={12}>
              Orders
            </Typography>
          </Breadcrumbs>
        </Box> */}
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
            Approvers
          </Typography>
          <Button
            // color="#00357A"
            sx={{ backgroundColor: "#00357A" }}
            onClick={() => handleOpen("add")}
            startDecorator={<AddIcon />}
            size="md"
          >
            Add Approver
          </Button>
        </Box>
        <ApproversTable  data={approvers}/>

        {/* <OrderList /> */}
      </Box>
      
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
                      Add Approver
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  {/* {showAlert && ( // Conditionally render Alert component
                    // <Alert
                    //   description={`Please enter ${selectedRow?.fields[0]}`}
                    //   type="error"
                    //   showIcon
                    //   style={{ marginBottom: 16 }}
                    //   closable={true}
                    //   onClose={() => setShowAlert(false)} // Reset alert state on close
                    // />
                  )} */}
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

                        <FormLabel>Document Type</FormLabel>
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
                        </FormControl>
                        
                        
                        <FormLabel>Branch</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Branch"
                            value={formValues.branch_id}
                            onChange={(e, newValue) =>
                                handleInputChange("branch_id", newValue)
                            }
                            >
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                {branch.description} 
                                </Option>
                            ))}
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
                {success?.code === "200" && (
                  <Result
                    status="success"
                    title={success?.message || "Operation Successful"}
                    subTitle="approver added successfully"
                  />
                )}
              </Typography>
            </Sheet>
          </Modal>
    </div>
  )
};

export default Approvers;
