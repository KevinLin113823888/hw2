import jsTPS_Transaction from "../common/jsTPS.js"

export default class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(initModel, otitle,oartist,oyoutubeId) {
        super();
        this.model = initModel;
        this.title = otitle;
        this.artist = oartist;
        this.youtubeId = oyoutubeId;
        
    }

    doTransaction() {
        this.model.removeSong();
    }
    
    undoTransaction() {
        this.model.addSong(this.title,this.artist,this.youtubeId);
    }
}