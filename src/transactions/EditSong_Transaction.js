import jsTPS_Transaction from "../common/jsTPS.js"


export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, idx, oldSong, newSong) {
        super();
        this.idx = idx;
        this.app = initApp;
        this.oldSong = oldSong;
        this.newSong = newSong;
    }

    doTransaction() {
        this.app.editMarkedSong(this.idx, this.oldSong, this.newSong);
    }
    
    undoTransaction() {
        this.app.editMarkedSong(this.idx, this.newSong, this.oldSong);
    }
}