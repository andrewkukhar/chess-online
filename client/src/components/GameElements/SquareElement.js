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
        width: "100%",
        minWidth: {
          xs: "100%",
        },
        height: "100%",
        backgroundColor: isSelected
          ? "rgba(0, 195, 255, 0.6)"
          : shade === "light-square"
          ? "rgb(195, 238, 237)"
          : "rgb(80, 79, 79)",
        backgroundImage: style?.backgroundImage || "none",
        backgroundSize: {
          xs: "60%",
          sm: "70%",
          md: "85%",
        },
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        transition: "all 0.8s ease-in-out",
        "&:hover": {
          backgroundColor: shade === "light-square" ? "#a8dadc" : "#1d3557",
        },
        boxShadow: isSelected ? "inset 0 0 0 2px #00c3ff" : "none",
        boxSizing: "border-box",
      }}
    ></Button>
  );
};

export default Square;
