import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import EditSongModal from './components/EditSongModal';
import EditSong_Transaction from './transactions/EditSong_Transaction';
import RemoveSongModal from './components/RemoveSongModal';
import RemoveSong_Transaction from './transactions/RemoveSong_Transaction';
import AddSong_Transaction from './transactions/AddSong_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            song : {
                title: "",
                artist: "",
                youTubeId: "",
            },
            songIndex: -1,
            hideButtons: 0
        }
        this.ChildElement= React.createRef();
        
    }
    componentDidMount(){
        document.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key === "z") {
              this.undo();
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key === "y") {
              this.redo();
            }
        });
    }
    componentWillUnmount(){
        document.removeEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key === "z") {
                this.undo();
            }
        });
        document.removeEventListener("keydown", (event) => {
            if (event.ctrlKey && event.key === "y") {
                this.redo();
            }
        });
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        if(this.state.currentList === null){
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);
        
        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            },
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
            
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            console.log(newKeyNamePairs);
            console.log("SUHDUDE");
        
            this.db.mutationDeleteList(key);
            console.log(this.state.sessionData.keyNamePairs);
            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.hideDeleteListModal();
        });
    }
    deleteMarkedList = () => {
        
  
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            },
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData,
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData,
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData,
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    addEditSongTransaction=(newTitle,newArtist,newYoutubeId,newInd,oltitle,olartist,olyoutubeId) =>{
        let transaction = new EditSong_Transaction(this,newTitle,newArtist,newYoutubeId,newInd,oltitle,olartist,olyoutubeId);
        this.tps.addTransaction(transaction);
    }
    addRemoveSongTransaction=(oltitle,olartist,olyoutubeId) =>{
        let transaction = new RemoveSong_Transaction(this,oltitle,olartist,olyoutubeId);
        this.tps.addTransaction(transaction);
    }
    addAddSongTransaction =()=>{
        if(this.state.currentList){
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
        }
    } 
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo() && this.state.hideButtons ===0) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : this.state.listKeyPairMarkedForDeletion,
            currentList: this.state.currentList,
            sessionData: this.state.sessionData,
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
        }), () => {
       
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()&& this.state.hideButtons ===0) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : this.state.listKeyPairMarkedForDeletion,
            currentList: this.state.currentList,
            sessionData: this.state.sessionData,
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: this.state.hideButtons
        }), () => {
       
        }); 
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: 1
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    makeChanges=()=>{
        const childelement = this.ChildElement.current;
       // alert("current state of child is :  "+ childelement.state.title);
        childelement.setUp();
    }
    confirmEditSongCallback=(ntitle,nartist,nyoutubeId,otitle,oartist,oyoutubeId)=>{
       
        this.addEditSongTransaction(ntitle,nartist,nyoutubeId,this.state.songIndex,otitle,oartist,oyoutubeId);
        this.hideEditListModal();
    }
    confirmRemoveSongCallback=()=>{
       let list = this.state.currentList;
       let ind = this.state.songIndex;
       let otitle = list.songs[ind].title
       let oartist =  list.songs[ind].artist
       let oyouTubeId =  list.songs[ind].youTubeId
        
        this.addRemoveSongTransaction(otitle,oartist,oyouTubeId);
        this.hideRemoveSongModal();
    }
    editCurrentSong(ntitle,nartist,nyoutubeId,ind){
        let list = this.state.currentList;
        
        list.songs[ind].title=ntitle;
        list.songs[ind].artist=nartist;
        list.songs[ind].youTubeId=nyoutubeId;
        this.setStateWithUpdatedList(list);
    }

    removeSong=()=>{
        let list = this.state.currentList;
        list.songs.splice(this.state.songIndex,1);
        this.setStateWithUpdatedList(list);
    }
    addSong=(ntitle,nartist,nyoutubeId)=>{
        let newsong = {title:ntitle,artist:nartist,youTubeId:nyoutubeId};
        let list = this.state.currentList;
        list.songs.splice(this.state.songIndex,0,newsong);
        this.setStateWithUpdatedList(list);
    }
    addNewSong=()=>{
        if(this.state.currentList){
        let list = this.state.currentList;
        let newsong = {title:"Untitled",artist:"Unknown",youTubeId:"dQw4w9WgXcQ"};
        list.songs.push(newsong);
        this.setStateWithUpdatedList(list);
        }
    }
    removeNewSong=()=>{
        let list = this.state.currentList;
        list.songs.pop();
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showEditSongModal=(song,songIndex)=> {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : this.state.listKeyPairMarkedForDeletion,
            currentList: this.state.currentList,
            sessionData: this.state.sessionData,
            song: song,
            songIndex : songIndex,
            hideButtons: 1
        }), () => {
            this.makeChanges();
            let modal = document.getElementById("edit-song-modal");
            modal.classList.add("is-visible");
            
            
        });
        
        
    }

    showRemoveSongModal=(song,songIndex)=> {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : this.state.listKeyPairMarkedForDeletion,
            currentList: this.state.currentList,
            sessionData: this.state.sessionData,
            song: song,
            songIndex : songIndex,
            hideButtons: 1
        }), () => {
            //this.makeChanges();
            let modal = document.getElementById("remove-song-modal");
            modal.classList.add("is-visible");
            //console.log(this.state.songIndex);
            
        });
        
        
    }
    showbuttons=()=>{
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : this.state.listKeyPairMarkedForDeletion,
            currentList: this.state.currentList,
            sessionData: this.state.sessionData,
            song: this.state.song,
            songIndex : this.state.songIndex,
            hideButtons: 0
        }), () => {
           
            
        });
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideEditListModal=()=> {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.showbuttons();
    }
   

    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal=()=> {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.showbuttons();
    }
    hideRemoveSongModal=()=>{
        let modal = document.getElementById("remove-song-modal");
        modal.classList.remove("is-visible");
        this.showbuttons();
    }
    render() {
        let canAddList = (this.state.currentList === null&& this.state.hideButtons === 0);
        let canAddSong = (this.state.currentList !== null&& this.state.hideButtons === 0);
        let canUndo = (this.tps.hasTransactionToUndo() &&this.state.currentList !== null && this.state.hideButtons === 0);
        let canRedo = (this.tps.hasTransactionToRedo()&&this.state.currentList !== null&& this.state.hideButtons === 0);
        let canClose = (this.state.currentList !== null&& this.state.hideButtons === 0);
        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    canAddList={canAddList}
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addSongCallback={this.addAddSongTransaction}
                />
                <PlaylistCards
                    editSongCallback ={this.showEditSongModal}
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} 
                    removeSongCallback={this.showRemoveSongModal} />
                    
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <RemoveSongModal
                    song={this.state.song}
                    hideRemoveSongModalCallback={this.hideRemoveSongModal}
                    removeSongCallback={this.confirmRemoveSongCallback}
                />
                <EditSongModal
                    currentList={this.state.currentList}
                    song={this.state.song}
                    songIndex={this.state.songIndex}
                    hideEditListModalCallback={this.hideEditListModal}
                    confirmEditSongCallback ={this.confirmEditSongCallback}
                    ref= {this.ChildElement}
                />
            </div>
        );
    }
}

export default App;
