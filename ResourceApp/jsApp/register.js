(function (app, mui, $, ko, _) {

  var vm;
  var old_back = mui.back;
  function Member() {
    this.phoneNumber = '';
    this.iCode = ko.observable();
    this.memberName = '';
    this.passWord = '';
    this.confirmPassword = '';
    this.isRead = ko.observable(true);
    this.disableCss = ko.observable(true);
    this.btnVerificationCode = ko.observable('获取验证码');
    this.email = '';
    this.company = '';
    this.store = '';
  }

  function ViewModel() {
    this.member = new Member();
    var i = 60;
    var self = this;
    var waitHandle;
    this.getVerificationCode = function (view, e) {
      //console.log(arguments);
      // 验证手机格式
      if (app.validate.validatePhone(self.member.phoneNumber)) {
        //app.util.disable(e.target);
        //self.member.disableCss(false);
        //// 页面数字
        //waitHandle = window.setInterval(function () { self.wait(e.target) }, 1000);
        //app.request.postAction('tdwr', 'IdentifyingCodeGet', {
        //  p1: 1,// 注册
        //  p2: self.member.phoneNumber
        //}, function (response) {
        //  app.messager.toast(response.info);
        //  if (response.result === 'success') {
        //    //app.messager.toast(response.info);
        //  }
        //});
        self.getCode(e, self.member.phoneNumber);
      }
    };

    this.wait = function (target) {
      if (i === 0) {
        self.member.btnVerificationCode('获取验证码');
        i = 60;
        self.member.disableCss(true);
        app.util.enable(target);
        window.clearInterval(waitHandle);
      } else {
        self.member.btnVerificationCode('(' + i + ')秒重试');
      }
      i--;
    }

    this.agree = function (view, e) {
      e.stopPropagation();
      app.util.goTo(e.target.href, { type: plus.webview.currentWebview().id });
    };

    this.register = function () {
      if (!app.validate.validatePhone(self.member.phoneNumber)) {
        return;
      }
      if (!self.validateRegister()) return;
      app.request.postAction('tdwr', 'RegistMember', {
        p1: self.member.phoneNumber,
        p2: self.member.iCode(),
        p3: self.member.memberName,
        p4: self.member.passWord,
        p5: self.member.confirmPassword,
        p6: app.localStorage.getCity().tableId
      }, function (response) {
        app.messager.toast(response.info);
        if (response.result === 'success') {
          old_back();
        }
      });
    };

    this.validateRegister = function () {
      if (!self.member.isRead()) {
        //验证是否阅读
        app.messager.toast('您必须同意用户协议');
        return false;
      }

      if (self.member.iCode() === '' || self.member.iCode() === undefined) {
        app.messager.toast('请输入验证码');
        return false;
      }
      if (self.member.memberName === '') {
        app.messager.toast('请输入用户名');
        return false;
      }
      if (self.member.passWord === '') {
        app.messager.toast('密码不能为空');
        return false;
      }
      if (self.member.passWord !== self.member.confirmPassword) {
        app.messager.toast('两次输入的密码不相同');
        return false;
      }
      return true;
    }

    this.getCode = function (e, codeType) {
      app.util.disable(e.target);
      self.member.disableCss(false);
      // 页面数字
      waitHandle = window.setInterval(function () { self.wait(e.target) }, 1000);
      app.request.postAction('tdwr', 'IdentifyingCodeGet', {
        p1: 1,// 注册
        p2: codeType
      }, function (response) {
        app.messager.toast(response.info);
        if (response.result === 'success') {

        }
      });
    }

    this.getEmailCode = function (view, e) {
      if (app.validate.validateEMail(self.member.email)) {
        self.getCode(e, self.member.email);
      }
    };
    this.registerBroker = function () {
      if (!self.validateRegister()) return;
      if (self.member.company === '') {
        app.messager.toast('公司名不能为空');
        return;
      }
      if (self.member.store === '') {
        app.messager.toast('门店名不能为空');
        return;
      }
      app.request.postAction('tdwr', 'RegistBroker', {
        p1: self.member.email,
        p2: self.member.memberName,
        p4: self.member.iCode(),
        p5: self.member.passWord,
        p6: self.member.confirmPassword,
        p7: self.member.company,
        p8: self.member.store,
        cityId: app.localStorage.getCity().tableId
      }, function (response) {
        app.messager.toast(response.info);
        if (response.result === 'success') {
          old_back();
        }
      });
    };
  }

  function initialize() {
    $.vm = vm = new ViewModel();
    ko.applyBindings(vm);
    events();
  }

  function events() {
    //document.getElementById('useragree').addEventListener('tap', function () {
    //  app.util.goTo(this.href);
    //  return false;
    //});

    //document.getElementById('btnVerificationCode').addEventListener('tap', function () {
    //  console.log(this.innerHTML);
    //  return false;
    //});
    mui.back = function () {
      app.messager.confirm(undefined, '你正在退出注册', ['是', '否'], function (e) {
        if (e.index === 0) {
          old_back();
        }
      });
    }
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)