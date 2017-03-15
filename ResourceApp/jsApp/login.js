(function (app, mui, $, ko, _) {

  var memberLoginAction = 'LoginMember',
    brokerLoginAction = 'LoginBroker';

  function ViewModel() {
    this.account = '15062324689';
    this.password = '888888';
    this.isRemember = false;
  }

  ViewModel.fn = ViewModel.prototype;
  ViewModel.fn.forgetPassword = function () {
    app.util.goTo('forgetPassword.htm');
  };
  ViewModel.fn.registerMember = function () {
    app.util.goTo('registerMember.htm');
  };
  ViewModel.fn.registerBroker = function () {
    app.util.goTo('registerBroker.htm');
  };
  ViewModel.fn.login = function (view, event) {
    if (!this.account) {
      app.messager.toast('请输入账号');
      return;
    }
    if (!this.password) {
      app.messager.toast('请输入密码');
      return;
    }
    var action = this.account.indexOf('@') > 0 ? brokerLoginAction : memberLoginAction;

    var self = this,
      model = encode();
    //console.log(model);
    app.request.postAction('tdwr', action, model, event.target, function (response) {
      if (response.result === 'success') {
        var localMember = app.localStorage.setMemberResponse(response, function (t) {
          t.isRemember = self.isRemember;
          t.account = self.account;
          t.password = self.password;
          t.token = response.token;
        });
        var my = plus.webview.getWebviewById('my.htm');
        //var opener = plus.webview.currentWebview().opener();
        app.util.fire(my, 'update-loginInfo', {
          headImagePath: localMember.headImagePath,
          memberName: localMember.memberName,
          phoneNumber: localMember.phoneNumber
        });
        
        var customerWebview = plus.webview.getWebviewById('customerService.htm');        
        app.util.fire(customerWebview, 'member-login');
        
        var back = app.util.getExtrasValue('back');
        if (back) {
          mui.back();
          return;
        }

        var current = plus.webview.currentWebview(),
          opener = current.opener();
        if (my.id === opener.id) {
          mui.back();
        } else {
          app.util.fire(opener, 'login-success', {
            token: localMember.token,
            closeWebviewId: current.id
          });
        }
      } else {
        app.messager.toast(response.info);
      }
    });

    function encode() {
      var time = new Date().getTime(),
        md5 = MD5.hexdigest(self.account + ',' + self.password + ',' + time),
        p1 = Base64.encode(self.account + ',' + time + ',' + md5),
        mei = window.plus ? plus.device.imei : 'plus.device.imei';
      return {
        p1: p1,
        skey: mei
      };
    }
  }

  function initialize() {
    var vm = new ViewModel();
    var member = app.localStorage.getMember();
    if (member) {
      if (member.isRemember) {
        vm.isRemember = member.isRemember;
        vm.account = member.account;
        vm.password = member.password;
      }
    }
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)