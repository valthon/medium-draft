import PropTypes from 'prop-types';
import React from 'react';

import StyleButton from './stylebutton';

export default class SimpleToolbar extends React.Component {
  static propTypes = {
    buttons: PropTypes.array,
    editorState: PropTypes.object.isRequired,
    showDialog: PropTypes.func,
    updateEditorState: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.isActive = this.isActive.bind(this);
  }

  isActive(type) {
    return (type.isActive || this.defaultIsActive)(this.props.editorState, type);
  }

  toggle = (type) => {
    const active = this.isActive(type);
    if (type.dialog) {
      return () => this.props.showDialog(type, active);
    }
    return () => {
      const newState = (type.action || this.defaultAction)(this.props.editorState, active, type);
      if (newState && newState !== this.props.editorState) {
        this.props.updateEditorState(newState);
      }
    };
  }

  defaultAction() {
    return false;
  }

  defaultIsActive() {
    return false;
  }

  divClassName() {
    return 'md-RichEditor-controls';
  }

  render() {
    const { buttons } = this.props;
    if (!buttons || buttons.length < 1) {
      return null;
    }
    return (
      <div className={this.divClassName()} >
        {buttons.map((type) => {
          const iconLabel = {};
          if (type.icon) {
            iconLabel.icon = type.icon;
          } else {
            iconLabel.label = type.label;
          }
          return (
            <StyleButton
              {...iconLabel}
              key={type.style}
              active={!!this.isActive(type)}
              onToggle={this.toggle(type)}
              style={type.style}
              description={type.description}
            />
          );
        })}
      </div>
    );
  }
}
