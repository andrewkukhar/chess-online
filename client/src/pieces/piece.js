// src/pieces/piece.js

export default class Piece {
  constructor(player, iconUrl) {
    this.player = player;
    this.style = {
      backgroundImage: `url('${iconUrl}')`,
      backgroundSize: "85%",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    };
  }

  getPlayer() {
    return this.player;
  }

  /**
   * Optional: Override in subclasses if needed
   */
  isMovePossible(src, dest, squares) {
    return false;
  }

  /**
   * Optional: Override in subclasses if needed
   */
  getSrcToDestPath(src, dest) {
    return [];
  }
}
