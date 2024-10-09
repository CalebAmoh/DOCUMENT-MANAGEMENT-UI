import React, { useState } from "react";
import { FileInput, Label } from "flowbite-react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner"; // Import Spinner component

function DocumentScan({
  selectedFile,
  modalOpened,
  loading,
  handleFileDrop,
  closeModal,
  handleFileChange,
}) {
  console.log("loading:", loading);

  const [pdfBase64, setPdfBase64] = useState("");

  const convertToBase64 = () => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      setPdfBase64(base64data);
    };
    reader.readAsDataURL(selectedFile);

    if (pdfBase64 === "") {
      console.log("DO NOT CLOSE");
    } else {
      console.log("Save:", pdfBase64);
      closeModal();
    }
  };

  // const handleSave = () => {
  //   // Call the function to convert the PDF file to base64
  //   convertToBase64();

  //   console.log("Save:", pdfBase64)
  // };

  return (
    <>
      <div
        className="w-full flex items-center justify-center"
        onDrop={handleFileDrop}
        onDragOver={(event) => event.preventDefault()} // Prevent default behavior for drag and drop
      >
        <Label
          htmlFor="dropzone-file"
          className="w-full flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          style={{ width: "100%"}}
        >
          <div className="w-full flex flex-col items-center justify-center pb-6 pt-5">
            <svg
              className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
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
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF, PNG, JPG (MAX. 800x400px)
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
        show={modalOpened}
        onHide={closeModal}
        title="Selected Document"
        size="lg"
      >
        <Modal.Header closeButton className="flex items-center">
          <img
            src="https://media.licdn.com/dms/image/C4D0BAQFyneLvWM12fg/company-logo_200_200/0/1630474848751?e=2147483647&v=beta&t=MkU6tTOVPg9u5fSNAOmsL0QNwav6jsycqP72-wTjwt0"
            className="h-8 w-8"
            alt=""
            srcset=""
          />
          <Modal.Title>DISPLAY DOCUMENT</Modal.Title>
        </Modal.Header>
        <Modal.Body
        // style={{ minHeight: "500px" }}
        >
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={convertToBase64}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DocumentScan;
