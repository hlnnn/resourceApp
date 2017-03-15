// ValidateCode
(function (app, ko) {
  var i = 60, waitHandle;

  function ValidateCode(color) {
    this.btnVerificationCode = ko.observable('获取验证码');
    this.disableCss = ko.observable(true);
    this.color = ko.pureComputed(function () {
      return this.disableCss() ? color || '#ea3333' : '#ccc';
    }, this);
    this.codeType = 1;
    this.phoneNumber = '';

    var self = this;
    this.getVerificationCode = function (vm, e) {
      if (app.validate.validatePhone(self.phoneNumber)) {
        getCode(e, self.codeType, self.phoneNumber);
      }
    };

    function wait(target) {
      if (i === 0) {
        self.btnVerificationCode('获取验证码');
        i = 60;
        self.disableCss(true);
        app.util.enable(target);
        window.clearInterval(waitHandle);
      } else {
        self.btnVerificationCode('(' + i + ')秒重试');
      }
      i--;
    }

    function getCode(e, codeType, account) {
      app.util.disable(e.target);
      self.disableCss(false);
      // 页面数字
      waitHandle = window.setInterval(function () { wait(e.target) }, 1000);
      app.request.postAction('tdwr', 'IdentifyingCodeGet', {
        p1: codeType, // 注册
        p2: account
      }, function (response) {
        console.log(response.code);
        app.messager.toast(response.info);
      });
    }
  }

  app.module.ValidateCode = ValidateCode;
})(app, ko);