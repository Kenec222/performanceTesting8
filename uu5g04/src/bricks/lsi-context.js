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
//@@viewOff:imports

let LsiContext = UU5.Common.VisualComponent.create({
  displayName: "LsiContext", // for backward compatibility (test snapshots)
  //@@viewOn:mixins
  mixins: [UU5.Common.BaseMixin, UU5.Common.ContentMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: ns.name("LsiContext"),
    classNames: {
      main: ns.css("lsi-context"),
    },
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    localLsi: UU5.PropTypes.bool,
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      localLsi: false,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    this._listeners = {};
    this._globalLanguage = this.props._nonLsiContextLanguageProviderValue?.language || UU5.Common.Tools.getLanguage();
    this._localLanguage = this._globalLanguage;
    return {
      providerValue: {
        setLanguage: this._setContextLanguage,
        getLanguage: this.getLanguage,
        registerLsi: this._registerLsi,
        unregisterLsi: this._unregisterLsi,
        _nonLsiContextLanguageProviderValue: this.props._nonLsiContextLanguageProviderValue,
      },
    };
  },

  componentDidMount: function () {
    window.UU5.Environment.EventListener.registerLsi(this.getId(), this._onChangeLanguage);
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.localLsi !== nextProps.localLsi) {
      this._fireEvent(this._getContextLanguage(nextProps));
    } else if (this.props._nonLsiContextLanguageProviderValue !== nextProps._nonLsiContextLanguageProviderValue) {
      this.setState((v) => ({
        providerValue: {
          ...v.providerValue,
          _nonLsiContextLanguageProviderValue: nextProps._nonLsiContextLanguageProviderValue,
        },
      }));
      this._fireEvent(this._getContextLanguage(nextProps));
    }
  },

  componentWillUnmount() {
    window.UU5.Environment.EventListener.unregisterLsi(this.getId(), this._onChangeLanguage);
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  setLanguage(language) {
    this._setLocalLanguage(language);
  },

  getLanguage() {
    return this._getContextLanguage();
  },

  registerLsi(id, listener) {
    if (typeof listener === "function") {
      this._registerLsi(id, listener);
    } else {
      UU5.Common.Tools.error("Listener in registerLsi parameter is not a function.", {
        component: "UU5.Bricks.LsiContext",
        id: this.getId(),
        function: "registerLsi",
      });
    }
  },

  unregisterLsi(id) {
    this._unregisterLsi(id);
  },
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _registerLsi(id, listener) {
    this._listeners[id] = listener;
  },

  _unregisterLsi(id) {
    delete this._listeners[id];
  },

  _onChangeLanguage(language) {
    this._setGlobalLanguage(language);
    if (!this.props.localLsi) {
      this._setLocalLanguage(language);
    }
  },

  _getContextLanguage(props = this.props) {
    if (props.localLsi) {
      return this._localLanguage;
    }
    if (props._nonLsiContextLanguageProviderValue) {
      return props._nonLsiContextLanguageProviderValue.language;
    }
    return this._globalLanguage;
  },

  _setContextLanguage(language) {
    if (this.props.localLsi) {
      this._setLocalLanguage(language);
    } else if (this.props._nonLsiContextLanguageProviderValue) {
      this.props._nonLsiContextLanguageProviderValue.setLanguage(language);
    } else {
      // cause _onChangeLanguage
      UU5.Common.Tools.setLanguage(language);
    }
  },

  _setLocalLanguage(language) {
    this._localLanguage = language;
    if (this.props.localLsi) {
      this._fireEvent(language);
    }
  },

  _setGlobalLanguage(language) {
    this._globalLanguage = language;
    if (!this.props.localLsi && !this.props._nonLsiContextLanguageProviderValue) {
      this._fireEvent(language);
    }
  },

  _fireEvent(language) {
    for (let i in this._listeners) {
      this._listeners[i](language);
    }
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    return (
      <UU5.Common.LsiMixin.Context.Provider value={this.state.providerValue}>
        {this.getChildren()}
      </UU5.Common.LsiMixin.Context.Provider>
    );
  },
  //@@viewOff:render
});

// uu5g05 integration - when using localLsi=false we want to ignore our parent LanguageProvider (more precisely parent LsiContext)
// and instead use root LanguageProvider (nearest LanguageProvider that isn't LsiContext); because uu5g05 doesn't have "global" language
function withNearestNonLsiContextLanguageProvider(Component) {
  let forwardRef = UU5.Common.Reference.forward((props, ref) => {
    return (
      <UU5.Common.LsiMixin.Context.Consumer>
        {(ctxValue) => {
          let { setLanguage, language, _nonLsiContextLanguageProviderValue } = ctxValue;
          let isFromHookProvider = typeof setLanguage === "function" && language !== undefined;
          if (isFromHookProvider) _nonLsiContextLanguageProviderValue = ctxValue;
          if (!_nonLsiContextLanguageProviderValue || Object.keys(_nonLsiContextLanguageProviderValue).length === 0) {
            _nonLsiContextLanguageProviderValue = null;
          }
          return (
            <Component {...props} ref={ref} _nonLsiContextLanguageProviderValue={_nonLsiContextLanguageProviderValue} />
          );
        }}
      </UU5.Common.LsiMixin.Context.Consumer>
    );
  });

  forwardRef.isUu5PureComponent = true;
  forwardRef.displayName = `forwardRef(${Component.displayName || Component.name || "Component"})`;
  forwardRef.tagName = Component.tagName;
  Object.assign(forwardRef, getStatics(Component)); // statics have to be added because DccWrapper reads them

  return forwardRef;
}
function getStatics({ classNames, defaults, nestingLevel, lsi, errors, warnings, opt }) {
  return { classNames, defaults, nestingLevel, lsi, errors, warnings, opt };
}

LsiContext = withNearestNonLsiContextLanguageProvider(LsiContext);

export { LsiContext };
export default LsiContext;
