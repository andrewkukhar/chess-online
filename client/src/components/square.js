// src/components/Square.js
import React from "react";
import { Button } from "@mui/material";

const Square = ({ shade, onClick, style, isSelected }) => {
  return (
    <Button
      onClick={onClick}
      sx={{
        margin: 0,
        padding: 0,
        width: "3.5rem",
        minWidth: "4rem",
        height: "3.733rem",
        backgroundColor:
          shade === "light-square" ? "rgb(195, 238, 237)" : "rgb(80, 79, 79)",
        backgroundImage: style?.backgroundImage || "none",
        backgroundSize: {
          xs: "50%",
          sm: "60%",
          md: "90%",
        },
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        "&:hover": {
          backgroundColor: shade === "light-square" ? "#a8dadc" : "#1d3557",
        },
        border: isSelected ? "3px solid #00c3ff" : "none",
        boxSizing: "border-box",
        "@media (max-width:600px)": {
          width: "2.795rem",
          minWidth: "2.795rem",
          height: "2.475rem",
        },
      }}
    ></Button>
  );
};

export default Square;
