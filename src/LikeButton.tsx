import * as React from "react";

export class LikeButton extends React.Component<{}, { liked: boolean }> {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    return this.state.liked ? (
      <span>You liked this.</span>
    ) : (
      <button onClick={() => this.setState({ liked: true })}>Like</button>
    );
  }
}
