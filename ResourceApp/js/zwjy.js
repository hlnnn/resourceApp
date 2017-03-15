;
(function ($, ko, _) {
  _.mixin(_.string.exports());

  function Config() {
    this.nohref = 'javascript:;';

    this.requestPath = AppConfig.requestPath;
    this.imagePath = AppConfig.resourceApp + '/images/';

    this.top = '45px';
    this.bottom = '51px';
    this.lineHeight = 45;
  };

  function Zwjy() {
    this.version = '1.0';
    this.defaultCityId = 20405000000;
    this.defaultCity = {
      theName: '苏州市',
      tableId: this.defaultCityId
    };

    this.config = new Config();

    this.isDebug = true;
    this.isDebugCatch = false;
    Config.call(this);
  };

  Zwjy.prototype.plusReady = function (initialize) {
    initialize();
  }

  var app = new Zwjy();
  //var log = window.console.log;
  //window.console.log = function (info) {
  //  if (app.isDebug) {
  //    log(info);
  //  }
  //};

  window.app = app;
})(jQuery, ko, _);

// Modules
(function (app) {
  // 模块
  function Modules() { }
  app.module = new Modules();
})(app);

// Cache
(function (app, _) {
  // 缓存
  function Cache() { }
  Cache.prototype.set = function (key, data) {
    if (_.isUndefined(data) || _.isNull(data)) {
      localStorage.removeItem(key);
    } else {
      localStorage[key] = JSON.stringify(data);
    }
  }
  Cache.prototype.get = function (key) {
    var val = localStorage[key];
    if (_.isUndefined(val) || _.isNull(val)) {
      return undefined;
    }
    return JSON.parse(val);
  }
  app.cache = new Cache();
})(app, _);

// Util
(function (app, _) {
  // 工具
  function Util() { }
  Util.prototype.disable = function (el) {
    el.disabled = true;
  }
  Util.prototype.enable = function (el) {
    el.disabled = false;
  }
  Util.prototype.mask = function (el, maskMsg) {
    if (el.type === 'button') {
      el.setAttribute('data-loading-text', maskMsg);
      mui(el).button('loading');
    }
  }
  Util.prototype.unmask = function (el) {
    if (el.type === 'button') {
      mui(el).button('reset');
    }
  }
  Util.prototype.dateString = function (str) {
    if (str) {
      if (_.str.include(str, 'T'))
        return str.split('T')[0];
      return str.split(' ')[0];
    }
    return str;
  }
  Util.prototype.goTo = function (url, extras) {
    var kvs = _.map(extras, function (val, key) {
      return _.sprintf('%s=%s', key, val);
    });
    kvs.push('t=' + new Date().getTime());
    var search = kvs.join('&');
    location.href = url + '?' + search;
  };
  Util.prototype.getExtrasValue = function (key) {
    var extras = this.getExtras();
    if (key in extras) {
      return extras[key];
    }
    return undefined;
  }
  Util.prototype.getExtras = function () {
    if (!this.requestParam && location.search) {
      var self = this;
      self.requestParam = {};
      var items = location.search.substring(1).split('&');
      $(items).each(function () {
        var arr = this.split('=');
        self.requestParam[arr[0]] = arr[1];
      });
    }
    return this.requestParam;
  }
  Util.prototype.getParam = Util.prototype.getExtras;
  Util.prototype.createView = Util.prototype.createIframe = createIframe;
  Util.prototype.fire = function (webview, eventType, data) {
    //mui.trigger(webview, eventType, data);
    console.log('fire');
  };
  Util.prototype.call = function (number) {
    if (plus.os.name === "Android") {
      var Intent = plus.android.importClass("android.content.Intent");
      var Uri = plus.android.importClass("android.net.Uri");
      var main = plus.android.runtimeMainActivity();
      var uri = Uri.parse("tel:" + number);
      var call = new Intent("android.intent.action.CALL", uri);
      main.startActivity(call);
    } else {
      //plus.device.dial(number, false);
      var UIAPP = plus.ios.importClass("UIApplication");
      var NSURL = plus.ios.importClass("NSURL");
      var app = UIAPP.sharedApplication();
      app.openURL(NSURL.URLWithString("tel://" + number));
    }
  }; ////拨打电话
  app.util = new Util();

  function createIframe(el, opt) {
    var iframe,
      url = opt.url + '?t=' + new Date().getTime(),
      elContainer = document.querySelector(el);
    var wrapper = document.querySelector(".mui-iframe-wrapper");
    if (!wrapper) {
      // 创建wrapper 和 iframe
      wrapper = document.createElement('div');
      wrapper.className = 'mui-iframe-wrapper';
      for (var name in opt.style) {
        if (opt.style.hasOwnProperty(name)) {
          wrapper.style[name] = opt.style[name];
        }
      }
      iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.id = opt.id || opt.url;
      iframe.name = opt.id;
      wrapper.appendChild(iframe);
      elContainer.appendChild(wrapper);
    } else {
      iframe = wrapper.querySelector('iframe');
      iframe.src = url;
      iframe.id = opt.id || opt.url;
      iframe.name = iframe.id;
    }
    return iframe;
  }

  function _debug(message, stacktrace) {
    var written = false;
    try {
      if (window.console) {
        if (stacktrace && window.console.trace) window.console.trace();
        if (window.console.log) window.console.log(message);
        written = true;
      } else if (window.opera && window.opera.postError) {
        window.opera.postError(message);
        written = true;
      }
    } catch (ex) { }

    if (!written) {
      var debug = document.getElementById("debug");
      if (debug) {
        var contents = message + "<br/>" + debug.innerHTML;
        if (contents.length > 2048) contents = contents.substring(0, 2048);
        debug.innerHTML = contents;
      }
    }
  };
  app._debug = function (options, stacktrace) {
    var fn = this,
      opt = options;
    return function () {
      try {
        fn.apply(opt, arguments);
      } catch (ex) {
        _debug(ex.message, stacktrace);
      }
    }
  };

})(app, _);

