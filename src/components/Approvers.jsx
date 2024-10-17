import React, { useState, useEffect } from "react";
import { Alert, Result, List } from "antd"; // Import Alert, Result, and List from antd
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import Stack from "@mui/joy/Stack";
import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete icon
//import edit icon
import EditIcon from "@mui/icons-material/Edit";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import CardActions from "@mui/joy/CardActions";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Card from "@mui/joy/Card";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import axios from "axios";
import {API_SERVER, headers} from "../constant";
// import DeleteIcon from "@mui/icons-material/Delete";

const Approvers = () => {
  const [modalType, setModalType] = useState(null); // 'add' | 'view' | 'update'
  const [selectedRow, setSelectedRow] = useState(null);
  const [formValues, setFormValues] = useState({
    description: "",
    trans_type: "",
    expense_code: "",
    Status: "1",
  });
  const [parameters, setParameters] = useState([]);
  const [showAlert, setShowAlert] = useState(false); // State to manage alert visibility
  const [success, setSuccess] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [parameterId, setParameterId] = useState(null);
  const [codeId, setCodeId] = useState(null);

  const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

  //set the  expense code to empty if the transaction type is not 1
  useEffect(() => {
    if (formValues.trans_type !== "1") {
      handleInputChange("expense_code", null);
    }
  }, [formValues.trans_type]);


  //debounce function to handle input change in the form fields 
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };


  //handles post update request
  const handlePostUpdate = async () => {
    try {
      const response = await axios.put(`${ENDPOINT}/code_creation_details/${parameterId}`, {
        description: formValues.description,
        status: formValues.Status,
        trans_type: formValues.trans_type,
        expense_code: formValues.expense_code,
        id: parameterId
      },{
        headers: headers});
      console.log("Response:", response.data);

      handleOpen('test','result');
      // setSuccessModal(true);
      setSuccess(response.data);
      // console.log(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };


  //fetches parameters
  const fetchParameters = async (description) => {
    console.log("Description:", description);
    try {
      const response = await axios.get(
        ENDPOINT + `/code_creation_details/code_id/${description}`
      ,{
        headers: headers});
      setParameters(response.data.code_details);
      console.log("Parameters:", response.data);
    } catch (error) {
      console.error("Error fetching parameters:", error);
    }
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

  //handles delete request
  const handleDelete = async (id) => {
    try {
      const response = await axios.put(`${ENDPOINT}/code_creation_details/deactivate/${id}`,{},{
        headers: headers});
      console.log("Delete response:", response.data);
      // fetchParameters(formValues.description);
    } catch (error) {
      console.error("Error deleting parameter:", error);
    }
  };

  //handles edit request
  const handleEdit = async (row) => {
    try {

      // Set the parameter ID to the selected row
      // setParameterId(row);

      // Fetch the details of the selected row
      const response = await axios.get(`${ENDPOINT}/code_creation_details/${row}`, {
        headers: headers
      });
      
      // Populate the form with the details of the selected row
      const data = response.data;
      console.log("Data:", data);
      setFormValues({
        description: data.code_detail.code_id, // Map code_id here
        CodeDesc: data.code_detail.description, // Use description correctly
        Status: data.code_detail.status,
      });
      
  
      // Set the mode to "update" and open the modal
      // setUpdateModal(true);

    } catch (error) {
      console.error("Error fetching parameter details:", error);
    }
  };

  const rows = [
    { parameter: "APPROVERS" },
    { parameter: "TEMPORARY APPROVERS" },
    // { parameter: "Approvers", fields: ["User", "Branch", "Document Type","Status"] },
    // {parameter: "Temporary Approvers",fields: ["User", "Document Type", "Status"]},
  ];

  // const rows = [
  //   { parameter: "Document type", fields: ["Description", "Status"] },
  //   { parameter: "Branch", fields: ["Description","Status"] },
  //   // { parameter: "Approvers", fields: ["User", "Branch", "Document Type","Status"] },
  //   // {parameter: "Temporary Approvers",fields: ["User", "Document Type", "Status"]},
  // ];
  
  const codeTypeMapping = {
    "APPOVERS": "1",
    "TEMPORARY APPROVERS": "2",
    // "Approvers": "Approvers",
    // "Temporary Approvers": "TemporaryApprovers",
  };

    /**
   * Handles the opening of a modal based on the provided row and type.
   * 
   * @param {Object} row - The row data that is selected.
   * @param {string} type - The type of action to perform ("add" or other).
   * 
   * If the type is "add", it sets the form values to default and opens the add modal.
   * If the type is not "add", it fetches parameters based on the row's parameter and opens the view modal.
   */
  const handleOpen = (row, type) => {
    console.log("1st row", row.parameter);
    setSelectedRow(row);
    
    setFormValues({
      description: "",
      trans_type: "",
      expense_code: "",
      Status: "1",
    });

    
    if(type === "add") {
      
      if(row.parameter === "APPROVERS"){

        //call the add document type modal
        setModalType('add');

        //fetch the id of the code
        fetchCodeTypes(row.parameter);

      }else if(row.parameter === "TEMPORARY APPOVERS"){

        setFormValues((prevValues) => ({
          ...prevValues,
          trans_type: "0"
        }));

        //call the add branch modal
        setModalType('add_branch');

        //fetch the id of the code
        fetchCodeTypes(row.parameter);


      }
    }else if(type === "view"){
      console.log("3st row", row);
      fetchParameters(codeTypeMapping[row.parameter]);
      setModalType(type);
    }else if(type === "update"){
      
      fetchParameterDetails(row);
     //if the selected row is DOCS
      if(selectedRow.parameter === "DOCS"){
        setModalType('update_docs');
      }else if(selectedRow.parameter === "BRA"){
        setModalType(type);
      }
    } else {
      
      setModalType(type);
    }
  };

  const handleClose = () => setModalType(null);

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

  const handleInputChangeDebounced = debounce(handleInputChange, 300);

  //handles creation of new parameter
  const handleSave = () => {

    // if(selectedRow === "BRA"){
    //   formValues.trans_type=0;
    // }
    
    // Validate form values
    console.log("Form Values:", formValues); // Debug log
    if (!formValues.description || (formValues.trans_type === "1" && !formValues.expense_code)) {
      console.log("Validation failed"); // Debug log
      setShowAlert(true); // Show alert if description is empty or if trans_type is "1" and expense code is empty
      return;
    }
    
    setShowAlert(false); // Hide alert if validation passes
    
    
    //post request to create parameter
    handlePost();
    
    // Reset form values
    setFormValues({
      description: "",
      trans_type: "",
      expense_code: "",
      Status: "1",
    });
  };

  //handles post request
  const handlePost = async () => {
    try {
      const response = await axios.post(ENDPOINT + `/code_creation_details`, {
        description: formValues.description,
        trans_type: formValues.trans_type,
        expense_code: formValues.expense_code,
        status: formValues.Status,
        code_id: codeId
      },{
        headers: headers});
      console.log("Response:", response.data);

      handleOpen('test','result');
      setSuccess(response.data);
      console.log(response);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //handles update of parameter
  const handleUpdate = () => {
    try{
      if (!formValues.description || (formValues.trans_type === "1" && !formValues.expense_code)) {
        console.log("Validation failed"); // Debug log
        setShowAlert(true); // Show alert if description is empty or if trans_type is "1" and expense code is empty
        return;
      }

      //post request to update parameter
      handlePostUpdate();

      setShowAlert(false); // Hide alert if validation passes
      console.log("Form Values:", formValues);

      // setOpen(false);
      setFormValues({
        description: "",
        trans_type: "",
        expense_code: "",
        Status: "1",
      });
    }catch (error) {
      console.error("Error updating parameter:", error);
    }
  };

  return (
    <div>
      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "600px",
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md"></Typography>
            <Typography level="body-sm">
              Manage Approves
            </Typography>
          </Box>
          <Divider />

          {/* Table to display parameters */}
          <Table
            aria-labelledby="tableTitle"
            stickyHeader
            hoverRow
            sx={{
              "--TableCell-headBackground":
                "var(--joy-palette-background-level1)",
              "--Table-headerUnderlineThickness": "1px",
              "--TableRow-hoverBackground":
                "var(--joy-palette-background-level1)",
              "--TableCell-paddingY": "4px",
              "--TableCell-paddingX": "8px",
            }}
          >
            <thead>
              <tr>
                <th style={{ width: "60%", padding: "12px 6px" }}>Parameter</th>
                <th style={{ width: "20%", padding: "12px 6px" }}>Add</th>
                <th style={{ width: "20%", padding: "12px 6px" }}>View</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <Typography level="title-md">{row.parameter}</Typography>
                  </td>
                  <td>
                    <Button
                      sx={{ backgroundColor: "#00357A", width: 30 }}
                      onClick={() => handleOpen(row, "add")}
                      size="sm"
                      variant="solid"
                    >
                      <AddIcon />
                    </Button>
                  </td>
                  <td>
                    <Button
                      sx={{ backgroundColor: "#00357A", width: 30 }}
                      onClick={() => handleOpen(row, "view")}
                      size="sm"
                      variant="solid"
                    >
                      <RemoveRedEyeIcon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

        
          {/* ALL MODALS ARE PLACED HERE*/}

          {/* Add Modal Document Type*/}
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
              {selectedRow && (
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
                            value={formValues.trans_type}
                            onChange={(e, newValue) => handleInputChange("trans_type", newValue)}
                            >
                            <Option value="1">Yes</Option>
                            <Option value="0">No</Option>
                            </Select>
                        </FormControl>

                        <FormLabel>Document Type</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Type of Expense"
                            value={formValues.expense_code}
                            onChange={(e, newValue) => handleInputChange("expense_code", newValue)}
                            >
                            <Option value="">Select Document type</Option>
                            <Option value="1">Donation</Option>
                            <Option value="0">Procument</Option>
                            </Select>
                        </FormControl>
                        
                        
                        <FormLabel>Branch</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Branch"
                            value={formValues.Status}
                            onChange={(e, newValue) =>
                                handleInputChange("Status", newValue)
                            }
                            >
                            <Option value="">Select Branch</Option>
                            <Option value="1">Active</Option>
                            <Option value="0">Inactive</Option>
                            </Select>
                        </FormControl>
                        
                        <FormLabel>Status</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                            <Select
                            placeholder="Select Status"
                            value={formValues.Status}
                            onChange={(e, newValue) =>
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
              )}

            </Sheet>
          </Modal>

          {/* Add Modal Branch */}
          <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'add_branch'} onClose={handleClose}
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
              {selectedRow && (
                <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">
                      Add Branch
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  {/* {showAlert && ( // Conditionally render Alert component
                    <Alert
                      description={`Please enter ${selectedRow?.fields[0]}`}
                      type="error"
                      showIcon
                      style={{ marginBottom: 16 }}
                      closable={true}
                      onClose={() => setShowAlert(false)} // Reset alert state on close
                    />
                  )} */}
                  <Stack spacing={2}>
                    {/* add fields here for the form a description and status */}
                    <Stack spacing={1}>
                      <FormLabel>Description</FormLabel>
                      <FormControl sx={{ width: "100%" }}>
                        <Input
                          size="sm"
                          placeholder="Enter Description"
                          value={formValues.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                        />
                      </FormControl>
                
                      <FormLabel>Status</FormLabel>
                      <FormControl sx={{ width: "100%" }}>
                        <Select
                          placeholder="Select Status"
                          value={formValues.Status}
                          onChange={(e, newValue) => handleInputChange("Status", newValue)}
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
              )}

            </Sheet>
          </Modal>

          {/* Update Branch Modal */}
          <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'update'} onClose={handleClose}
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
              {selectedRow && (
                <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">
                       Update {/*{selectedRow.parameter}*/} Branch 
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  {/* {showAlert && ( // Conditionally render Alert component
                    <Alert
                      description={`Please enter ${selectedRow?.fields[0]}`}
                      type="error"
                      showIcon
                      style={{ marginBottom: 16 }}
                      closable={true}
                      onClose={() => setShowAlert(false)} // Reset alert state on close
                    />
                  )} */}
                  <Stack spacing={2}>
                      <Stack spacing={1}>
                        <FormLabel>Description</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                           
                            <Input
                              size="sm"
                              placeholder={`Enter `}
                              value={formValues.description}
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                            />

                            <FormLabel>Status</FormLabel>
                            <FormControl sx={{ width: "100%" }}>
                              <Select
                                value={formValues.Status}
                                onChange={(e, newValue) => handleInputChange("Status", newValue)}
                                 >
                                <Option value="1">Active</Option>
                                <Option value="0">Inactive</Option>
                              </Select>
                            </FormControl>

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
              )}
            </Sheet>
          </Modal> 

          {/* Update Document type Modal */}
          <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'update_docs'} onClose={handleClose}
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
              {selectedRow && (
                <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">
                       Update {/*{selectedRow.parameter}*/} Document Type 
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  {/* {showAlert && ( // Conditionally render Alert component
                    <Alert
                      description={`Please enter ${selectedRow?.fields[0]}`}
                      type="error"
                      showIcon
                      style={{ marginBottom: 16 }}
                      closable={true}
                      onClose={() => setShowAlert(false)} // Reset alert state on close
                    />
                  )} */}
                  <Stack spacing={2}>
                      <Stack spacing={1}>
                        <FormLabel>Description</FormLabel>
                        <FormControl sx={{ width: "100%" }}>
                           
                            <Input
                              size="sm"
                              placeholder={`Enter `}
                              value={formValues.description}
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                            />

                            <FormLabel>Transaction Document Type</FormLabel>
                            <FormControl sx={{ width: "100%" }}>
                              <Select
                                placeholder="Select Transaction type"
                                value={formValues.trans_type}
                                onChange={(e, newValue) => handleInputChange("trans_type", newValue)}
                              >
                                <Option value="1">Yes</Option>
                                <Option value="0">No</Option>
                              </Select>
                            </FormControl>


                            {formValues.trans_type === "1" && (
                              <FormLabel>Expense code</FormLabel>
                            )}
                            {formValues.trans_type === "1" && (
                              <FormControl sx={{ width: "100%" }}>
                                <Select
                                  value={formValues.expense_code}
                                  onChange={(e, newValue) => handleInputChange("expense_code", newValue)}
                                >
                                  <Option value="1">Donation</Option>
                                  <Option value="0">Procument</Option>
                                </Select>
                              </FormControl>
                            )}

                            <FormLabel>Status</FormLabel>
                            <FormControl sx={{ width: "100%" }}>
                              <Select
                                value={formValues.Status}
                                onChange={(e, newValue) => handleInputChange("Status", newValue)}
                                 >
                                <Option value="1">Active</Option>
                                <Option value="0">Inactive</Option>
                              </Select>
                            </FormControl>

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
              )}
            </Sheet>
          </Modal> 

          {/* View Modal */}
          <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalType === 'view'} onClose={handleClose}
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
              {selectedRow && (
                <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <Typography level="title-md">
                      View Branch Parameters
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  <List
                    pagination={{
                      onChange: (page) => {
                        console.log(page);
                      },
                      pageSize: 3,
                    }}
                    bordered
                    dataSource={parameters}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            sx={{ backgroundColor: "#007bff", width: 35 }}
                            key="delete"
                            type="text"
                            // icon={<DeleteIcon />}
                            onClick={() => handleOpen(item.id,"update")}
                          >
                            <EditIcon />
                          </Button>,<Button
                            sx={{ backgroundColor: "#920505", width: 35 }}
                            key="delete"
                            type="text"
                            // icon={<DeleteIcon />}
                            onClick={() => handleDelete(item.id)}
                          >
                            <DeleteIcon />
                          </Button>
                        ]}
                      >
                        {item.description}
                         {/* - {item.id} */}
                        {/* {item.code_desc} - {item.status}*/}
                      </List.Item>
                    )}
                  />
                </Typography>
              )}
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
                    subTitle="Parameter added successfully"
                  />
                )}
              </Typography>
            </Sheet>
          </Modal>
        </Card>
      </Stack>
    </div>
  );
};

export default Approvers;
