import PropTypes from 'prop-types';
// import './toolbar.scss';

import React from 'react';
import ReactDOM from 'react-dom';

import {
  EditorState,
  RichUtils,
} from 'draft-js';

import SimpleToolbar from './simpletoolbar';
import BlockToolbar from './blocktoolbar';
import InlineToolbar from './inlinetoolbar';

import { getSelection, getSelectionRect } from '../util/index';
import { getCurrentBlock } from '../model/index';
import { Entity, HYPERLINK } from '../util/constants';

const overlap = (a1, a2, b1, b2) => (a2 >= b1 && a1 <= b2);

export default class Toolbar extends React.Component {

  static propTypes = {
    editorEnabled: PropTypes.bool,
    editorState: PropTypes.object,
    updateEditorState: PropTypes.func,
    inlineButtons: PropTypes.arrayOf(PropTypes.object),
    blockButtons: PropTypes.arrayOf(PropTypes.object),
    customButtons: PropTypes.arrayOf(PropTypes.object),
    editorNode: PropTypes.object,
    focus: PropTypes.func,
    maxOverhang: PropTypes.number,
  };

  static defaultProps = {
    blockButtons: BLOCK_BUTTONS,
    inlineButtons: INLINE_BUTTONS,
    customButtons: CUSTOM_BUTTONS,
  };

  constructor(props) {
    super(props);
    this.state = {
      showInput: false,
      inputValue: '',
    };

    this.onChangeInput = this.onChangeInput.bind(this);
    this.hideInput = this.hideInput.bind(this);
    this.showDialog = this.showDialog.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { editorState } = newProps;
    if (!newProps.editorEnabled) {
      return;
    }
    const selectionState = editorState.getSelection();
    if (selectionState.isCollapsed()) {
      if (this.state.showInput) {
        this.setState({
          showURLInput: false,
          urlInputValue: '',
        });
      }
    }
  }

  // shouldComponentUpdate(newProps, newState) {
  //   console.log(newState, this.state);
  //   if (newState.showURLInput !== this.state.showURLInput && newState.urlInputValue !== this.state.urlInputValue) {
  //     return true;
  //   }
  //   return false;
  // }

  componentDidUpdate() {
    // eslint-disable-next-line react/no-find-dom-node
    const toolbarNode = this._toolbarNode;
    const selectionState = this.props.editorState.getSelection();

    if (selectionState.isCollapsed()) {
      toolbarNode.style.cssText = '';
    }

    if (!this.props.editorEnabled || this.state.showInput) {
      return;
    }
    if (selectionState.isCollapsed()) {
      return;
    }
    const maxOverhang = this.props.maxOverhang;
    // eslint-disable-next-line no-undef
    const nativeSelection = getSelection(window);
    if (!nativeSelection.rangeCount) {
      return;
    }
    const selectionBoundary = getSelectionRect(nativeSelection);
    const toolbarBoundary = toolbarNode.getBoundingClientRect();

    // eslint-disable-next-line react/no-find-dom-node
    const parent = ReactDOM.findDOMNode(this.props.editorNode);
    const parentBoundary = parent.getBoundingClientRect();

    /*
    * Main logic for setting the toolbar position.
    */

    toolbarNode.style.top =
      `${(selectionBoundary.top - parentBoundary.top - toolbarBoundary.height - 5)}px`;
    // toolbarNode.style.width = `${toolbarBoundary.width}px`;
    const widthDiff = selectionBoundary.width - toolbarBoundary.width;
    if (widthDiff >= 0) {
      toolbarNode.style.left =
        `${(selectionBoundary.left - parentBoundary.left) + (widthDiff / 2)}px`;
    } else {
      let left = (selectionBoundary.left - parentBoundary.left);
      left += (widthDiff / 2);
      const initialLeft = left;

      if ((left + toolbarBoundary.width) > (parentBoundary.width + maxOverhang)) {
        left = (parentBoundary.width - toolbarBoundary.width) + maxOverhang;
      }
      if (left < -maxOverhang) left = -maxOverhang;
      toolbarNode.style.left = `${left}px`;

      let arrowLeft = (initialLeft - left) + (toolbarBoundary.width / 2);
      if (arrowLeft < 9) arrowLeft = 9;
      if (arrowLeft > (toolbarBoundary.width - 9)) arrowLeft = toolbarBoundary.width - 9;
      this._arrowNode.style.left = `${arrowLeft}px`;
    }
  }

  onChangeInput(e) {
    this.setState({
      inputValue: e.target.value,
    });
  }

  hideInput(e = null) {
    if (e !== null) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.setState({
      showInput: false,
      inputValue: '',
      inputSubject: undefined,
    }, this.props.focus
    );
  }

