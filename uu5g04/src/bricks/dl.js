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
import * as UU5 from "uu5g04";
import ns from "./bricks-ns.js";
import Css from "./internal/css.js";

import "./dl.less";
//@@viewOff:imports

export const Dl = UU5.Common.VisualComponent.create({
  displayName: "Dl", // for backward compatibility (test snapshots)

  //@@viewOn:mixins
  mixins: [
    UU5.Common.BaseMixin,
    UU5.Common.ElementaryMixin,
    UU5.Common.SectionMixin,
    UU5.Common.NestingLevelMixin,
    UU5.Common.PureRenderMixin,
  ],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: ns.name("Dl"),
    nestingLevelList: UU5.Environment.getNestingLevelList("bigBoxCollection", "smallBox"),
    classNames: {
      main: ns.css("dl"),
      inline: Css.css(`
      dt{
        display: inline;
      }
      dd{
        display: inline;
        margin-inline-start: 16px;
        margin-inline-end: 16px;
      }
    `),
    },
    defaults: {
      childTagNames: ["UU5.Bricks.Dd", "UU5.Bricks.Dt"],
    },
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    allowTags: UU5.PropTypes.arrayOf(UU5.PropTypes.string),
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps: function () {
    return {
      allowTags: [],
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  //@@viewOff:interface

  //@@viewOn:overriding
  shouldChildRender_: function (child) {
    let childTagName = UU5.Common.Tools.getChildTagName(child);
    let defaultChildTagNames = this.getDefault().childTagNames;
    let childTagNames = this.props.allowTags.concat(defaultChildTagNames);
    let result = childTagNames.indexOf(childTagName) > -1;
    if (!result && (typeof child !== "string" || child.trim())) {
      if (childTagName)
        this.showError("childTagNotAllowed", [childTagName, this.getTagName(), childTagName, defaultChildTagNames[0]], {
          mixinName: "UU5.Common.BaseMixin",
        });
      else this.showError("childNotAllowed", [child, defaultChildTagNames[0]], { mixinName: "UU5.Common.BaseMixin" });
    }
    return result;
  },
  //@@viewOff:overriding

  //@@viewOn:private
  _buildMainAttrs(notInline) {
    var mainAttrs = this.getMainAttrs();
    !notInline && (mainAttrs.className += " " + this.getClassName("inline"));
    return mainAttrs;
  },
  //@@viewOff:private

  //@@viewOn:render
  render: function () {
    return (
      <dl {...this._buildMainAttrs(this.getNestingLevel())}>
        {this.getHeaderChild()}
        {this.getChildren()}
        {this.getFooterChild()}
        {this.getDisabledCover()}
      </dl>
    );
  },
  //@@viewOff:render
});

export default Dl;