// Messager
(function (app) {
  // 信息
  function Messager() {

  }
  Messager.prototype.alert = function (title, info, icon, callback) {
    callback = callback || icon;
    alert(info);
    if (callback)
      callback();
  }
  Messager.prototype.confirm = function (title, info, icon, callback) {
    callback = callback || icon;
    if (confirm(info))
      if (callback)
        callback();
  }
  Messager.prototype.prompt = function (title, info, icon, callback) {
    callback = callback || icon;
    var r = prompt(title, info);
    if (r) {
      callback(r);
    }
  }
  Messager.prototype.toast = function (info, callback) {
    this.alert(info, callback);
  }
  Messager.prototype.unopened = function () {
    app.messager.toast('该模块未开放');
  }
  app.messager = new Messager();
})(app);

// 验证
(function (app, _) {
  _.isNullOrEmpty = function (str) {
    return _.isUndefined(str) || _.isNull(str) || str === '';
  };

  function Validate() { }
  Validate.prototype.require = function (value, name) {
    if (_.isNullOrEmpty(value)) {
      name = name || '输入内容';
      app.messager.toast(name + '不能为空');
      return false;
    }
    return true;
  };
  Validate.prototype.validatePhone = function (phone, name) {
    name = name || '手机号码';
    if (phone === '') {
      app.messager.toast(name + '不能为空');
      return false;
    }
    //var isPass = phone.match(/^(((13[0-9]{1})|159|153|171)+\d{8})$/);
    var isPass = phone.match(/^1[34578]\d{9}$/);
    if (!isPass) {
      app.messager.toast(name + '输入格式不正确');
      return false;
    }
    return true;
  }
  Validate.prototype.validateEMail = function (email, callback) {
    if (email === '') {
      app.messager.toast('邮箱不能为空');
      return false;
    }
    var isPass = email.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/);
    if (!isPass) {
      app.messager.toast('邮箱输入格式不正确');
      return false;
    }
    return true;
  }
  app.validate = new Validate();
})(app, _);

(function (app, $) {
  function Image() { }
  Image.fn = Image.prototype;
  Image.fn.noImage = noImagePath;
  Image.fn.get = function (imagePath, noImage) {
    if (noImage) {
      return noImagePath();
    }
    return imagePath;
  };
  Image.fn.local = function (imagePath) {
    if (!imagePath) return noImagePath();
    return _(imagePath).startsWith('http')
      ? imagePath
      : noImagePath() === imagePath ? imagePath : (app.imagePath + imagePath);
  }
  Image.fn.getLocal = function (imagePath, noImage) {
    if (noImage) {
      return noImagePath();
    }
    if (!imagePath) return noImagePath();
    return _(imagePath).startsWith('http') ? imagePath : (app.imagePath + imagePath);
  }

  function noImagePath() {
    return app.imagePath + 'noImage.jpg';
  }

  app.image = new Image();
})(app, jQuery);

