"use strict";

import { createElement } from "react";
import { render } from "react-dom";
import { LikeButton } from "./LikeButton";

render(
  createElement(LikeButton),
  document.querySelector("#like_button_container")
);