  showDialog(type, initialValue) {
    let showInput;
    switch (typeof type.dialog) {
      case 'function':
        showInput = type.dialog;
        break;
      case 'string':
        showInput = (isOpen, value) => this.renderInputDialog(isOpen, type.action, value);
        break;
      default:
        showInput = () => type.dialog;
        break;
    }
    this.setState({
      showInput,
      inputValue: initialValue,
    }, () => {
      setTimeout(() => {
        this.input.focus();
        this.input.select();
      }, 0);
    });
  }

  generateOnKeyDown = (action) => (e) => {
    if (e.which === 13) {
      e.preventDefault();
      e.stopPropagation();
      const newState = action(this.props.editorState, this.state.inputValue);
      if (newState && newState !== this.props.editorState) {
        this.props.updateEditorState(newState);
      }
      this.hideInput();
    } else if (e.which === 27) {
      this.hideInput();
    }
  };

  renderInputDialog(isOpen, action, value) {
    const className = `md-editor-toolbar${(isOpen ? ' md-editor-toolbar--isopen' : '')} md-editor-toolbar--linkinput`;
    const onKeyDown = this.generateOnKeyDown(action);
    return (
      <div
        className={className}
      >
        <div
          className="md-RichEditor-controls md-RichEditor-show-link-input"
          style={{ display: 'block' }}
        >
          <span className="md-url-input-close" onMouseDown={this.hideInput}>&times;</span>
          <input
            ref={node => { this.input = node; }}
            type="text"
            className="md-url-input"
            onKeyDown={onKeyDown}
            onChange={this.onChangeInput}
            placeholder="Press ENTER or ESC"
            value={value || ''}
          />
        </div>
      </div>
    );
  }

  render() {
    const { editorState, editorEnabled } = this.props;
    const { showInput, inputValue } = this.state;
    const isOpen = editorEnabled && !editorState.getSelection().isCollapsed();

    if (showInput) {
      return showInput(isOpen, inputValue);
    }

    return (
      <div
        className={`md-editor-toolbar${(isOpen ? ' md-editor-toolbar--isopen' : '')}`}
        ref={(node) => { this._toolbarNode = node; }}
      >
        {this.props.inlineButtons.length > 0 ? (
          <InlineToolbar
            editorState={editorState}
            buttons={this.props.inlineButtons}
            showDialog={this.showDialog}
            updateEditorState={this.props.updateEditorState}
          />
        ) : null}
        <div className="md-editor-toolbar--arrow" ref={(node) => { this._arrowNode = node; }} />
        {this.props.blockButtons.length > 0 ? (
          <BlockToolbar
            editorState={editorState}
            buttons={this.props.blockButtons}
            showDialog={this.showDialog}
            updateEditorState={this.props.updateEditorState}
          />
        ) : null}
        <SimpleToolbar
          editorState={editorState}
          buttons={this.props.customButtons}
          showDialog={this.showDialog}
          updateEditorState={this.props.updateEditorState}
        />
      </div>
    );
  }
}

export const BLOCK_BUTTONS = [
  {
    label: 'H1',
    style: 'header-one',
    // icon: 'header',
    description: 'Heading 1',
  },
  {
    label: 'H2',
    style: 'header-two',
    // icon: 'header',
    description: 'Heading 2',
  },
  {
    label: 'H3',
    style: 'header-three',
    icon: 'header',
    description: 'Heading 3',
  },
  {
    label: (
      <svg width="10.83" height="10" viewBox="0 0 13 12">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-357.000000, -255.000000)" fill="#FFFFFF">
            <g transform="translate(260.000000, 165.000000)">
              <g transform="translate(0.000000, 75.000000)">
                <g transform="translate(19.000000, 0.000000)">
                  <path d="M90.500768,15 L91,15.56 C88.9631235,17.0533408 87.9447005,18.666658 87.9447005,20.4 C87.9447005,21.8800074 88.75012,23.1466614 90.3609831,24.2 L87.5453149,27 C85.9211388,25.7866606 85.109063,24.346675 85.109063,22.68 C85.109063,20.3199882 86.90628,17.7600138 90.500768,15 Z M83.3917051,15 L83.890937,15.56 C81.8540605,17.0533408 80.8356375,18.666658 80.8356375,20.4 C80.8356375,21.8800074 81.6344006,23.1466614 83.2319508,24.2 L80.4362519,27 C78.8120759,25.7866606 78,24.346675 78,22.68 C78,20.3199882 79.7972171,17.7600138 83.3917051,15 Z" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    ),
    style: 'blockquote',
    icon: 'quote-right',
    description: 'Blockquote',
  },
  {
    label: 'UL',
    style: 'unordered-list-item',
    icon: 'list-ul',
    description: 'Unordered List',
  },
  {
    label: 'OL',
    style: 'ordered-list-item',
    icon: 'list-ol',
    description: 'Ordered List',
  },
];

