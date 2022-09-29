import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const { canAddSong, canUndo, canRedo, canClose, 
                undoCallback, redoCallback, closeCallback, addSongCallBack} = this.props;
        let addSongClass = `toolbar-button${!canAddSong ? " disabled" : ""}`;
        let undoClass = `toolbar-button${!canUndo ? " disabled" : ""}`;
        let redoClass = `toolbar-button${!canRedo ? " disabled" : ""}`;
        let closeClass = `toolbar-button${!canClose ? " disabled" : ""}`;
        return (
            <div id="edit-toolbar">
            <input 
                type="button" 
                id='add-song-button' 
                value="+" 
                className={addSongClass}
                onClick={addSongCallBack}
                disabled={!canAddSong}
            />
            <input 
                type="button" 
                id='undo-button' 
                value="⟲" 
                className={undoClass} 
                onClick={undoCallback}
                disabled={!canUndo}
            />
            <input 
                type="button" 
                id='redo-button' 
                value="⟳" 
                className={redoClass} 
                onClick={redoCallback}
                disabled={!canRedo}
            />
            <input 
                type="button" 
                id='close-button' 
                value="&#x2715;" 
                className={closeClass} 
                onClick={closeCallback}
                disabled={!canClose}
            />
        </div>
        )
    }
}