// Request
(function (app, $, ko, _) {
  var prefixMapping = {
    tdwr: 't%s.thtml',
    tudwr: 'tu%s.tuhtml'
  };

  function Request() {
    var self = this;
    self.DEFAULTS = {
      type: 'POST',
      dataType: 'json',
      token: false,
      mask: false,
      maskMsg: 'loading',
      nocache: false
    };
    self.postAction = function (prefix, action, data, sender, callback) {
      var options = self.getOptionsByPrefix(prefix, action, data, sender, callback);
      self.ajax(options);
    };
    self.post = function (url, data, sender, callback) {
      var options = self.getOptionsByUrl(url, data, sender, callback);
      self.ajax(options);
    };
    self.getOptionsByPrefix = function (prefix, action, data, sender, callback) {
      var prefixUrl = this.prefix(prefix, action);
      if (_.isObject(action)) {
        action.url = _.sprintf(prefixUrl, action.url);
      } else {
        action = _.sprintf(prefixUrl, action);
      }
      var options = self.getOptionsByUrl(action, data, sender, callback);
      return options;
    }
    self.getOptionsByUrl = function (url, data, sender, callback) {
      var options;
      if (!callback) {
        callback = sender;
        sender = undefined;
      }
      if (_.isObject(url)) {
        options = $.extend({}, url, {
          type: 'POST'
        });
      } else {
        options = {
          url: url,
          data: data,
          type: 'POST',
          trigger: sender,
          success: callback
        };
      }
      return options;
    }
    self.ajax = function (opt) {
      app._debug.call(function () {
        if (!_.startsWith(opt.url, app.requestPath))
          opt.url = app.requestPath + opt.url;

        request.call(opt, function (options) {
          var ajaxOpt = $.extend(true, {}, self.DEFAULTS, options, opt);
          if (app.isDebugCatch) {
            ajaxOpt.success = app._debug.call(ajaxOpt.success, ajaxOpt, app.isDebug);
            ajaxOpt.error = app._debug.call(ajaxOpt.error, ajaxOpt, app.isDebug);
            ajaxOpt.complete = app._debug.call(ajaxOpt.complete, ajaxOpt, app.isDebug);
          }
          $.ajax(ajaxOpt);
        });
      }(), app.isDebug);
    };
  }
  Request.prototype.prefix = function (prefix, action) {
    if (prefix in prefixMapping) {
      return _.sprintf(prefixMapping[prefix], action);
    }
    throw _.sprintf('缺少配置前缀：%s', prefix);
  };
  // 异步请求成功委托
  function onSuccess(response) {
    var opt = this;
    response = formatResponse(response);
    if (response.success === true) {
      if (response.info && opt.trigger) {
        app.messager.alert('系统提示', response.info, 'info', function () {
          if (opt.onSuccessEvent) {
            opt.onSuccessEvent(response);
          }
        });
      } else if (opt.onSuccessEvent) {
        opt.onSuccessEvent(response);
      }
    } else {
      if (response.info && opt.trigger) {
        app.messager.alert('系统提示', response.info, 'info', function () {
          if (opt.onFailEvent) {
            opt.onFailEvent(response);
          }
        });
      } else if (opt.onFailEvent) {
        opt.onFailEvent(response);
      }
    }
  }
  // 异步请求错误委托
  function onError(xhr, textStatus, err) {
    loadError.apply(this, arguments);
    if (this.onErrorEvent) {
      this.onErrorEvent(xhr, textStatus, err);
    }
  }
  // 异步请求完成委托
  function onComplete(xhr, ts) {
    if (xhr.status === 401 && ts !== 'error') {
      var json = xhr.responseJSON;
      app.messager.alert('系统提示', json.info, 'info', function () {
        if (json.data && json.data.url) {
          top.location.href = json.data.url;
        }
      });
      return;
    }
    /*if (xhr.responseText){
      app.messager.toast(xhr.responseText);
    }*/
    if (this.onCompleteEvent) {
      this.onCompleteEvent(xhr, ts);
    }
    var trigger = this.trigger;
    if (trigger && trigger !== document) {
      app.util.enable(trigger);
    }
    if (this.mask) {
      app.util.unmask(this.trigger);
    }
  }
  // 异常处理
  function loadError(xhr, textStatus, err) {
    if (xhr.status === 401) {
      var json = xhr.responseJSON;
      app.messager.alert('系统提示', json.info, 'info', function () {
        if (json.data && json.data.url) {
          top.location.href = json.data.url;
        }
      });
    } else {
      app.messager.alert('系统发生错误', err);
    }
  }

  function formatResponse(response) {
    response.success = response.result === 'success';
    return response;
  }

  function request(ajax) {

    var trigger = this.trigger;
    if (trigger && trigger !== document) {
      app.util.disable(trigger);
    }
    if (this.mask) {
      app.util.mask(trigger, this.maskMsg);
    }

    ajax({
      success: onSuccess,
      error: onError,
      complete: onComplete
    });
  }

  app.request = new Request();
})(app, jQuery, ko, _);

