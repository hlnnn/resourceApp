(function (mui, app, ko) {
  var type,
    tableId,
    title,
    dataPack;

  function ViewModel(item) {
    var self = this;
    this.memberId = item.memberId;
    //this.headImagePath = app.image.get(item.headImagePath, app.config.noImage);
    this.headImagePath = app.image.getLocal(item.headImagePath);
    this.memberName = item.memberName;
    this.company = item.company;
    this.phoneNumber = item.phoneNumber;
    this.areasOfSpecificity = item.areasOfSpecificity; //专长领域
    this.practisingCertificateNo = item.practisingCertificateNo; //执业证号
    this.awards = item.awards; //所获奖项
    this.address = item.address;

    this.store = item.store;
    this.starLevel = item.starLevel;
    this.introduction = item.introduction;
    this.saleHouseCount = item.saleHouseCount;
    this.rentHouseCount = item.rentHouseCount;
    this.pageAttribute = dataPack.pageAttribute;
    this.agentAttribute = dataPack.agentAttribute;
    this.starLevelArray = (function (starLevel) {
      var arr = [];
      for (var i = 0; i < starLevel; i++) {
        arr.push({ icon: 'icon-start mui-icon mui-icon-star' });
      }
      return arr;
    })(this.starLevel);

    this.title = title;
    this.sendSms = function () {
      if (self.phoneNumber) {
        sendSms(self.phoneNumber);
      } else {
        app.messager.toast('用户没有提供电话');
      }
    };
    this.message = function() {
      app.util.goToAuth('chat.htm');
    };
    this.goList = function(houseType) {
      app.util.goTo('developHouseList.htm', {
        type: houseType,
        brokerId: this.memberId
      });
    };
    app.module.ServiceCall.call(this, self.phoneNumber);
  }

  function sendSms(phone) {
    var msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS);
    msg.to = [phone];
    msg.body = '';
    plus.messaging.sendMessage(msg);
  }

  function DataPackBase() {
    this.pageAttribute = true;
    this.agentAttribute = false;
  };
  function DataPack() {
    this.other = function () {
      DataPackBase.call(this);
      this.requestUrl = 'ProfessionalDetail';
      this.responseData = 'professional';
    };
    this.agent = function () {
      DataPackBase.call(this);
      this.requestUrl = 'BrokerDetail';
      this.responseData = 'broker';
      this.pageAttribute = false;
      this.agentAttribute = true;
    };
  };

  function search() {
    app.request.postAction('tdwr', dataPack.requestUrl, { p1: tableId }, function (response) {
      if (response.result === 'success') {
        var vm = new ViewModel(response[dataPack.responseData]);
        ko.applyBindings(vm);
      } else {
        app.messager.toast('没有数据');
      }
    });
  };

  function initialize() {
    type = app.util.getExtrasValue('type');
    tableId = app.util.getExtrasValue('tableId');
    title = app.util.getExtrasValue('title');
    dataPack = new (new DataPack()[type === 'agent' ? 'agent' : 'other'])();
    search();
  }
  app.plusReady(initialize);
})(mui, app, ko);