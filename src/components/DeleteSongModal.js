import React, { Component, useEffect, useState } from 'react';

const DeleteSongModal = (props) => {

    const { song, songIndex, hideDeleteSongModalCallback, deleteSongCallback} = props;
    const [title, setTitle] = useState("")

    useEffect(() => {
        if (song !== null) {
            setTitle(song.title);
        }
    },[song])

    const className = `modal${song !== null ? " is-visible" : ""}`; // other ways to do this besides useEffect

    return (
        <div 
            className={className} 
            id="delete-song-modal" 
            data-animation="slideInOutLeft">
                <div className="modal-root" id='verify-delete-song-root'>
                    <div className="modal-north">
                        Remove Song? 
                    </div>
                    <div className="modal-center">
                        <div className="modal-center-content">
                            Are you sure you wish to permanently remove {title} from the playlist?

                        </div>
                    </div>
                    <div className="modal-south">
                        <input type="button" 
                            id="delete-song-confirm-button" 
                            className="modal-button" 
                            onClick={ () => {
                                    deleteSongCallback(songIndex, song)
                                    hideDeleteSongModalCallback()
                                }
                            }
                            value='Confirm' />
                        <input type="button" 
                            id="delete-song-cancel-button" 
                            className="modal-button" 
                            onClick={() => hideDeleteSongModalCallback()}
                            value='Cancel' />
                    </div>
                </div>
        </div>
    );
    
}
export default DeleteSongModal; 