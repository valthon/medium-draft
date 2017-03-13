import React, { PropTypes } from 'react';

import { HYPERLINK, NOTE } from '../util/constants';
import StyleButton from './stylebutton';


const InlineToolbar = (props) => {
  if (props.buttons.length < 1) {
    return null;
  }
  const currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="md-RichEditor-controls">
      {props.buttons.map(type => {
        const iconLabel = {};
        if (type.icon) {
          iconLabel.icon = type.icon;
        } else {
          iconLabel.label = type.label;
        }
        if (type.style === HYPERLINK) {
          return (
            <a
              key={type.style}
              className="md-RichEditor-styleButton md-RichEditor-linkButton hint--top"
              href="#open-link-input"
              onClick={props.handleLinkInput}
              aria-label={type.description}
            >
              {type.icon ? <i className={`fa fa-${type.icon}`} /> : type.label}
            </a>
          );
        }
        if (type.style === NOTE) {
          return (
            <a
              key={type.style}
              className="md-RichEditor-styleButton md-RichEditor-noteButton hint--top"
              href="#open-note-input"
              onClick={props.handleNoteInput}
              aria-label={type.description}
            >
              {type.icon ? <i className={`fa fa-${type.icon}`} /> : type.label}
            </a>
          );
        }
        return (
          <StyleButton
            {...iconLabel}
            key={type.style}
            active={currentStyle.has(type.style)}
            onToggle={props.onToggle}
            style={type.style}
            description={type.description}
          />
        );
      })}
    </div>
  );
};

InlineToolbar.propTypes = {
  buttons: PropTypes.array,
  editorState: PropTypes.object.isRequired,
  onToggle: PropTypes.func,
};

export default InlineToolbar;
