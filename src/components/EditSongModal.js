import React, { Component, startTransition } from 'react';

export default class EditSongModal extends Component {
    constructor(props) {
        super(props);
       
    this.state= {ntitle: '',
        nartist: '',
        nyouTubeId:'',
        otitle: '',
        oartist: '',
        oyouTubeId:''
    }
}
    start(){
        
    console.log(this.state.ntitle);
    }
    onChange=(e)=>this.setState({[e.target.name]:e.target.value});
    onSubmit=(e)=>{
        e.preventDefault();
        //this.props.confirmEditSongCallback(this.state.title);
       this.props.confirmEditSongCallback(this.state.ntitle,this.state.nartist,this.state.nyouTubeId,this.state.otitle,this.state.oartist,this.state.oyouTubeId);
    }
    onCancel=(e)=>{
        e.preventDefault();
        this.setState({ntitle: this.props.song.title,
            nartist: this.props.song.artist,
            nyouTubeId:this.props.song.youTubeId,
            otitle: this.props.song.title,
            oartist: this.props.song.artist,
            oyouTubeId:this.props.song.youTubeId});
        this.props.hideEditListModalCallback();
    }
    setUp=()=>{
        this.setState({ntitle: this.props.song.title,
            nartist: this.props.song.artist,
            nyouTubeId:this.props.song.youTubeId,
            otitle: this.props.song.title,
            oartist: this.props.song.artist,
            oyouTubeId:this.props.song.youTubeId});
    }
    render() {
        const { currentList,songIndex,confirmEditSongCallback,hideEditListModalCallback } = this.props;
        //this.changestate(songIndex);
        
       this.start();
        console.log("hey");
        return (
            <div 
                class="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='edit-list-root'>
                        <div class="modal-north">
                            Edit Song
                        </div>
                            <div id = "model-center-data2" class="modal-center2">
                                <span class = "edit-song-text">Title:</span>
                                <span id = "hey">
                                    <input id = "title-text" type = "text" name = "ntitle" value = {this.state.ntitle} class = "modal-center-right" onChange={this.onChange} />
                                </span>
                                <span class = "edit-song-text">Artist:</span>
                                <span>
                                    <input id = "artist-text" type = "text" name = "nartist" value = {this.state.nartist} class = "modal-center-right" onChange={this.onChange}/>
                                </span>
                                <span class = "edit-song-text">You Tube Id:</span>
                                <span>
                                    <input id = "youtube-text" type = "text" name="nyouTubeId" value = {this.state.nyouTubeId} class = "modal-center-right" onChange={this.onChange}/>
                                </span>
                            </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="edit-song-confirm-button" 
                                class="modal-button" 
                                onClick={this.onSubmit}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-song-cancel-button" 
                                class="modal-button" 
                                onClick={this.onCancel}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}