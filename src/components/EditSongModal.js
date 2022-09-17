import React, { useState, useEffect,Component} from 'react';

/*export default class EditSongModal extends Component {

    constructor(props) {
        super(props);
        const {song} = props;
        this.state = {
            title: `${song !== null ? `${song.title}` : ""}`,
            artist: `${song !== null ? `${song.artist}` : ""}`,
            youTubeId: `${song !== null ? `${song.youTubeId}` : ""}`,
        }
    }
    
    setTitle = (title) => {
        this.setState(prev => ({...prev, title}))
    }

    setArtist = (artist) => {
        this.setState(prev => ({...prev, artist}))
    }

    setYouTubeId = (youTubeId) => {
        this.setState(prev => ({...prev, youTubeId}))
    }

    render = () => {
        
    }

}*/
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
    //console.log(`${title}, ${artist}, ${youTubeId}`)

    const className = `modal${song !== null ? " is-visible" : ""}`;



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