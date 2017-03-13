import { RichUtils } from 'draft-js';

import { Block } from '../util/constants';

import SimpleToolbar from './simpletoolbar';

export default class InlineToolbar extends SimpleToolbar {
  defaultIsActive(editorState, type) {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(type.style);
  }

  defaultAction(editorState, active, type) {
    const blockType = RichUtils.getCurrentBlockType(editorState);
    if (blockType.indexOf(Block.H1.split('-')[0]) === 0) {
      return false;
    }
    return RichUtils.toggleInlineStyle(editorState, type.style);
  }

  divClassName() {
    return 'md-RichEditor-controls md-RichEditor-controls-inline';
  }
}
