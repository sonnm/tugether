/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-unused-state */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';

class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDragging: false,
      // value: props.value
    };
    this.barRef = React.createRef();
  }

  onBarMouseDown = (event) => {
    const value = (
      ((event.clientX - this.barRef.current.offsetLeft) / this.barRef.current.offsetWidth) *
      100
    ).toFixed(2);
    // this.setState({ value });
    const { onChange } = this.props;
    if (typeof onChange === 'function') onChange(value);
  };

  onHandleMouseDown = (event) => {
    event.stopPropagation();
    this.setState({ isDragging: true });
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseUp = (event) => {
    this.setState({ isDragging: false });
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = (event) => {
    event.preventDefault();
    let value = (
      ((event.clientX - this.barRef.current.offsetLeft) / this.barRef.current.offsetWidth) *
      100
    ).toFixed(2);
    value = Math.min(100, Math.max(0, value));
    // this.setState({ value });
    const { onChange } = this.props;
    if (typeof onChange === 'function') onChange(value);
  };

  render() {
    const { isDragging } = this.state;
    const { value } = this.props;
    return (
      <div
        ref={this.barRef}
        className="bg-gray-100 h-1 rounded-full w-full relative cursor-pointer"
        onMouseDown={this.onBarMouseDown}
      >
        <div
          className="h-1 rounded-full bg-gray-400 cursor-pointer"
          style={{ width: `${value}%` }}
        ></div>
        <div
          className="absolute h-4"
          style={{ top: '50%', left: `${value}%` }}
          onMouseDown={this.onHandleMouseDown}
        >
          <div
            className="h-4 w-4 rounded-full bg-gray-400 absolute -ml-2 border-2 border-white"
            style={{ top: '-50%' }}
          ></div>
        </div>
      </div>
    );
  }
}

export default Slider;
