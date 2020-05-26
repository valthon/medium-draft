'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _stylebutton = require('./stylebutton');

var _stylebutton2 = _interopRequireDefault(_stylebutton);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SimpleToolbar = function (_React$Component) {
  _inherits(SimpleToolbar, _React$Component);

  function SimpleToolbar(props) {
    _classCallCheck(this, SimpleToolbar);

    var _this = _possibleConstructorReturn(this, (SimpleToolbar.__proto__ || Object.getPrototypeOf(SimpleToolbar)).call(this, props));

    _this.toggle = function (type) {
      var active = _this.isActive(type);
      if (type.dialog) {
        return function () {
          return _this.props.showDialog(type, active);
        };
      }
      return function () {
        var newState = (type.action || _this.defaultAction)(_this.props.editorState, active, type);
        if (newState && newState !== _this.props.editorState) {
          _this.props.updateEditorState(newState);
        }
      };
    };

    _this.isActive = _this.isActive.bind(_this);
    return _this;
  }

  _createClass(SimpleToolbar, [{
    key: 'isActive',
    value: function isActive(type) {
      return (type.isActive || this.defaultIsActive)(this.props.editorState, type);
    }
  }, {
    key: 'defaultAction',
    value: function defaultAction() {
      return false;
    }
  }, {
    key: 'defaultIsActive',
    value: function defaultIsActive() {
      return false;
    }
  }, {
    key: 'divClassName',
    value: function divClassName() {
      return 'md-RichEditor-controls';
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var buttons = this.props.buttons;

      if (!buttons || buttons.length < 1) {
        return null;
      }
      return _react2.default.createElement(
        'div',
        { className: this.divClassName() },
        buttons.map(function (type) {
          var iconLabel = {};
          if (type.icon) {
            iconLabel.icon = type.icon;
          } else {
            iconLabel.label = type.label;
          }
          return _react2.default.createElement(_stylebutton2.default, _extends({}, iconLabel, {
            key: type.style,
            active: !!_this2.isActive(type),
            onToggle: _this2.toggle(type),
            style: type.style,
            description: type.description
          }));
        })
      );
    }
  }]);

  return SimpleToolbar;
}(_react2.default.Component);

SimpleToolbar.propTypes = {
  buttons: _propTypes2.default.array,
  editorState: _propTypes2.default.object.isRequired,
  showDialog: _propTypes2.default.func,
  updateEditorState: _propTypes2.default.func
};
exports.default = SimpleToolbar;