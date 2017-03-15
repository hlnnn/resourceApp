(function (app, mui, $, ko, _) {
  function ViewModel() {
    this.account = '';
    this.validateCode = '';
    this.password = '';
    this.confirmPassword = '';
    this.waitHandle = '';
    this.disableCss = ko.observable(true);
    this.btnVerificationCode = ko.observable('获取验证码');
    this.i = 60;
  }
  ViewModel.fn = ViewModel.prototype;
  ViewModel.fn.getValidateCode = function (view, e) {
    //console.log(arguments);
    //console.log('getValidateCode');
    if (app.validate.validatePhone(this.account)) {
      app.util.disable(e.target);
      var me = this;
      this.disableCss(false);
      // 页面数字
      this.waitHandle = window.setInterval(function () { me.wait(e.target) }, 1000);
      app.request.postAction('tdwr', 'IdentifyingCodeGet', {
        p1: 2,// 重置密码
        p2: me.account
      }, function (response) {
        app.messager.toast(response.info);
        if (response.result === 'success') {

        }
      });
    }
  };
  ViewModel.fn.confirm = function () {
    if (!this.account) {
      app.messager.alert('请输入账号');
      return;
    }
    if (!this.validateCode) {
      app.messager.alert('请输入验证码');
      return;
    }
    if (!this.password) {
      app.messager.alert('请输入密码');
      return;
    }
    if (!this.confirmPassword) {
      app.messager.alert('请输入确认密码');
      return;
    }

    var model = {
      p1: this.account,
      p2: this.validateCode,
      p3: this.password,
      p4: this.confirmPassword
    };
    app.request.postAction('tdwr', 'ResetPassword', model, function (response) {
      if (response.result === 'success') {
        app.messager.toast(response.info);
        mui.back();
      } else {
        app.messager.toast(response.info);
      }
    });
  };

  ViewModel.fn.wait = function (target) {
    if (this.i === 0) {
      this.btnVerificationCode('获取验证码');
      this.i = 60;
      this.disableCss(true);
      app.util.enable(target);
      window.clearInterval(this.waitHandle);
    } else {
      this.btnVerificationCode('(' + this.i + ')秒重试');
    }
    this.i--;
  }

  function initialize() {
    var vm = new ViewModel();
    ko.applyBindings(vm);
    events();
  }

  function events() {
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)