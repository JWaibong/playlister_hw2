import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction';
import AddSong_Transaction from './transactions/AddSong_Transaction';
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
import DeleteSongModal from './components/DeleteSongModal';

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
            songMarkedForEditing : null,
            songMarkedForDeleting : null,
            songIndexMarkedForDeleting : null,
            listMarkedForRenaming: null,
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
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
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
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
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
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
                keyNamePairs: newKeyNamePairs,
            }
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
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        if (this.state.currentList === null) return;
        this.tps.clearAllTransactions();
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }) 
        //() => {
            // REMOVED BECAUSE I WANT TO CLEAR TRANSACTIONS BEFORE SETTING NEW STATE 
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
         //   this.forceUpdate();}
         );
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
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
            console.log(temp)
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            console.log(temp)
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }

        /*
        let temp = list.songs[end]
        list.songs[end] = list.songs[start]
        list.songs[start] = temp
        */


        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.state.currentList === null) return;
        if (this.tps.hasTransactionToUndo()) {
            //console.log("here")
            this.tps.undoTransaction();
            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.state.currentList === null) return;
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }

    markSongForEditing = (song, index) => {
        //console.log(`${song.title}: ${index}`)
        this.setState(prev => ({
            ...prev,
            songMarkedForEditing: song,
            songIndexMarkedForEditing: index,
        }))
    }

    editMarkedSong = (idx, oldSong, newSong) => {
        if (oldSong.title === newSong.title && oldSong.artist === newSong.artist && oldSong.youTubeId === newSong.youTubeId) {
            return;
        }
        //console.log(newSong)
        //this.state.currentList.songs[idx] = newSong
        let newList = this.state.currentList;
        newList.songs[idx] = newSong;
        this.setState(prev => ({ 
            listKeyPairMarkedForDeletion : prev.listKeyPairMarkedForDeletion,
            currentList : newList,
            sessionData : this.state.sessionData, 
            songMarkedForEditing : null, 
            songIndexMarkedForEditing: null})
            , () => {
                // UPDATING THE LIST IN PERMANENT STORAGE
                // IS AN AFTER EFFECT
                this.db.mutationUpdateList(this.state.currentList);
            }) // make sure to update state after editing
    }

    addEditSongTransaction = (idx, oldSong, newSong) => {
        let transaction = new EditSong_Transaction(this, idx, oldSong, newSong);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
        this.setState(prev => ({...prev, listKeyPairMarkedForDeletion: null}))
    }

    showEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideEditSongModal = ()  => {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
        this.setState(prev => ({...prev, songMarkedForEditing: null, songIndexMarkedForEditing: null}))
    }

    showDeleteSongModal() {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
    }
    hideDeleteSongModal = ()  => {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
        this.setState(prev => ({...prev, songMarkedForDeleting: null, songIndexMarkedForDeleting: null}))
    }

    addDeleteSongTransaction = (idx, song) => {
        
        let transaction = new DeleteSong_Transaction(this, idx, song);
        this.tps.addTransaction(transaction);
    }

    markSongForDeletion = (idx) => {
        const song = this.state.currentList.songs[idx];
        this.setState(prev => ({...prev, songMarkedForDeleting: song, songIndexMarkedForDeleting: idx}));
    }

    deleteSong = (idx) => {
        let newList = this.state.currentList;
        
        newList.songs.splice(idx, 1);
        this.setState(prev => ({ 
            listKeyPairMarkedForDeletion : prev.listKeyPairMarkedForDeletion,
            currentList : newList,
            sessionData : this.state.sessionData, 
            songMarkedForDeleting: null, // this might change 
            songIndexMarkedForDeleting: null, 
        })
        , () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }

    undoDeleteSong = (idx, song) => {
        let newList = this.state.currentList;
        newList.songs.splice(idx, 0, song);
        this.setState(prev => ({ 
            listKeyPairMarkedForDeletion : prev.listKeyPairMarkedForDeletion,
            currentList : newList,
            sessionData : this.state.sessionData, 
            songMarkedForDeleting: null, // this might change 
            songIndexMarkedForDeleting: null, 
        })
        , () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }


    addAddSongTransaction = () => {
        if (this.state.currentList === null) return;
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
    }
    
    addDefaultSong = () => {
        const defaultSong = {
            title: "Untitled",
            artist: "Unknown",
            youTubeId: "dQw4w9WgXcQ"
        }
        let newList = this.state.currentList;
        newList.songs.push(defaultSong);
        this.setState(prev => ({ 
            listKeyPairMarkedForDeletion : prev.listKeyPairMarkedForDeletion,
            currentList : newList,
            sessionData : this.state.sessionData, 
        })
        , () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }

    undoAddDefaultSong = () => {
        let newList = this.state.currentList;
        newList.songs.pop();
        this.setState(prev => ({ 
            listKeyPairMarkedForDeletion : prev.listKeyPairMarkedForDeletion,
            currentList : newList,
            sessionData : this.state.sessionData, 
        })
        , () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });

    }

    handleKeyBoardShortCuts = (e) => {
        //console.log(`${e.ctrlKey}, ${e.keyCode}`);
        if (!e.ctrlKey) {
            return;
        }

        if (e.keyCode === 90) {
            this.undo();
        }
        else if (e.keyCode === 89) {
            this.redo();
        }
    }

    markListForRenaming = (list) => {
        //console.log(list)
        this.setState(prev => ({...prev, listMarkedForRenaming: list}));
    }

    // TODO disable all buttons when editing/deleting/changing playlist name
    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null; // canAddList = !canClose

        if (this.state.listMarkedForRenaming !== null || this.state.listKeyPairMarkedForDeletion !== null || this.state.songMarkedForDeleting !== null || this.state.songMarkedForEditing !== null) {
            canAddSong = false;
            canUndo = false;
            canRedo = false;
            canClose = false;
        }

  
        //console.log(`${canClose}`)
        console.log(this.state.listMarkedForRenaming)

        return (
            <div id="root"
            tabIndex={0}
            onKeyDown={e => this.handleKeyBoardShortCuts(e)}>
                <link href='https://fonts.googleapis.com/css?family=Tangerine' rel='stylesheet'></link>
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddList={!canClose}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    markListForRenaming={this.markListForRenaming}
                    renameListCallback={this.renameList}
                    listMarkedForRenaming={this.state.listMarkedForRenaming}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose}
                    addSongCallBack={this.addAddSongTransaction} 
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    markSongForEditingCallback={this.markSongForEditing} 
                    markSongForDeletionCallback = {this.markSongForDeletion} />

                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    song={this.state.songMarkedForEditing}
                    songIndex={this.state.songIndexMarkedForEditing}
                    hideEditSongModalCallback={this.hideEditSongModal}
                    editSongCallback={this.addEditSongTransaction}
                />
                <DeleteSongModal
                    song={this.state.songMarkedForDeleting}
                    songIndex={this.state.songIndexMarkedForDeleting}
                    hideDeleteSongModalCallback={this.hideDeleteSongModal}   
                    deleteSongCallback={this.addDeleteSongTransaction}
                />
            </div>
        );
    }
}

export default App;
