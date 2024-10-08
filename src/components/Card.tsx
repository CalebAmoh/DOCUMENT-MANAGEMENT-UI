import React from "react";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/material/Divider";

interface CardProps {
  title: string;
  spanText: string;
  mainContent: React.ReactNode;
  footerText: string;
}

const Card: React.FC<CardProps> = ({
  title,
  spanText,
  mainContent,
  footerText,
}) => {
  return (
    <div className="bg-[#ffffff] mr-5 mt-5">
      <div className="rounded shadow">
        <div className="px-6 py-4">
          <div className="font-medium text-md mb-2 flex align-center justify-between">
            {title}
            <span className="inline-block bg-gray-200 rounded px-1 py-1 text-sm font-medium text-gray-700">
              {spanText}
            </span>
          </div>
          <Divider />
          <div className="text-gray-700 text-base mt-4">{mainContent}</div>
        </div>
        <div className="px-6 pb-6 text-sm font-thin">{footerText}</div>
      </div>
    </div>
  );
};

export default Card;
