// Request Auth
(function (app, mui) {
  var request = app.request,
    auth;
  request.postActionAuth = function (prefix, action, data, sender, callback) {
    auth(function (token, memberId) {
      var options = request.getOptionsByPrefix(prefix, action, data, sender, callback);
      options = addToken(options, token);
      if (memberId) {
        options.data.memberId = memberId;
      }
      request.ajax(options);
    });
  };

  request.postAuth = function (url, data, sender, callback) {
    auth(function (token, memberId) {
      var options = request.getOptionsByUrl(url, data, sender, callback);
      options = addToken(options, token);
      if (memberId) {
        options.data.memberId = memberId;
      }
      request.ajax(options);
    });
  };

  function addToken(options, token) {
    options.data.token = token;
    options.data.skey = 'Android20160708PVK94LAS3';
    //$.extend(options, {
    //  headers: {
    //    token: token
    //  }
    //});
    return options;
  }

  function validate(expires) {
    console.log(expires);
  }

  function authToken(callback, failCallback) {
    var td = app.cache.get('token-data');
    if (td) {
      var expires = td.expires,
        token = td.token;
      if (validate(expires)) {
        callback(token);
      } else {
        requestToken(callback, failCallback);
      }
    } else {
      requestToken(callback, failCallback);
    }
  }

  function authLogin(callback, failCallback) {
    var member = app.cache.get('member');
    if (member) {
      if (member.token) {
        var token = member.token,
          memberId = member.memberId;
        callback(token, memberId);
      } else {
        app.util.goTo('login.htm', { back: true });
      }
    } else {
      app.util.goTo('login.htm', { back: true });
    }
  }

  function requestToken(callback, failCallback) {
    var serialNO;
    if (window.plus) {
      serialNO = plus.device.imei;
    } else {
      serialNO = app.cache.get('serialNO') || 'test';
    }
    request.post('getToken', {
      serialNO: serialNO
    }, function (response) {
      if (response.result === 'success') {
        var td = {
          token: response.token,
          expires: response.expires
        };
        app.cache.set('token-data', td);
        callback(td.token);
      } else {
        if (failCallback) {
          failCallback();
        } else {
          app.messager.toast('获取 token 失败');
        }
      }
    });
  }

  var loginSuccess;
  //var goTo = app.util.goTo;
  app.util.goToAuth = function (url, extras, autoShow) {
    loginSuccess = function (token, params) {
      extras = mui.extend({}, extras, params);
      app.util.goTo(url, extras, autoShow);
    };
    auth(loginSuccess, function () {
      app.util.goTo('login.htm');
    });
  };

  auth = authLogin;

  window.addEventListener('login-success', function (event) {
    var detail = event.detail;
    if (loginSuccess) {
      loginSuccess(detail.token, { closeWebviewId: detail.closeWebviewId });
    }
  });

})(app, mui);