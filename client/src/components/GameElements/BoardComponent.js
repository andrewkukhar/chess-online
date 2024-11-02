// src/components/Board.js
import React from "react";
import SquareElement from "./SquareElement";

const BoardComponent = ({ squares, onClick, selectedSquare, lastMove }) => {
  return (
    <div className="board-body">
      {squares?.map((square, index) => {
        const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
        const shade = isLight ? "light-square" : "dark-square";
        const isSelected = index === selectedSquare;
        const isFromSquare = lastMove?.from === index;
        const isToSquare = lastMove?.to === index;

        return (
          <SquareElement
            key={index}
            keyVal={index}
            style={square ? square?.style : null}
            shade={shade}
            onClick={() => onClick(index)}
            isSelected={isSelected}
            isFromSquare={isFromSquare}
            isToSquare={isToSquare}
          />
        );
      })}
    </div>
  );
};

export default BoardComponent;
