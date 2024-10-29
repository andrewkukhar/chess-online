// src/components/Board.js
import React from "react";
import SquareElement from "./SquareElement";

const BoardComponent = ({ squares, onClick, selectedSquare }) => {
  return (
    <div className="board-body">
      {squares?.map((square, index) => {
        const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
        const shade = isLight ? "light-square" : "dark-square";
        const isSelected = index === selectedSquare;

        return (
          <SquareElement
            key={index}
            keyVal={index}
            style={square ? square?.style : null}
            shade={shade}
            onClick={() => onClick(index)}
            isSelected={isSelected}
          />
        );
      })}
    </div>
  );
};

export default BoardComponent;
