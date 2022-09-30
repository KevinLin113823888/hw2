import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        if(targetId!==""){
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceId, targetId);
        }
    }
    handleClick = (event) => {
        let num = this.getItemNum();
            this.props.editCallback(this.props.song,this.getItemNum()-1);
           console.log(this.getItemNum()-1);
        
    }
    handleRemoveSong=()=>{
        let num = this.getItemNum();
            this.props.removeCallback(this.props.song,this.getItemNum()-1);
    }
    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

    render() {
        const { song } = this.props;
        let num = this.getItemNum();
        console.log("num: " + num);
        let itemClass = "playlister-song";
        if (this.state.draggedTo) {
            itemClass = "playlister-song-dragged-to";
        }
        return (
            
            <div
                id={'song-' + num}
                className={itemClass}
                onDoubleClick={this.handleClick}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                draggable="true"
            >
               {num}.
               <a href={"https://www.youtube.com/watch?v=" + song.youTubeId}> {song.title} by {song.artist}
               
                </a>
               <input
                    type="button"   
                    id={"remove-song-" + this.props.id.substring("playlist-song-".length)}
                    className="song-card-button"
                    onClick={this.handleRemoveSong}
                    value="&#x2715;" /> 
                
            </div>
           
           
        )
    }
}