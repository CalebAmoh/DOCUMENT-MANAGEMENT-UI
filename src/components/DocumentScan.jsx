import React, { useState } from "react";
import { FileInput, Label } from "flowbite-react";
// import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner"; // Import Spinner component
import { Stack,Modal,ModalClose,Sheet,Divider,Typography,Box,CardActions,Button } from "@mui/joy";
// import 'bootstrap/dist/css/bootstrap.min.css';
function DocumentScan({
  selectedFile,
  modalOpened,
  loading,
  handleGenerateDocId,
  handleFileDrop,
  closeModal,
  setModalType,
  handleFileChange
}) {

  const [pdfBase64, setPdfBase64] = useState("");


  //convert document to base 64 and ulpload to generate doc id
  const convertToBase64 = () => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      if (base64data === "") {
        console.log("DO NOT CLOSE");
      } else {
        handleGenerateDocId(base64data);
        closeModal();
        setPdfBase64(base64data);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  
  // const handleSave = () => {
  //   // Call the function to convert the PDF file to base64
  //   convertToBase64();

  //   console.log("Save:", pdfBase64)
  // };

  return (
    <>
      <div
        className="w-full flex items-center justify-center p-4"
        onDrop={handleFileDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <Label
          htmlFor="dropzone-file"
          className="w-full flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 bg-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-300"
          style={{ 
            width: "100%",
            minHeight: "200px",
            height: "auto"
          }}
        >
          <div className="w-full flex flex-col items-center justify-center p-4">
            <svg
              className="mb-2 h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              PDF (MAX. 800x400px)
            </p>
          </div>
          <FileInput
            id="dropzone-file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
        </Label>
      </div>

      

      <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={modalOpened} onClose={closeModal}
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
              margin: {
                xs: '16px',
                sm: '32px',
                md: '15%'
              },
            }}
          >
            <Sheet
              variant="outlined"
              sx={{
                maxWidth: {
                  xs: '100%',
                  sm: '90%',
                  md: 900
                },
                width: "100%",
                borderRadius: "md",
                p: {
                  xs: 2,
                  sm: 3
                },
                boxShadow: "lg",
              }}
            >
              <ModalClose variant="plain" sx={{ m: 1 }} />
              
              <Typography id="modal-desc" textColor="text.tertiary">
                  <Box sx={{ mb: 1 }}>
                    <img src="https://media.licdn.com/dms/image/C4D0BAQFyneLvWM12fg/company-logo_200_200/0/1630474848751?e=2147483647&v=beta&t=MkU6tTOVPg9u5fSNAOmsL0QNwav6jsycqP72-wTjwt0" className="h-6 w-6 sm:h-8 sm:w-8" alt="" srcset=""/>
                    <Typography level="title-md">
                      SCAN DOCUMENT
                    </Typography>
                  </Box>
                  <Divider sx={{ marginBottom: 2 }} />
                  <Stack spacing={2}>
                      {loading ? ( // Show spinner if loading is true
                        <div className="text-center position-relative">
                          <div
                            className="position-fixed top-0 left-0 w-100 h-100 bg-black opacity-50"
                            style={{ zIndex: 1050 }} // Apply higher z-index for overlay
                          />
                          <Spinner
                            animation="border"
                            role="status"
                            className="position-fixed top-50 translate-middle"
                            style={{ zIndex: 1051 }} // Apply higher z-index for spinner
                          >
                            <span className="sr-only">Loading...</span>
                          </Spinner>
                        </div>
                      ) : (
                        selectedFile &&
                        (selectedFile.type.startsWith("image/") ||
                        selectedFile.type === "application/pdf" ||
                        selectedFile.type ===
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                          selectedFile.type.startsWith("image/") ? ( // Check if selected file is an image
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="Selected File"
                              className="max-w-full max-h-full"
                            />
                          ) : (
                            <embed
                              src={URL.createObjectURL(selectedFile)}
                              type={selectedFile.type}
                              // className="min-w-full min-h-full"
                              style={{ height: "500px", width: "100%" }}
                            />
                          )
                        ) : (
                          <p className="text-center">This file type is not supported.</p>
                        ))
                      )}
                  </Stack>
                  <CardActions sx={{ 
                    flexDirection: { 
                      xs: 'column',
                      sm: 'row' 
                    },
                    gap: 1
                  }}>
                  <Button
                    sx={{
                      backgroundColor: "#00357A",
                      color: "#fff",
                      width: { 
                        xs: '100%',
                        sm: '20%' 
                      },
                      marginTop: "4%"
                    }}
                    onClick={convertToBase64}
                  >
                    Scan
                  </Button>
                  <Button
                    sx={{
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      width: { 
                        xs: '100%',
                        sm: '20%' 
                      },
                      marginTop: { 
                        xs: '2%',
                        sm: '4%' 
                      }
                    }}
                    onClick={closeModal}
                  >
                    Close
                  </Button>
                  {/* <Button
                    sx={{
                      backgroundColor: "#f44336", // Red color for cancel button
                      color: "#fff",
                      width: "48%", // Adjust width to fit both buttons in a row
                    }}
                    // onClick={handleCancel} // Add your cancel handler here
                  >
                    Cancel
                  </Button> */}
                  </CardActions>
              </Typography>
            </Sheet>
      </Modal>
    </>
  );
}

export default DocumentScan;
