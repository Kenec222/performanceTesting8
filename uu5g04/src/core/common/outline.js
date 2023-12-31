/**
 * Copyright (C) 2021 Unicorn a.s.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License at
 * <https://gnu.org/licenses/> for more details.
 *
 * You may obtain additional information at <https://unicorn.com> or contact Unicorn a.s. at address: V Kapslovne 2767/2,
 * Praha 3, Czech Republic or at the email: info@unicorn.com.
 */

//@@viewOn:imports
import React from "react";
import ns from "./common-ns.js";
import { PropTypes } from "uu5g05";
import BaseMixin from "./base-mixin.js";
import ElementaryMixin from "./elementary-mixin.js";
import Tools from "./tools.js";
import PureRenderMixin from "./pure-render-mixin";
import VisualComponent from "./visual-component.js";

import "./outline.less";
//@@viewOff:imports

export const Outline = VisualComponent.create({
  displayName: "Outline", // for backward compatibility (test snapshots)
  //@@viewOn:mixins
  mixins: [BaseMixin, ElementaryMixin, PureRenderMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: ns.name("Outline"),
    classNames: {
      main: ns.css("outline"),
    },
    defaults: {
      propsIcon: "mdi-information-outline",
    },
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    element: PropTypes.object,
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps: function () {
    return {
      element: null,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  isOutline() {
    return true;
  },
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _openModal: function (tag, props) {
    var propsString = JSON.stringify(props, null, 2);
    this.modal.open({ header: tag, content: <pre>{propsString}</pre> });
    return this;
  },

  _buildOutlineItem: function (tag, props, isContent) {
    var newProps = {};
    var items = null;

    if (props) {
      for (var prop in props) {
        var value = props[prop];
        if (prop === "parent" && value) {
          value = value.getTagName();
        } else if (typeof value === "function") {
          value = "function()";
        }
        newProps[prop] = value;
      }

      if (isContent && typeof props.children !== "string") {
        items = this._buildOutlineItems(props.children);
        delete newProps.children;
      }
    }

    var link = null;
    if (Object.keys(newProps).length) {
      link = Tools.findComponent("UU5.Bricks.Link", {
        onClick: this._openModal.bind(this, tag, newProps),
        content: Tools.findComponent("UU5.Bricks.Icon", { icon: this.getDefault().propsIcon }),
      });
    }

    var newItemProps = {
      label: Tools.findComponent("UU5.Bricks.Span", {
        parent: this,
        content: [tag, link],
      }),
    };

    items && (newItemProps.items = items);

    return newItemProps;
  },

  _buildOutlineItems: function (children) {
    var content = this;
    var items = null;

    if (children) {
      !Array.isArray(children) && (children = [children]);

      children.forEach(function (child) {
        items = items || [];
        items.push(
          content._buildOutlineItem(
            UU5.Common.Tools.getChildTagName(child),
            child.props,
            !!child.type["UU5.Common.ContentMixin"]
          )
        );
      });
    }

    return items;
  },

  _refModal: function (modal) {
    this.modal = modal;
    return this;
  },
  //@@viewOff:private

  //@@viewOn:render
  render: function () {
    var children = this.props.element.getStandardChildren();
    var item = this._buildOutlineItem(
      this.props.element.getTagName(),
      UU5.Common.Tools.merge({}, this.props.element.props, { children: children }),
      true
    );

    return (
      <div {...this.getMainAttrs()}>
        {Tools.findComponent("UU5.Bricks.Tree", { items: [item] })}
        {Tools.findComponent("UU5.Bricks.Modal", { ref_: this._refModal, parent: this })}
        {this.getDisabledCover()}
      </div>
    );
  },
  //@@viewOff:render
});

export default Outline;