export const INLINE_BUTTONS = [
  {
    label: 'B',
    style: 'BOLD',
    icon: 'bold',
    description: 'Bold',
  },
  {
    label: 'I',
    style: 'ITALIC',
    icon: 'italic',
    description: 'Italic',
  },
  {
    label: 'U',
    style: 'UNDERLINE',
    icon: 'underline',
    description: 'Underline',
  },
  {
    label: 'Hi',
    style: 'HIGHLIGHT',
    description: 'Highlight selection',
  },
  {
    label: (
      <svg width="20" height="15" viewBox="0 0 14 14">
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g transform="translate(-468.000000, -254.000000)" stroke="#FFFFFF">
            <g transform="translate(260.000000, 165.000000)">
              <g transform="translate(0.000000, 75.000000)">
                <g transform="translate(19.000000, 0.000000)">
                  <g transform="translate(196.424621, 21.424621) rotate(45.000000) translate(-196.424621, -21.424621) translate(193.424621, 13.924621)">
                    <path d="M0.5,5.69098301 L0.5,2 C0.5,1.82069363 0.550664909,1.51670417 0.697213595,1.2236068 C0.927818928,0.762396132 1.32141313,0.5 2,0.5 L4,0.5 C4.67858687,0.5 5.07218107,0.762396132 5.3027864,1.2236068 C5.44933509,1.51670417 5.5,1.82069363 5.5,2 L5.5,6 C5.5,6.67858687 5.23760387,7.07218107 4.7763932,7.3027864 C4.53586606,7.42304998 4.28800365,7.47874077 4.1077327,7.49484936 L0.5,5.69098301 Z" />
                    <path d="M0.5,12.690983 L0.5,9 C0.5,8.82069363 0.550664909,8.51670417 0.697213595,8.2236068 C0.927818928,7.76239613 1.32141313,7.5 2,7.5 L4,7.5 C4.67858687,7.5 5.07218107,7.76239613 5.3027864,8.2236068 C5.44933509,8.51670417 5.5,8.82069363 5.5,9 L5.5,13 C5.5,13.6785869 5.23760387,14.0721811 4.7763932,14.3027864 C4.53586606,14.42305 4.28800365,14.4787408 4.1077327,14.4948494 L0.5,12.690983 Z" transform="translate(3.000000, 11.000000) scale(-1, -1) translate(-3.000000, -11.000000) " />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    ),
    style: HYPERLINK,
    icon: 'link',
    description: 'Add a link',
    isActive: (editorState) => {
      const selection = editorState.getSelection();
      if (selection.isCollapsed()) {
        return undefined;
      }
      const currentBlock = getCurrentBlock(editorState);
      let selectedEntity = '';
      let selStart = selection.getAnchorOffset();
      let selEnd = selection.getFocusOffset();
      if (selection.getIsBackward()) {
        selStart = selection.getFocusOffset();
        selEnd = selection.getAnchorOffset();
      }
      let linkFound = false;
      currentBlock.findEntityRanges((character) => {
        const entityKey = character.getEntity();
        selectedEntity = entityKey;
        return entityKey !== null && editorState.getCurrentContent().getEntity(entityKey).getType() === Entity.LINK;
      }, (start, end) => {
        if (overlap(start, end, selStart, selEnd)) {
          linkFound = editorState.getCurrentContent().getEntity(selectedEntity).getData();
        }
      });
      return linkFound.url;
    },
    dialog: 'url',
    action: (editorState, dialogValue) => {
      const url = dialogValue; // TODO improve this...
      const selection = editorState.getSelection();
      const content = editorState.getCurrentContent();
      let entityKey = null;
      let newUrl = url;
      let newEditorState = editorState;
      if (url !== '') {
        if (url.indexOf('http') === -1) {
          if (url.indexOf('@') >= 0) {
            newUrl = `mailto:${newUrl}`;
          } else {
            newUrl = `http://${newUrl}`;
          }
        }
        const contentWithEntity = content.createEntity(Entity.LINK, 'MUTABLE', { url: newUrl });
        newEditorState = EditorState.push(editorState, contentWithEntity, 'create-entity');
        entityKey = contentWithEntity.getLastCreatedEntityKey();
      }
      return RichUtils.toggleLink(newEditorState, selection, entityKey);
    },
  },
];

export const CUSTOM_BUTTONS = [];

