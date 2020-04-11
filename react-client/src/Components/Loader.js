import React, { Component } from "react";
import { css } from "@emotion/core";
import LoaderC from "react-spinners/ClockLoader";

 
// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  position: fixed; /* or absolute */
  top: 50%;
  left: 50%;
  margin: 0 auto;
  background-color: white;
`;
 
class Loader extends Component {
  render() {
    return (
      <div className="sweet-loading">
        <LoaderC
          css={override}
          size={50}
          color={"#123abc"}
          loading={this.props.active}
        />
      </div>
    );
  }
}

export default Loader;