import React, { useState, useEffect} from 'react';

const EditSongModal = (props) => {
    const {song, songIndex, hideEditSongModalCallback, editSongCallback} = props;

    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    const [youTubeId, setYouTubeId] = useState("");
    

    useEffect(() => {
        if (song !== null) {
            setTitle(song.title);
            setArtist(song.artist);
            setYouTubeId(song.youTubeId);
        }
    }, [song])

    const className = `modal${song !== null ? " is-visible" : ""}`;
    // other ways to do this besides useEffect



    return ( 
        // this JSX is HTML taken from my HW1 
    <div className={className} id="edit-song-modal" data-animation="slideInOutLeft">
            <div class="modal-root" id="verify-edit-list-root">
                <div class="modal-north">
                    Edit Song
                </div>
                <div class="modal-edit-center">
                        <div id="edit-title">Title: </div>
                        <div id="edit-artist">Artist: </div>
                        <div id="edit-yt-id"> YouTube Id:</div>
                        <input id="edit-title-input" value={title} onChange={e => {setTitle(e.target.value)}}/>
                        <input id ="edit-artist-input" value={artist} onChange={e => {setArtist(e.target.value)}}/>
                        <input id="edit-yt-id-input" value={youTubeId} onChange={e=> {setYouTubeId(e.target.value)}}/>
                </div>
                <div class="modal-south">
                    <input
                    type="button"
                    id="edit-song-confirm-button"
                    class="modal-button"
                    value="Confirm"
                    onClick={() => {
                        if (song !== null){
                            const newSong = {
                                title,
                                artist, 
                                youTubeId
                            };
                            //console.log(song)
                            editSongCallback(songIndex, song, newSong);
                            hideEditSongModalCallback();
                        }
                    }}
                    />
                    <input
                    type="button"
                    id="edit-song-cancel-button"
                    class="modal-button"
                    value="Cancel"
                    onClick={() => hideEditSongModalCallback()}
                    />
                </div>
        </div>
    </div>
    );
}

export default EditSongModal;