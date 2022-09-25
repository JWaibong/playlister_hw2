import React from "react";

export default class ListCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.keyNamePair.name,
            //editActive: false,  // not used anymore
            // might want to change this to be passed down thriough props
            // to enable buttons correctly + make sure you cant rename two lists at the same time

        }
    }
    handleClick = (event) => {
        const {keyNamePair, markListForRenaming} = this.props;
        if (event.detail === 1) {
            this.handleLoadList(event);
        }
        else if (event.detail === 2) {

            markListForRenaming(keyNamePair);

        }
    }
    handleLoadList = (event) => {
        let listKey = event.target.id;
        if (listKey.startsWith("list-card-text-")) {
            listKey = listKey.substring("list-card-text-".length);
        }
        this.props.loadListCallback(listKey);
    }
    handleDeleteList = (event) => {
        event.stopPropagation();
        this.props.deleteListCallback(this.props.keyNamePair);
    }

    /* not used anymore
    handleToggleEdit = (event) => {
        this.props.markListForRenaming();
        this.setState({
            editActive: !this.state.editActive
        });
    }*/
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let key = this.props.keyNamePair.key;
        let textValue = this.state.text;
        console.log("ListCard handleBlur: " + textValue);
        this.props.renameListCallback(key, textValue);
        this.props.markListForRenaming(null);
    }

    render() {
        const { keyNamePair, selected, listMarkedForRenaming } = this.props;

        if (listMarkedForRenaming === keyNamePair) {
            return (
                <input
                    id={"list-" + keyNamePair.name}
                    className='list-card'
                    type='text'
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={keyNamePair.name}
                    autoFocus
                />)
        }
        else {

            let selectClass = "unselected-list-card";
            if (selected) {
                selectClass = "selected-list-card";
            }
            return (
                <div
                    id={keyNamePair.key}
                    key={keyNamePair.key}
                    onClick={this.handleClick}
                    className={'list-card ' + selectClass}>
                    <span
                        id={"list-card-text-" + keyNamePair.key}
                        key={keyNamePair.key}
                        className="list-card-text">
                        {keyNamePair.name}
                    </span>
                    <input
                        type="button"
                        id={"delete-list-" + keyNamePair.key}
                        className="list-card-button"
                        onClick={this.handleDeleteList}
                        value={"🗑"} />
                </div>
            );
        }
    }
}