// localStorage
(function (app) {
  function LocalStorage() {

  }

  LocalStorage.fn = LocalStorage.prototype;
  LocalStorage.fn.getMember = function () {
    return app.cache.get('member');
  };
  LocalStorage.fn.setMember = function (member) {
    return app.cache.set('member', member);
  };
  LocalStorage.fn.setMemberResponse = function (response, fnLoginStatus) {
    var member = response.member;
    var localMember = {
      accountType: member.accountType,
      memberId: member.memberId,
      memberName: member.memberName,
      headImagePath: member.headImagePath,
      gender: member.gender || -1,
      address: member.address,
      postcode: member.postcode,
      phoneNumber: member.phoneNumber,
      fixedPhone: member.fixedPhone,
      huanXinId: member.huanXinId,
      md5Pwd: member.md5Pwd,
      objectType: member.objectType || 'MemberNormalMember',
      area: {
        tableId: member.area.tableId,
        theName: member.area.theName
      },
      city: {
        tableId: member.city.tableId,
        theName: member.city.theName
      },
      province: {
        tableId: member.province.tableId,
        theName: member.province.theName
      },
      email: member.email,
      company: member.company,
      store: member.store,
      starLevel: member.level || 0,
      isPush: member.isPush,
      isMessage: member.isMessage,
      isIdentityCert: member.isIdentityCert,
      isCardCert: member.isCardCert,
      isHavingQuestion: member.isHavingQuestion,
      professional: member.professional || 0
    };
    if (fnLoginStatus) {
      fnLoginStatus(localMember);
    } else {
      var loginMember = app.localMember.getMember();
      localMember.isRemember = loginMember.isRemember;
      localMember.account = loginMember.account;
      localMember.password = loginMember.password;
      localMember.token = loginMember.token;
    }
    //console.log(localMember.token)
    app.cache.set('member', localMember);
    return localMember;
  };

  LocalStorage.fn.getCity = function () {
    return app.cache.get('city');
  };
  LocalStorage.fn.setCity = function (city) {
    return app.cache.set('city', city);
  };
  app.localStorage = new LocalStorage();
})(app);

