// import './toolbar.scss';

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import BlockToolbar from './blocktoolbar';
import InlineToolbar from './inlinetoolbar';

import { getSelection, getSelectionRect } from '../util/index';
import { getCurrentBlock } from '../model/index';
import { Entity, HYPERLINK, NOTE } from '../util/constants';

export const NOTE_BUTTON = {
  label: '!',
  style: NOTE,
  icon: 'commenting-o',
  description: 'Make a note',
};

export default class Toolbar extends React.Component {

  static propTypes = {
    editorEnabled: PropTypes.bool,
    editorState: PropTypes.object,
    toggleBlockType: PropTypes.func,
    toggleInlineStyle: PropTypes.func,
    inlineButtons: PropTypes.arrayOf(PropTypes.object),
    blockButtons: PropTypes.arrayOf(PropTypes.object),
    editorNode: PropTypes.object,
    setLink: PropTypes.func,
    setNote: PropTypes.func,
    focus: PropTypes.func,
    maxOverhang: PropTypes.number,
  };

  static defaultProps = {
    blockButtons: BLOCK_BUTTONS,
    inlineButtons: INLINE_BUTTONS,
  };

  constructor(props) {
    super(props);
    this.state = {
      showURLInput: false,
      urlInputValue: '',
      showNoteInput: false,
      noteInputValue: '',
    };

    this.onKeyDownUrl = this.onKeyDownUrl.bind(this);
    this.onKeyDownNote = this.onKeyDownNote.bind(this);
    this.onChangeUrl = this.onChangeUrl.bind(this);
    this.onChangeNote = this.onChangeNote.bind(this);
    this.handleLinkInput = this.handleLinkInput.bind(this);
    this.hideLinkInput = this.hideLinkInput.bind(this);
    this.onChangeNote = this.onChangeNote.bind(this);
    this.handleNoteInput = this.handleNoteInput.bind(this);
    this.hideNoteInput = this.hideNoteInput.bind(this);
  }

  componentWillReceiveProps(newProps) {
    const { editorState } = newProps;
    if (!newProps.editorEnabled) {
      return;
    }
    const selectionState = editorState.getSelection();
    if (selectionState.isCollapsed()) {
      if (this.state.showURLInput) {
        this.setState({
          showURLInput: false,
        });
      }
    }
  }

