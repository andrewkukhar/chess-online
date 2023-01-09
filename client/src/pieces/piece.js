export default class Piece {
    constructor(player, iconUrl) {
        this.player = player;
        this.style = {
            backgroundImage: "url('" + iconUrl + "')",
            backgroundSize: "85%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",

        };
    }

    getPlayer() {
        return this.player
    }
}