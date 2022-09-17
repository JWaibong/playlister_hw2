import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false,
            isHover: false,
            currentlyBeingEdited: false,
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
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        console.log(sourceId, targetId)
        this.props.moveCallback(sourceId, targetId);
    }


    handleMouseEnter = (event) => {
        event.preventDefault();
        this.setState(prev => ({
            ...prev,
            isHover: true
        }));
    }

    handleMouseLeave = (event) => {
        event.preventDefault();
        this.setState(prev => ({
            ...prev,
            isHover: false
        }));
    }

    handleDoubleClick = (event) => {
        event.preventDefault();

        /*this.setState(prev=> ({
            ...prev,
            currentlyBeingEdited: true
        }))*/

        this.props.markSongForEditingCallback(this.props.song, this.props.index);
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
        // substring of id starting from index 15
    }



    render() {
        const song = this.props.song;
        const index = this.props.index + 1;

        const {markSongForDeletionCallback} = this.props;

        // many ways to calculte itemClass
        let itemClass = `${this.state.draggedTo? "playlister-song-dragged-to" : "playlister-song"} ${this.state.isHover? "selected-list-card": "unselected-list-card"}`;
        return (
            // WEIRD BUG THAT NEEDED TO BE FIXED.
            // MAKE SURE THE <a> tag and delete button have a way to get the index from their id
            <>
            <div
                id={`song-${index}`}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                onDoubleClick={this.handleDoubleClick}
                draggable="true"
            >
                <div>
                {`${index}.`} <a id={`songlink-${index}`} href={`https://youtube.com/watch?v=${song.youTubeId}`}> {song.title} by {song.artist} </a>
                </div>
                <input id={`songdelete-${index}`} type={"button"} 
                            className={"playlister-button"} value={"✕"}
                            onClick = {() => markSongForDeletionCallback(this.props.index)}
            /> 
            </div>
            </>
        )
    }
}