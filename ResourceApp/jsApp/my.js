(function (app, mui, $, ko, _) {
  var member = app.localStorage.getMember();

  function ViewModel() {
    var headImagePath, memberName, phoneNumber;
    this.messageNumberVisible = ko.observable(false);
    if (member) {
      headImagePath = app.image.get(member.headImagePath, app.config.noImage);
      memberName = member.memberName;
      phoneNumber = member.phoneNumber;
      if (memberName) {
        this.messageNumberVisible(true);
      }
    } else {
      headImagePath = memberName = phoneNumber = undefined;
    }
    this.headImagePathVisible = ko.observable(!!headImagePath);
    this.headImagePath = ko.observable(headImagePath);
    this.memberName = ko.observable(memberName);
    this.phoneNumber = ko.observable(phoneNumber);
    this.messageNumber = ko.observable();
  }

  ViewModel.fn = ViewModel.prototype;
  ViewModel.fn.login = function () {
    app.util.goTo('login.htm');
  };
  ViewModel.fn.myinfo = function () {
    app.util.goToAuth('myInfo.htm');
  };
  ViewModel.fn.myorder = function () {
    app.util.goToAuth('myOrder.htm');
  };
  ViewModel.fn.myhouse = function () {
    app.util.goToAuth('myHouse.htm');
  };
  ViewModel.fn.msgbox = function () {
    app.util.goToAuth('myInformationList.htm');
  };
  ViewModel.fn.mycollect = function () {
    app.util.goTo('myCollection.htm');
  };
  ViewModel.fn.myqa = function () {
    app.util.goTo('myQuestion.htm');
  };
  ViewModel.fn.houseqa = function () {
    app.util.goTo('myHouseQuestion.htm', null, false);
  };
  ViewModel.fn.qrcode = function () {
    app.util.goTo('myQrCode.htm', null, false);
    //app.util.goTo('qrcode.htm');
  };
  ViewModel.fn.more = function () {
    app.util.goTo('myMore.htm', null, false);
  };

  var vm;

  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);
    
    refreshMessage();
    window.setTimeout(refreshMessage, 60 * 1000);
  }

  function refreshMessage() {
    if (member && member.token) {
      app.request.postActionAuth('tudwr', 'NoticeOfUnReadCount', {}, function (response) {
        if (response.result === 'success') {
          vm.messageNumber(response.unReadCount);
          window.setTimeout(refreshMessage, 60 * 1000);
        } else {
          app.messager.toast(response.info);
        }
      });
    }
  }

  function events() {
    window.addEventListener('update-loginInfo', function (event) {
      member = app.localStorage.getMember();
      refreshMessage();
      window.setTimeout(refreshMessage, 60 * 1000);

      vm.headImagePath(app.image.get(event.detail.headImagePath, app.config.noImage));
      vm.memberName(event.detail.memberName);
      vm.phoneNumber(event.detail.phoneNumber);
      vm.headImagePathVisible(!!event.detail.headImagePath);
      if(event.detail.memberName){
        vm.messageNumberVisible(true);
      }else{
        vm.messageNumberVisible(false);
      };
    });
    window.addEventListener('message-readed', function (event) {
      vm.messageNumber(vm.messageNumber() - 1);
    });
  }

  app.plusReady(initialize);
  events();

})(app, mui, jQuery, ko, _);