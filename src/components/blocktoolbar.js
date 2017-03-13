import { RichUtils } from 'draft-js';

import { Block } from '../util/constants';

import SimpleToolbar from './simpletoolbar';

export default class BlockToolbar extends SimpleToolbar {
  defaultIsActive(editorState, type) {
    const blockType = RichUtils.getCurrentBlockType(editorState);
    return (type.style === blockType);
  }

  defaultAction(editorState, active, type) {
    const currentBlockType = RichUtils.getCurrentBlockType(editorState);
    if (currentBlockType.indexOf(`${Block.ATOMIC}:`) === 0) {
      return false;
    }
    return RichUtils.toggleBlockType(editorState, type.style);
  }

  divClassName() {
    return 'md-RichEditor-controls md-RichEditor-controls-block';
  }
}
