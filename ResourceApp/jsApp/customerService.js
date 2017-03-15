(function (app, mui, ko, $, _) {
  var vm;

  function ViewModel(item) {
    this.serviceList = ko.observableArray();
    this.friendsList = ko.observableArray();
    this.chat = function () {
      app.util.goTo('chat.htm');
    }
  }

  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);

    var city = app.localStorage.getCity();
    bindServiceList(city.tableId);
    bindFirends();
  }

  // 客服
  function bindServiceList(cityId) {
    app.request.postActionAuth('tudwr', 'AdminServiceList', {
      p1: cityId
    }, function (response) {
      vm.serviceList.removeAll();
      if (response.result === 'success') {
        var serviceList = response.friendList;
        _.each(serviceList, function (el) {
          el.headImagePath = app.image.local(el.headImagePath);
          vm.serviceList.push(el);
        });
      } else {
        app.messager.toast(response.info);
      }
    });
  }
  //好友
  function bindFirends() {
    function toFriend(item) {
      item.typeName = '';
      if (item.type === 1) {
        item.typeName = '[普通会员]';
      } else if (item.type === 2) {
        item.typeName = '[律师]';
      } else if (item.type === 3) {
        item.typeName = '[验房/测绘]';
      } else if (item.type === 4) {
        item.typeName = '[设计师]';
      } else {
        item.typeName = '[经纪人]';
      }
      item.headImagePath = app.image.local(item.headImagePath);
      return item;
    }
    app.request.postActionAuth('tudwr', 'MemberFriendList', {}, function (response) {
      if (response.result === 'success') {
        var friendsList = response.friendList;
        _.each(friendsList, function (el) {
          vm.friendsList.push(toFriend(el));
        });
      } else {
        app.messager.toast(response.info);
      }
    });
  }

  function events() {
    window.addEventListener('reload', function (event) {
      var cityId = event.detail.cityId;
      bindServiceList(cityId);
    });

    window.addEventListener('member-logout', function (event) {
      mui.currentWebview.loadURL('customerNotLogin.htm');
    });
  }

  events();
  app.plusReady(initialize);

})(app, mui, ko, jQuery, _);