import jsTPS_Transaction from "../common/jsTPS.js"


export default class DeleteSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, idx, song) {
        super();
        this.app = initApp;
        this.idx = idx;
        this.song = song;
    }

    doTransaction() {
        //console.log(this.app)
        this.app.deleteSong(this.idx);
    }
    
    undoTransaction() {
        this.app.undoDeleteSong(this.idx, this.song);
    }
}