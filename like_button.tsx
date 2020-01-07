"use strict";

const React = require("react");
const ReactDOM = require("react-dom");

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    return this.state.liked ? (
      "You liked this."
    ) : (
      <button onClick={() => this.setState({ liked: true })}>Like</button>
    );
  }
}

const domContainer = document.querySelector("#like_button_container");
ReactDOM.render(e(LikeButton), domContainer);
