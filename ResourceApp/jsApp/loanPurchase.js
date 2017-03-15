(function (app, mui, ko, _) {

  var picker = new mui.PopPicker();
  picker.setData(["商品房>90m²", "商品房≤90m²", "整体式商铺", "隔断式商铺", "商住两用房", "写字楼", "小产权房", "房改房", "经济适用房"]);
  var viewModel;

  function Purchase(item) {
    this.type = 'purchase';
    this.bankId2 = item.bankId;
    this.houseType = item.houseType(); // 房屋类型
    this.isFirst = item.isFirst(); // 是否首套房
    this.isSecondHouse = item.isSecondHouse(); // 是否二手房
    this.salary2 = item.salary; // 工资

    this.cerName2 = item.cerName;
    this.phoneNumber2 = item.phoneNumber;
    this.icode2 = item.icode;
    this.email2 = item.email;

    this.extend2 = item.extend;
  }

  function validate1(purchase) {
    return app.validate.require(purchase.houseType, '房屋类型') &&
      app.validate.require(purchase.salary2, '入卡工资');
  }

  function validate2(purchase) {
    return validate1(purchase) && app.validate.require(purchase.cerName2, '称呼') &&
      app.validate.validatePhone(purchase.phoneNumber2, '联系方式') &&
      app.validate.require(purchase.icode2, '手机验证码') &&
      app.validate.validateEMail(purchase.email2, '电子邮箱') &&
      app.validate.require(purchase.extend2, '补充说明');
  }

  function ViewModel(extras) {
    app.module.ValidateCode.call(this, '#fff');
    this.codeType = 4;

    var self = this;
    this.firstYearRate = extras.firstYearRate;
    this.logoImagePath = extras.logoImagePath;
    this.monthRage = extras.monthRage;
    this.secondYearRate = extras.secondYearRate;
    this.theName = extras.theName;
    this.feature = extras.feature;

    this.bankId = extras.bankId;
    this.houseType = ko.observable(); // 房屋类型
    this.isFirst = ko.observable(1); // 是否首套房
    this.isSecondHouse = ko.observable(1); // 是否二手房
    this.salary = ''; // 工资

    this.cerName = '';
    this.phoneNumber = '';
    this.icode = '';
    this.email = '';
    this.extend = '';


    this.isLink = ko.observable(false);

    this.next = function () {
      var purchase = new Purchase(self);
      if (validate1(purchase)) {
        self.isLink(true);
      }
    };

    this.submit = function () {
      var purchase = new Purchase(self);

      if (validate2(purchase)) {
        app.request.postActionAuth('tudwr', 'LoanPurchaseHouseCerAdd', purchase, function (response) {
          if (response.result === 'success') {
            app.util.goTo('loanSuccessful.htm', {
              closeWebviewId: plus.webview.currentWebview().id
            });
          } else {
            app.messager.toast(response.info);
          }
        });
      }
    };

    this.houseTap = function () {
      picker.show(function (selectedItem) {
        self.houseType(selectedItem[0]);
      });
    };
  }

  function initialize() {
    var extras = app.util.getExtras();
    viewModel = new ViewModel(extras);
    ko.applyBindings(viewModel);
  }

  var old_back = mui.back;
  mui.back = function () {
    if (viewModel.isLink()) {
      viewModel.isLink(false);
    } else {
      old_back();
    }
  };

  app.plusReady(initialize);

})(app, mui, ko, _);