  componentDidUpdate() {
    // eslint-disable-next-line react/no-find-dom-node
    const toolbarNode = this._toolbarNode;
    const selectionState = this.props.editorState.getSelection();

    if (selectionState.isCollapsed()) {
      toolbarNode.style.cssText = '';
    }

    if (!this.props.editorEnabled || this.state.showURLInput || this.state.showNoteInput) {
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

  onKeyDownUrl(e) {
    if (e.which === 13) {
      e.preventDefault();
      e.stopPropagation();
      this.props.setLink(this.state.urlInputValue);
      this.setState({
        showURLInput: false,
        urlInputValue: '',
      }, () => this.props.focus());
    } else if (e.which === 27) {
      this.hideLinkInput(e);
    }
  }

  onKeyDownNote(e) {
    if (e.which === 13) {
      e.preventDefault();
      e.stopPropagation();
      if (this.props.setNote) {
        this.props.setNote(this.state.noteInputValue, this.state.noteSubject);
      } else {
        // eslint-disable-next-line no-debugger,no-restricted-syntax
        debugger;
      }
      this.setState({
        showNoteInput: false,
        noteInputValue: '',
        noteSubject: undefined,
      }, () => this.props.focus());
    } else if (e.which === 27) {
      this.hideLinkInput(e);
    }
  }

  onChangeUrl(e) {
    this.setState({
      urlInputValue: e.target.value,
    });
  }

  onChangeNote(e) {
    this.setState({
      noteInputValue: e.target.value,
    });
  }

  handleLinkInput(e, direct = false) {
    if (direct !== true) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      this.props.focus();
      return;
    }
    const currentBlock = getCurrentBlock(editorState);
    let selectedEntity = '';
    let linkFound = false;
    currentBlock.findEntityRanges((character) => {
      const entityKey = character.getEntity();
      selectedEntity = entityKey;
      return entityKey !== null && editorState.getCurrentContent().getEntity(entityKey).getType() === Entity.LINK;
    }, (start, end) => {
      let selStart = selection.getAnchorOffset();
      let selEnd = selection.getFocusOffset();
      if (selection.getIsBackward()) {
        selStart = selection.getFocusOffset();
        selEnd = selection.getAnchorOffset();
      }
      if (start === selStart && end === selEnd) {
        linkFound = true;
        const { url } = editorState.getCurrentContent().getEntity(selectedEntity).getData();
        this.setState({
          showURLInput: true,
          urlInputValue: url,
        }, () => {
          setTimeout(() => {
            this.urlinput.focus();
            this.urlinput.select();
          }, 0);
        });
      }
    });
    if (!linkFound) {
      this.setState({
        showURLInput: true,
      }, () => {
        setTimeout(() => {
          this.urlinput.focus();
        }, 0);
      });
    }
  }

  hideLinkInput(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      showURLInput: false,
      urlInputValue: '',
    }, () => this.props.focus());
  }

  handleNoteInput(e, direct = false) {
    if (!direct) {
      e.preventDefault();
      e.stopPropagation();
    }
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      this.props.focus();
      return;
    }
    const currentBlock = getCurrentBlock(editorState);
    this.setState({
      showNoteInput: true,
      noteSubject: currentBlock.key,
    }, () => {
      setTimeout(() => {
        this.noteinput.focus();
      }, 0);
    });
  }

  hideNoteInput(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      showNoteInput: false,
      noteInputValue: '',
      noteSubject: '',
    }, () => this.props.focus());
  }

  render() {
    const { editorState, editorEnabled } = this.props;
    const { showURLInput, urlInputValue, showNoteInput, noteInputValue } = this.state;
    let isOpen = true;
    if (!editorEnabled || editorState.getSelection().isCollapsed()) {
      isOpen = false;
    }

    if (showURLInput) {
      let className = `md-editor-toolbar${(isOpen ? ' md-editor-toolbar--isopen' : '')}`;
      className += ' md-editor-toolbar--linkinput';
      return (
        <div
          className={className}
        >
          <div
            className="md-RichEditor-controls md-RichEditor-show-link-input"
            style={{ display: 'block' }}
          >
            <span className="md-url-input-close" onMouseDown={this.hideLinkInput}>&times;</span>
            <input
              ref={node => { this.urlinput = node; }}
              type="text"
              className="md-url-input"
              onKeyDown={this.onKeyDownUrl}
              onChange={this.onChangeUrl}
              placeholder="Press ENTER or ESC"
              value={urlInputValue}
            />
          </div>
        </div>
      );
    }
    if (showNoteInput) {
      let className = `md-editor-toolbar${(isOpen ? ' md-editor-toolbar--isopen' : '')}`;
      className += ' md-editor-toolbar--linkinput';
      return (
        <div
          className={className}
        >
          <div
            className="md-RichEditor-controls md-RichEditor-show-link-input"
            style={{ display: 'block' }}
          >
            <span className="md-note-input-close" onMouseDown={this.hideNoteInput}>&times;</span>
            <input
              ref={node => { this.noteinput = node; }}
              type="text"
              className="md-note-input"
              onKeyDown={this.onKeyDownNote}
              onChange={this.onChangeNote}
              placeholder="Press ENTER or ESC"
              value={noteInputValue}
            />
          </div>
        </div>
      );
    }
    return (
      <div
        className={`md-editor-toolbar${(isOpen ? ' md-editor-toolbar--isopen' : '')}`}
        ref={(node) => { this._toolbarNode = node; }}
      >
        {this.props.inlineButtons.length > 0 ? (
          <InlineToolbar
            editorState={editorState}
            onToggle={this.props.toggleInlineStyle}
            buttons={this.props.inlineButtons}
            handleLinkInput={this.handleLinkInput}
          />
        ) : null}
        <div className="md-editor-toolbar--arrow" ref={(node) => { this._arrowNode = node; }} />
        {this.props.blockButtons.length > 0 ? (
          <BlockToolbar
            editorState={editorState}
            onToggle={this.props.toggleBlockType}
            buttons={this.props.blockButtons}
          />
        ) : null}
        {this.props.setNote ? (
          <div className="md-RichEditor-controls">
            <a
              key={NOTE_BUTTON.style}
              className="md-RichEditor-styleButton md-RichEditor-noteButton hint--top"
              href="#open-note-input"
              onClick={this.handleNoteInput}
              aria-label={NOTE_BUTTON.description}
            >
              {NOTE_BUTTON.icon ? <i className={`fa fa-${NOTE_BUTTON.icon}`} /> : NOTE_BUTTON.label}
            </a>
          </div>
        ) : null}
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
    label: 'Q',
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
  // {
  //   label: 'U',
  //   style: 'UNDERLINE',
  //   icon: 'underline',
  //   description: 'Underline',
  // },
  {
    label: '#',
    style: HYPERLINK,
    icon: 'link',
    description: 'Add a link',
  },
];

