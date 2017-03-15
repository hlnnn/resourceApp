; (function (app, mui, $, ko, _) {
  var city = app.cache.get('city'), //城市Id 
    cityId = city.tableId,
    type;

  function DataPack() {
    this.saleHouse = function () {
      this.title = '发布出售';
      this.requestUrl = 'PublishSaleHouseFirst';
    };
    this.rentHouse = function () {
      this.title = '发布出租';
      this.requestUrl = 'PublishRentHouseFirst';
    };
    this.wantedBuyHouse = function () {
      this.title = '发布求购';
      this.requestUrl = 'PublishWantedBuyHouseFirst';
    };
    this.wantedRentHouse = function () {
      this.title = '发布求租';
      this.requestUrl = 'PublishWantedRentHouseFirst';
    };
  }

  function SetContent(item) {
    this.cityId = cityId;
    this.getSource = item.getSource();
    this.getGender = item.getGender();
    this.theName = item.theName();
    this.phoneNumber = item.phoneNumber;
    this.icode = item.icode;
  }

  function validate(setContent) {
    return app.validate.require(setContent.theName, '联系人') &&
      app.validate.validatePhone(setContent.phoneNumber) &&
      app.validate.require(setContent.icode, '手机验证码');
  }

  function ViewModel(dataPack) {
    app.module.ValidateCode.call(this, '#fff');
    this.codeType = 3;

    var self = this;
    this.title = dataPack.title;
    this.cityId = '';
    this.getSource = ko.observable('sourceZhiWu');
    this.getGender = ko.observable('1');
    this.theName = ko.observable();
    this.phoneNumber = '';
    this.icode = '';
    this.isRead = ko.observable(false);

    this.goAgentPublish = function () {
      app.util.goTo('personalList.htm', { type: 'agent' });
    }; //找经纪人
    this.serviceStatement = function () {
      app.util.goTo('agreeStatement.htm', { type: 'lawyer' });
    };
    this.goNext = function () {
      var model = new SetContent(self);
      if (validate(model)) {
        if (!self.isRead()) {
          app.messager.toast('请先阅读法律声明，同意后才能继续');
        } else {
          app.request.postActionAuth('tudwr', dataPack.requestUrl, model, function (response) {
            if (response.result === 'success') {
              app.util.goTo('publishHouseSecond.htm', { type: type, tableId: response.tableId }, false);
            }
          });
        };
      }
    };
   }
   
  function initialize() {
    var extras = app.util.getExtras();
    type = extras.type||{};
    var dataPack = new (new DataPack()[type])();

    var vm = new ViewModel(dataPack);
    ko.applyBindings(vm);
  }
  app.plusReady(initialize);

})(app, mui, jQuery, ko, _);