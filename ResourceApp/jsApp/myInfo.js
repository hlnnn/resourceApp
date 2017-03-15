(function (app, mui, ko) {
  var vm, localMember,
    saveUrl = 'memberUpdateInfo',
    exitUrl = 'logout';

  function Member(member) {
    this.p1 = member.memberName;
    this.p2 = member.headImagePath();
    this.p3 = member.gender() === '女' ? -1 : 0;
    this.p4 = member.address;
    this.p5 = member.postcode;
    this.p6 = member.phoneNumber;
    this.p7 = member.areaId;
  }

  function ViewModel(member) {
    this.memberId = member.memberId;
    this.headImagePath = ko.observable(member.headImagePath);
    this.memberName = member.memberName;
    this.gender = ko.observable(member.gender ? '女' : '男');
    this.address = member.address;
    this.postcode = member.postcode;
    this.phoneNumber = member.phoneNumber;
    this.areaId = member.area.tableId;
    this.areaName = ko.observable(_.sprintf('%s %s %s', member.province.theName, member.city.theName, member.area.theName));
    var self = this;
    this.save = function () {
      var member = new Member(self);
      app.request.postActionAuth('tudwr', saveUrl, member, function (response) {
        if (response.result === 'success') {
          localMember = app.localStorage.setMemberResponse(response, function (t) {
            t.isRemember = localMember.isRemember;
            t.account = localMember.account;
            t.password = localMember.password;
            t.token = localMember.token;
          });
          var opener = plus.webview.currentWebview().opener();
          app.util.fire(opener, 'update-loginInfo', {
            headImagePath: localMember.headImagePath,
            memberName: localMember.memberName,
            phoneNumber: localMember.phoneNumber
          });
          mui.back();
        } else {
          app.messager.toast(response.info);
        }
      });
    };

    this.exit = function () {
      app.request.postActionAuth('tudwr', exitUrl, {
        memberId: self.memberId
      }, function (response) {
        if (response.result === 'success') {
          app.localStorage.setMember({
            isRemember: localMember.isRemember,
            account: localMember.account,
            password: localMember.password
          });
          var opener = plus.webview.currentWebview().opener();
          app.util.fire(opener, 'update-loginInfo', {});
          var customerWebview = plus.webview.getWebviewById('customerService.htm');
          app.util.fire(customerWebview, 'member-logout');
          mui.back();
        } else {
          app.messager.alert(response.info);
        }
      });
    };

    this.getPhoto = function () {
      var btnArray = [{
        title: "拍照或录像"
      }, {
        title: "选取现有的"
      }];
      plus.nativeUI.actionSheet({
        title: "选择照片",
        cancel: "取消",
        buttons: btnArray
      }, function (e) {
        var index = e.index;
        switch (index) {
          case 0:
            break;
          case 1:
            app.module.photo.getImage();
            break;
          case 2:
            app.module.photo.galleryImg();
            break;
        }
      });
    };
  }

  function initialize() {
    localMember = app.localStorage.getMember();
    vm = new ViewModel(localMember);
    ko.applyBindings(vm);

    app.module.photo.uploadHeadSuccess = function (response) {
      vm.headImagePath(response.imagePath);
    };
  }

  function events() {
    window.addEventListener('update-info', function (event) {
      var detail = event.detail,
        type = detail.type,
        record = detail.record;
      switch (type) {
        case 'area':
          vm.areaId = record.value;
          vm.areaName(record.text);
          break;
        case 'gender':
          vm.gender(record);
          break;
      }
    })
  }

  app.plusReady(initialize);

})(app, mui, ko);