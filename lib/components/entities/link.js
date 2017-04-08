'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findLinkEntities = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _constants = require('../../util/constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var findLinkEntities = exports.findLinkEntities = function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(function (character) {
    var entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === _constants.Entity.LINK;
  }, callback);
};

var Link = function Link(props) {
  var contentState = props.contentState,
      entityKey = props.entityKey;

  var _contentState$getEnti = contentState.getEntity(entityKey).getData(),
      url = _contentState$getEnti.url;

  return _react2.default.createElement(
    'a',
    {
      className: 'md-link hint--top hint--rounded',
      href: url,
      rel: 'noopener noreferrer',
      target: '_blank',
      'aria-label': url
    },
    props.children
  );
};

Link.propTypes = {
  children: _react.PropTypes.node,
  entityKey: _react.PropTypes.string,
  contentState: _react.PropTypes.object.isRequired
};

exports.default = Link;