import React, { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Stack from "@mui/joy/Stack";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Typography from "@mui/joy/Typography";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import axios from "axios";
import Input from "@mui/joy/Input";
import dayjs from "dayjs";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import FilterListIcon from "@mui/icons-material/FilterList";
import TableHover from "../components/tableStatus";

// import Result from "@mui/joy/Result";
import { Alert, Result } from "antd";
// require("dotenv").config();

const Renewal = () => {
  const [bankNames, setBankNames] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [bankId, setBankId] = useState("");
  const [details, setDetails] = useState({});
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [notificationDate, setNotificationDate] = useState("");
  const [selectedNotificationFreq, setSelectedNotificationFreq] = useState("");

  // require("dotenv").config();
  const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
  console.log(ENDPOINT);

  function frontendDate(dateString) {
    const originalDate = new Date(dateString);

    // Check if the date is valid
    if (isNaN(originalDate?.getTime())) {
      return ""; // Return empty string for invalid dates
    }

    const day = ("0" + originalDate.getDate())?.slice(-2); // Ensures leading zero if needed
    const month = ("0" + (originalDate.getMonth() + 1))?.slice(-2); // Adding leading zero if needed
    const year = originalDate.getFullYear();

    const formattedDate = `${year}-${month}-${day}`;
    console.log(formattedDate);
    return formattedDate.toUpperCase();
  }

  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const response = await axios.get(ENDPOINT + "/get-licensed-banks");
        setBankNames(response.data.message);
        console.log("Bank names:", response.data.message);
      } catch (error) {
        console.error("Error fetching bank names:", error);
      }
    };

    fetchBankNames();
  }, []);

  // const handleSave = async () => {
  //   const formData = {
  //     bank_id: bankId,
  //     license_type_id: details.license_type_id,
  //     license_frequency_id: details.license_frequency_id,
  //     start_date: details.start_date,
  //     end_date: endDate,
  //     notification_start: notificationDate,
  //     notification_frequency_id: details.notification_frequency_id,
  //     grace_period: details.grace_period,
  //   };
  //   try {
  //     const response = await axios.post(
  //       "http://10.203.14.73:3000/v1/api/license/reactivate-license",
  //       formData
  //     );
  //     console.log("Save response:", response);
  //     console.log("Saved details:", formData);
  //     setResponse(response);
  //     // Add any additional handling for success (e.g., displaying a success message)
  //   } catch (error) {
  //     console.error("Error saving details:", error);
  //     console.log("Error details:", formData);
  //     setError(error);
  //     setResponse(null);

  //     // Add any additional handling for error (e.g., displaying an error message)
  //   }
  // };

  const handleSave = async () => {
    const formData = {
      bank_id: bankId,
      bank_desc: details.bank_desc,
      license_type_id: details.license_type_id,
      license_type_desc: details.license_type,
      license_frequency_id: details.license_frequency_id,
      license_frequency_desc: details.license_frequency,
      start_date: details.start_date,
      end_date: endDate,
      notification_start: notificationDate,
      notification_frequency_id: details.notification_frequency_id,
      notification_frequency_desc: selectedNotificationFreq,
      grace_period: details.grace_period,
    };
    try {
      const response = await axios.post(
        ENDPOINT + "/reactivate-license",
        formData
      );
      console.log("Save response:", response);
      console.log("Saved details:", formData);
      setResponse(response);
      const content = response.data.data;

      // Create a Blob with the string content
      const blob = new Blob([content], { type: "text/plain" });

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "license.txt";

      // Append anchor to the document and click to trigger download
      document.body.appendChild(a);
      a.click();

      // Clean up: Remove the anchor from the document and revoke the Blob URL
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // // Clear form upon successful save
      // if (response.status === 200) {
      //   setSelectedBank("");
      // }

      // if (response.data.code === "200") {
      //   setSelectedBank("");
      //   setBankId("");
      // }

      // Add any additional handling for success (e.g., displaying a success message)
    } catch (error) {
      console.error("Error saving details:", error);
      console.log("Error details:", formData);
      setError(error);
      setResponse(null);

      // Add any additional handling for error (e.g., displaying an error message)
    }
  };

  const handleBankChange = (event, newValue) => {
    setSelectedBank(newValue);
    const selectedBankName = bankNames.find(
      (bank) => bank.bank_id === newValue
    )?.bank_id;
    setBankId(selectedBankName);
    console.log("Selected bank name:", selectedBankName);
  };

  const fetchDetails = async () => {
    try {
      const response = await axios.post(ENDPOINT + "/get-bank-details", {
        bank_id: bankId,
      });
      console.log("Response:", response.data);
      setDetails(response.data.message[0]);
      setEndDate(
        calculateEndDate(
          response.data.message[0].end_date,
          response.data.message[0].license_frequency
        )
      );
      setNotificationDate(
        calculateNotificationDate(
          response.data.message[0].notification_start,
          response.data.message[0].license_frequency
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [bankId]);

  const calculateEndDate = (startDate, frequency) => {
    const start = dayjs(startDate);
    let end;
    switch (frequency) {
      case "Monthly":
        end = start.add(1, "month");
        break;
      case "Quarterly":
        end = start.add(3, "month");
        break;
      case "Semiannually":
        end = start.add(6, "month");
        break;
      case "Annually":
        end = start.add(1, "year");
        break;
      default:
        end = start;
    }
    return end.format("YYYY-MM-DD");
  };

  const calculateNotificationDate = (notification_start, frequency) => {
    const start = dayjs(notification_start);
    let end;
    switch (frequency) {
      case "Monthly":
        end = start.add(1, "month");
        break;
      case "Quarterly":
        end = start.add(3, "month");
        break;
      case "Semiannually":
        end = start.add(6, "month");
        break;
      case "Annually":
        end = start.add(1, "year");
        break;
      default:
        end = start;
    }
    return end.format("YYYY-MM-DD");
  };

  const calculateNotificationFrequency = (
    startDate,
    endDate,
    notificationStart
  ) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const notification = dayjs(notificationStart);

    const totalDays = end.diff(start, "day");
    const notificationDays = end.diff(notification, "day");

    if (notificationDays <= 14) {
      return "Daily";
    } else if (notificationDays <= 60) {
      return "Weekly";
    } else {
      return "Monthly";
    }
  };

  useEffect(() => {
    setSelectedNotificationFreq(
      calculateNotificationFrequency(
        details.startDate,
        endDate,
        notificationDate
      )
    );
  }, [details.startDate, endDate, notificationDate]);
  return (
    <div>
      <div>
        <Stack
          spacing={4}
          sx={{
            display: "flex",
            maxWidth: "800px",
            mx: "auto",
            px: { xs: 2, md: 6 },
            py: { xs: 2, md: 3 },
          }}
        >
          <div className=" bg-[#ffffff] mr-5">
              <div className=" rounded  shadow">
                <div className="px-6 py-4">
                  <div className="font-bold text-sm mb-2 flex align-center justify-between">
                    Document Approval Status
                    <span className="inline-block bg-gray-200 rounded px-2 py-1 text-sm font-medium text-gray-700">
                      {<FilterListIcon />}Filter
                    </span>
                  </div>
                  <Divider />
                  <div className="w-full">
                    <TableHover />
                  </div>
                </div>
              </div>
            </div>
        </Stack>
      </div>
    </div>
  );
};

export default Renewal;
