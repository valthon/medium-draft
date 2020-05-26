'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CUSTOM_BUTTONS = exports.INLINE_BUTTONS = exports.BLOCK_BUTTONS = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _draftJs = require('draft-js');

var _simpletoolbar = require('./simpletoolbar');

var _simpletoolbar2 = _interopRequireDefault(_simpletoolbar);

var _blocktoolbar = require('./blocktoolbar');

var _blocktoolbar2 = _interopRequireDefault(_blocktoolbar);

var _inlinetoolbar = require('./inlinetoolbar');

var _inlinetoolbar2 = _interopRequireDefault(_inlinetoolbar);

var _index = require('../util/index');

var _index2 = require('../model/index');

var _constants = require('../util/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
// import './toolbar.scss';

var overlap = function overlap(a1, a2, b1, b2) {
  return a2 >= b1 && a1 <= b2;
};

var Toolbar = function (_React$Component) {
  _inherits(Toolbar, _React$Component);

  function Toolbar(props) {
    _classCallCheck(this, Toolbar);

    var _this = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, props));

    _this.state = {
      showInput: false,
      inputValue: ''
    };

    _this.onChangeInput = _this.onChangeInput.bind(_this);
    _this.hideInput = _this.hideInput.bind(_this);
    _this.showDialog = _this.showDialog.bind(_this);
    return _this;
  }

  _createClass(Toolbar, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      var editorState = newProps.editorState;

      if (!newProps.editorEnabled) {
        return;
      }
      var selectionState = editorState.getSelection();
      if (selectionState.isCollapsed()) {
        if (this.state.showInput) {
          this.setState({
            showURLInput: false,
            urlInputValue: ''
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

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      var toolbarNode = this._toolbarNode;
      var selectionState = this.props.editorState.getSelection();
      if (!this.props.editorEnabled || this.state.showInput) {
        if (selectionState.isCollapsed() && this.state.showInput) {
          // Go back to toolbar if we lose focus
          this.hideInput();
        }
        return;
      }
      if (selectionState.isCollapsed()) {
        if (toolbarNode) {
          toolbarNode.style.cssText = '';
        }
        return;
      }
      var maxOverhang = this.props.maxOverhang;
      // eslint-disable-next-line no-undef
      var nativeSelection = (0, _index.getSelection)(window);
      if (!nativeSelection.rangeCount) {
        return;
      }
      var selectionBoundary = (0, _index.getSelectionRect)(nativeSelection);
      var toolbarBoundary = toolbarNode.getBoundingClientRect();

      // eslint-disable-next-line react/no-find-dom-node
      var parent = _reactDom2.default.findDOMNode(this.props.editorNode);
      var parentBoundary = parent.getBoundingClientRect();

      /*
      * Main logic for setting the toolbar position.
      */

      toolbarNode.style.top = selectionBoundary.top - parentBoundary.top - toolbarBoundary.height - 5 + 'px';
      // toolbarNode.style.width = `${toolbarBoundary.width}px`;
      var widthDiff = selectionBoundary.width - toolbarBoundary.width;
      if (widthDiff >= 0) {
        toolbarNode.style.left = selectionBoundary.left - parentBoundary.left + widthDiff / 2 + 'px';
      } else {
        var left = selectionBoundary.left - parentBoundary.left;
        left += widthDiff / 2;
        var initialLeft = left;

        if (left + toolbarBoundary.width > parentBoundary.width + maxOverhang) {
          left = parentBoundary.width - toolbarBoundary.width + maxOverhang;
        }
        if (left < -maxOverhang) left = -maxOverhang;
        toolbarNode.style.left = left + 'px';

        var arrowLeft = initialLeft - left + toolbarBoundary.width / 2;
        if (arrowLeft < 9) arrowLeft = 9;
        if (arrowLeft > toolbarBoundary.width - 9) arrowLeft = toolbarBoundary.width - 9;
        this._arrowNode.style.left = arrowLeft + 'px';
      }
    }
  }, {
    key: 'onChangeInput',
    value: function onChangeInput(e) {
      this.setState({
        inputValue: e.target.value
      });
    }
  }, {
    key: 'hideInput',
    value: function hideInput() {
      var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (e !== null) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.setState({
        showInput: false,
        inputValue: '',
        inputSubject: undefined
      }, this.props.focus);
    }
  }, {
    key: 'currentHighlightedText',
    value: function currentHighlightedText() {
      var editorState = this.props.editorState;

      var selection = editorState.getSelection();
      if (!editorState) {
        return '';
      }
      var block = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
      var endOffset = selection.getStartKey() === selection.getEndKey() ? selection.getEndOffset() : undefined;
      var text = block.getText().substring(selection.getStartOffset(), endOffset);
      return endOffset ? text : text + '...';
    }
  }, {
    key: 'showDialog',
    value: function showDialog(type, initialValue) {
      var _this2 = this;

      var onSubmit = function onSubmit() {
        var newState = type.action(_this2.props.editorState, _this2.state.inputValue);
        if (newState && newState !== _this2.props.editorState) {
          _this2.props.updateEditorState(newState);
        }
        _this2.hideInput();
      };
      var onCancel = function onCancel() {
        _this2.hideInput();
      };
      var onKeyDown = function onKeyDown(e) {
        if (e.which === 13) {
          e.preventDefault();
          e.stopPropagation();
          onSubmit();
        } else if (e.which === 27) {
          onCancel();
        }
      };

      var selection = this.currentHighlightedText();

      var showInput = void 0;
      switch (_typeof(type.dialog)) {
        case 'function':
          showInput = function showInput(isOpen, value) {
            return type.dialog(isOpen, value, { selection: selection, onKeyDown: onKeyDown, onChange: _this2.onChangeInput, onCancel: onCancel, onSubmit: onSubmit, ref: function ref(node) {
                _this2.input = node;
              } });
          };
          break;
        case 'string':
          showInput = function showInput(isOpen, value) {
            return _this2.renderInputDialog(isOpen, value, { selection: selection, onKeyDown: onKeyDown, onChange: _this2.onChangeInput, onCancel: onCancel, onSubmit: onSubmit, ref: function ref(node) {
                _this2.input = node;
              }, name: type.dialog });
          };
          break;
        default:
          showInput = function showInput() {
            return type.dialog;
          };
      }
      this.setState({
        showInput: showInput,
        inputValue: initialValue
      }, function () {
        setTimeout(function () {
          if (_this2.input) {
            _this2.input.focus();
            _this2.input.select();
          }
        }, 100);
      });
    }
  }, {
    key: 'renderInputDialog',
    value: function renderInputDialog(isOpen, value, _ref) {
      var onKeyDown = _ref.onKeyDown,
          onChange = _ref.onChange,
          onCancel = _ref.onCancel,
          ref = _ref.ref,
          _ref$name = _ref.name,
          name = _ref$name === undefined ? 'link' : _ref$name;

      var className = 'md-editor-toolbar' + (isOpen ? ' md-editor-toolbar--isopen' : '') + ' md-editor-toolbar--' + name + 'input';
      return _react2.default.createElement(
        'div',
        {
          className: className
        },
        _react2.default.createElement(
          'div',
          {
            className: 'md-RichEditor-controls md-RichEditor-show-' + name + '-input',
            style: { display: 'block' }
          },
          _react2.default.createElement(
            'span',
            { className: 'md-url-input-close', onMouseDown: onCancel },
            '\xD7'
          ),
          _react2.default.createElement('input', {
            ref: ref,
            type: 'text',
            className: 'md-url-input',
            onKeyDown: onKeyDown,
            onChange: onChange,
            placeholder: 'Press ENTER or ESC',
            value: value || ''
          })
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props = this.props,
          editorState = _props.editorState,
          editorEnabled = _props.editorEnabled;
      var _state = this.state,
          showInput = _state.showInput,
          inputValue = _state.inputValue;

      var isOpen = editorEnabled && !editorState.getSelection().isCollapsed();

      if (showInput) {
        return showInput(isOpen, inputValue);
      }

      return _react2.default.createElement(
        'div',
        {
          className: 'md-editor-toolbar' + (isOpen ? ' md-editor-toolbar--isopen' : ''),
          ref: function ref(node) {
            _this3._toolbarNode = node;
          }
        },
        this.props.inlineButtons.length > 0 ? _react2.default.createElement(_inlinetoolbar2.default, {
          editorState: editorState,
          buttons: this.props.inlineButtons,
          showDialog: this.showDialog,
          updateEditorState: this.props.updateEditorState
        }) : null,
        _react2.default.createElement('div', { className: 'md-editor-toolbar--arrow', ref: function ref(node) {
            _this3._arrowNode = node;
          } }),
        this.props.blockButtons.length > 0 ? _react2.default.createElement(_blocktoolbar2.default, {
          editorState: editorState,
          buttons: this.props.blockButtons,
          showDialog: this.showDialog,
          updateEditorState: this.props.updateEditorState
        }) : null,
        _react2.default.createElement(_simpletoolbar2.default, {
          editorState: editorState,
          buttons: this.props.customButtons,
          showDialog: this.showDialog,
          updateEditorState: this.props.updateEditorState
        })
      );
    }
  }]);

  return Toolbar;
}(_react2.default.Component);

Toolbar.propTypes = {
  editorEnabled: _propTypes2.default.bool,
  editorState: _propTypes2.default.object,
  updateEditorState: _propTypes2.default.func,
  inlineButtons: _propTypes2.default.arrayOf(_propTypes2.default.object),
  blockButtons: _propTypes2.default.arrayOf(_propTypes2.default.object),
  customButtons: _propTypes2.default.arrayOf(_propTypes2.default.object),
  editorNode: _propTypes2.default.object,
  focus: _propTypes2.default.func,
  maxOverhang: _propTypes2.default.number
};
Toolbar.defaultProps = {
  blockButtons: BLOCK_BUTTONS,
  inlineButtons: INLINE_BUTTONS,
  customButtons: CUSTOM_BUTTONS
};
exports.default = Toolbar;
var BLOCK_BUTTONS = exports.BLOCK_BUTTONS = [{
  label: 'H1',
  style: 'header-one',
  // icon: 'header',
  description: 'Heading 1'
}, {
  label: 'H2',
  style: 'header-two',
  // icon: 'header',
  description: 'Heading 2'
}, {
  label: 'H3',
  style: 'header-three',
  icon: 'header',
  description: 'Heading 3'
}, {
  label: _react2.default.createElement(
    'svg',
    { width: '10.83', height: '10', viewBox: '0 0 13 12' },
    _react2.default.createElement(
      'g',
      { stroke: 'none', strokeWidth: '1', fill: 'none', fillRule: 'evenodd' },
      _react2.default.createElement(
        'g',
        { transform: 'translate(-357.000000, -255.000000)', fill: '#FFFFFF' },
        _react2.default.createElement(
          'g',
          { transform: 'translate(260.000000, 165.000000)' },
          _react2.default.createElement(
            'g',
            { transform: 'translate(0.000000, 75.000000)' },
            _react2.default.createElement(
              'g',
              { transform: 'translate(19.000000, 0.000000)' },
              _react2.default.createElement('path', { d: 'M90.500768,15 L91,15.56 C88.9631235,17.0533408 87.9447005,18.666658 87.9447005,20.4 C87.9447005,21.8800074 88.75012,23.1466614 90.3609831,24.2 L87.5453149,27 C85.9211388,25.7866606 85.109063,24.346675 85.109063,22.68 C85.109063,20.3199882 86.90628,17.7600138 90.500768,15 Z M83.3917051,15 L83.890937,15.56 C81.8540605,17.0533408 80.8356375,18.666658 80.8356375,20.4 C80.8356375,21.8800074 81.6344006,23.1466614 83.2319508,24.2 L80.4362519,27 C78.8120759,25.7866606 78,24.346675 78,22.68 C78,20.3199882 79.7972171,17.7600138 83.3917051,15 Z' })
            )
          )
        )
      )
    )
  ),
  style: 'blockquote',
  icon: 'quote-right',
  description: 'Blockquote'
}, {
  label: 'UL',
  style: 'unordered-list-item',
  icon: 'list-ul',
  description: 'Unordered List'
}, {
  label: 'OL',
  style: 'ordered-list-item',
  icon: 'list-ol',
  description: 'Ordered List'
}];

var INLINE_BUTTONS = exports.INLINE_BUTTONS = [{
  label: 'B',
  style: 'BOLD',
  icon: 'bold',
  description: 'Bold'
}, {
  label: 'I',
  style: 'ITALIC',
  icon: 'italic',
  description: 'Italic'
}, {
  label: 'U',
  style: 'UNDERLINE',
  icon: 'underline',
  description: 'Underline'
},
/*  {
  label: 'Hi',
  style: 'HIGHLIGHT',
  description: 'Highlight selection',
}, */
{
  label: _react2.default.createElement(
    'svg',
    { width: '20', height: '15', viewBox: '0 0 14 14' },
    _react2.default.createElement(
      'g',
      { stroke: 'none', strokeWidth: '1', fill: 'none', fillRule: 'evenodd' },
      _react2.default.createElement(
        'g',
        { transform: 'translate(-468.000000, -254.000000)', stroke: '#FFFFFF' },
        _react2.default.createElement(
          'g',
          { transform: 'translate(260.000000, 165.000000)' },
          _react2.default.createElement(
            'g',
            { transform: 'translate(0.000000, 75.000000)' },
            _react2.default.createElement(
              'g',
              { transform: 'translate(19.000000, 0.000000)' },
              _react2.default.createElement(
                'g',
                { transform: 'translate(196.424621, 21.424621) rotate(45.000000) translate(-196.424621, -21.424621) translate(193.424621, 13.924621)' },
                _react2.default.createElement('path', { d: 'M0.5,5.69098301 L0.5,2 C0.5,1.82069363 0.550664909,1.51670417 0.697213595,1.2236068 C0.927818928,0.762396132 1.32141313,0.5 2,0.5 L4,0.5 C4.67858687,0.5 5.07218107,0.762396132 5.3027864,1.2236068 C5.44933509,1.51670417 5.5,1.82069363 5.5,2 L5.5,6 C5.5,6.67858687 5.23760387,7.07218107 4.7763932,7.3027864 C4.53586606,7.42304998 4.28800365,7.47874077 4.1077327,7.49484936 L0.5,5.69098301 Z' }),
                _react2.default.createElement('path', { d: 'M0.5,12.690983 L0.5,9 C0.5,8.82069363 0.550664909,8.51670417 0.697213595,8.2236068 C0.927818928,7.76239613 1.32141313,7.5 2,7.5 L4,7.5 C4.67858687,7.5 5.07218107,7.76239613 5.3027864,8.2236068 C5.44933509,8.51670417 5.5,8.82069363 5.5,9 L5.5,13 C5.5,13.6785869 5.23760387,14.0721811 4.7763932,14.3027864 C4.53586606,14.42305 4.28800365,14.4787408 4.1077327,14.4948494 L0.5,12.690983 Z', transform: 'translate(3.000000, 11.000000) scale(-1, -1) translate(-3.000000, -11.000000) ' })
              )
            )
          )
        )
      )
    )
  ),
  style: _constants.HYPERLINK,
  icon: 'link',
  description: 'Add a link',
  isActive: function isActive(editorState) {
    var selection = editorState.getSelection();
    if (selection.isCollapsed()) {
      return undefined;
    }
    var currentBlock = (0, _index2.getCurrentBlock)(editorState);
    var selectedEntity = '';
    var selStart = selection.getAnchorOffset();
    var selEnd = selection.getFocusOffset();
    if (selection.getIsBackward()) {
      selStart = selection.getFocusOffset();
      selEnd = selection.getAnchorOffset();
    }
    var linkFound = false;
    currentBlock.findEntityRanges(function (character) {
      var entityKey = character.getEntity();
      selectedEntity = entityKey;
      return entityKey !== null && editorState.getCurrentContent().getEntity(entityKey).getType() === _constants.Entity.LINK;
    }, function (start, end) {
      if (overlap(start, end, selStart, selEnd)) {
        linkFound = editorState.getCurrentContent().getEntity(selectedEntity).getData();
      }
    });
    return linkFound.url;
  },
  dialog: 'url',
  action: function action(editorState, dialogValue) {
    var url = dialogValue; // TODO improve this...
    var selection = editorState.getSelection();
    var content = editorState.getCurrentContent();
    var entityKey = null;
    var newUrl = url;
    var newEditorState = editorState;
    if (url !== '') {
      if (url.indexOf('http') === -1) {
        if (url.indexOf('@') >= 0) {
          newUrl = 'mailto:' + newUrl;
        } else {
          newUrl = 'http://' + newUrl;
        }
      }
      var contentWithEntity = content.createEntity(_constants.Entity.LINK, 'MUTABLE', { url: newUrl });
      newEditorState = _draftJs.EditorState.push(editorState, contentWithEntity, 'create-entity');
      entityKey = contentWithEntity.getLastCreatedEntityKey();
    }
    return _draftJs.RichUtils.toggleLink(newEditorState, selection, entityKey);
  }
}];

var CUSTOM_BUTTONS = exports.CUSTOM_BUTTONS = [];