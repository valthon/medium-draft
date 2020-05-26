'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _draftJs = require('draft-js');

var _constants = require('../util/constants');

var _simpletoolbar = require('./simpletoolbar');

var _simpletoolbar2 = _interopRequireDefault(_simpletoolbar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BlockToolbar = function (_SimpleToolbar) {
  _inherits(BlockToolbar, _SimpleToolbar);

  function BlockToolbar() {
    _classCallCheck(this, BlockToolbar);

    return _possibleConstructorReturn(this, (BlockToolbar.__proto__ || Object.getPrototypeOf(BlockToolbar)).apply(this, arguments));
  }

  _createClass(BlockToolbar, [{
    key: 'defaultIsActive',
    value: function defaultIsActive(editorState, type) {
      var blockType = _draftJs.RichUtils.getCurrentBlockType(editorState);
      return type.style === blockType;
    }
  }, {
    key: 'defaultAction',
    value: function defaultAction(editorState, active, type) {
      var currentBlockType = _draftJs.RichUtils.getCurrentBlockType(editorState);
      if (currentBlockType.indexOf(_constants.Block.ATOMIC + ':') === 0) {
        return false;
      }
      return _draftJs.RichUtils.toggleBlockType(editorState, type.style);
    }
  }, {
    key: 'divClassName',
    value: function divClassName() {
      return 'md-RichEditor-controls md-RichEditor-controls-block';
    }
  }]);

  return BlockToolbar;
}(_simpletoolbar2.default);

exports.default = BlockToolbar;