// MUI
(function (app, mui, _) {
  var plusReady = app.plusReady;
  app.plusReady = function (initialize) {
    if (mui.os.plus) {
      mui.plusReady(initialize);
    } else {
      initialize();
    }
    return this;
  }

  var messager = app.messager;
  app.messager.alert = function (title, info, icon, callback) {
    if (!info && !icon && !callback) {
      mui.alert(title);
      return;
    }
    callback = callback || icon;
    if (!_.isFunction(callback)) return;
    if (icon === 'error') {
      mui.alert(info, title, callback);
    } else {
      mui.alert(info);
      callback();
    }
  }
  app.messager.confirm = function (title, info, btnArray, callback) {
    callback = callback || btnArray;
    if (!_.isFunction(callback)) return;
    btnArray = _.isArray(btnArray) ? btnArray : ['否', '是'];
    mui.confirm(info, title, btnArray, function (e) {
      callback(e);
    });
  }
  app.messager.prompt = function (title, info, btnArray, callback) {
    callback = callback || btnArray;
    if (!_.isFunction(callback)) return;
    btnArray = _.isArray(btnArray) ? btnArray : ['取消', '确定'];
    mui.prompt(info, title, btnArray, function (e) {
      callback(e);
    });
  }
  app.messager.toast = function (info, callback) {
    mui.toast(info);
    if (callback) callback();
  }

  var util = app.util;
  app.util.goTo = function (url, extras, autoShow) {
    //var newurl = url + '?t=' + new Date().getTime();
    if (_.isObject(url)) {
      if (!window.plus) {
        app.cache.set(url.url + '-extras', extras || url.extras);
      }
      mui.openWindow(url);
    } else {
      if (!window.plus) {
        app.cache.set(url + '-extras', extras);
      }
      //console.log([autoShow,autoShow !== false]);
      mui.openWindow({
        url: url,
        id: app.util.getUrlId(url),
        extras: extras,
        show: {
          autoShow: autoShow !== false
        }
      });
    }
  };

  app.util.closeUntil = function (webviewId, current) {
    if (window.plus) {
      if (!current) {
        current = plus.webview.currentWebview();
      }
      var opener = current.opener();
      if (opener && opener.id !== webviewId) {
        app.util.closeUntil(webviewId, opener);
        //mui.closeAll(opener);
        opener.close('none', 0);
      }
    }
  };

  app.util.closeUntilTop = function (current) {
    if (window.plus) {
      if (!current) {
        current = plus.webview.currentWebview();
      }
      var opener = current.opener();
      if (opener && opener.opener()) {
        app.util.closeUntilTop(opener);
        //mui.closeAll(opener);
        opener.close('none', 0);
      }
    }
  };
  app.util.getUrlId = function (url) {
    return url.substring(url.lastIndexOf('/') + 1);
  }

  app.util.getExtras = function () {
    if (!window.plus) {
      var paths = location.pathname.split('/'),
        url = paths[paths.length - 1];
      return app.cache.get(url + '-extras');
    }
    var self = plus.webview.currentWebview();
    return self;
  }

  app.util.createView = function (el, opt) {
    if (!window.plus)
      return util.createView(el, opt);
    return plus.webview.create(opt.url, opt.id, opt.style);
  };

  app.util.fire = function (webview, eventType, data) {
    if (window.plus) {
      mui.fire(webview, eventType, data);
    } else {
      mui.trigger(webview, eventType, data);
    }
  }

  app.util.show = function (webview) {
    if (!webview) webview = mui.currentWebview;
    if (webview) {
      //显示当前页面
      webview.show('slide-in-right', mui.os.ios ? 200 : 300);
      //关闭等待框
      plus.nativeUI.closeWaiting();
    }
  }

  app.module.ServiceCall = function (phoneService, noPhoneToast) {
    var self = this;
    this.phoneService = ko.observable(phoneService);
    this.phone = function () {
      if (self.phoneService()) {
        mui.confirm('是否拨打电话？', function (e) {
          if (e.index === 1) {
            app.util.call(self.phoneService());
          }
        });
      } else {
        app.messager.toast(noPhoneToast || '用户没有提供电话');
      }
    }
    this.connect = function () {
      app.messager.unopened();
    }
  }

  function later(fn, timeout) {
    setTimeout(fn, timeout || mui.os.ios ? 200 : 350);
  }

  function globalEvents() {
    app.plusReady(function () {
      if (!window.plus) return;
      var current = plus.webview.currentWebview(),
        closeWebviewId = current.closeWebviewId,
        closeUntilWebviewId = current.closeUntilWebviewId,
        closeUntilTop = current.closeUntilTop;
      if (closeWebviewId) {
        later(function () {
          //console.log(closeWebviewId);
          //mui.closeAll(plus.webview.getWebviewById(closeWebviewId));
          plus.webview.close(closeWebviewId, 0);
        });
      }
      if (closeUntilWebviewId) {
        later(function () {
          app.util.closeUntil(closeUntilWebviewId);
        });
      } else if (closeUntilTop) {
        later(app.util.closeUntilTop);
      }
    });
  }

  function initializeAppConfig() {
    var config = mui.extend({
      noImage: false,
      isMessage: true,
      isPush: true
    }, app.cache.get('config'));
    app.config.noImage = config.noImage;
    app.config.isMessage = config.isMessage;
    app.config.isPush = config.isPush;
  }

  globalEvents();
  initializeAppConfig();
})(app, mui, _);