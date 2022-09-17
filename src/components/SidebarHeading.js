import React from "react";

export default class SidebarHeading extends React.Component {
    handleClick = (event) => {
        const { createNewListCallback } = this.props;
        createNewListCallback();
    };
    render() {
        const {canAddList} = this.props;
        //console.log(`${canAddList}`)
        let className = "toolbar-button"

        if(!canAddList) {
            className += " disabled"
        }
        
        return (
            <div id="sidebar-heading">
                <input 
                    type="button" 
                    id="add-list-button" 
                    className={className}
                    onClick={this.handleClick}
                    disabled={!canAddList}
                    value="+" />
                Your Playlists
            </div>
        );
    }
}