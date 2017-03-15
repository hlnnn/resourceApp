(function (app, mui, ko, $, _) {
  var viewModel;
  var companyTypePicker = function () {
    var picker = new mui.PopPicker();
    picker.setData(["私营企业", "个体工商户", "公务员或事业单位", "大型国企", "世界500强", "上市企业", "普通企业", "无固定职业"]);
    return picker;
  }();

  var nowYear = new Date().getYear() + 1900 - 16;
  var months = function () {
    var datas = [];
    for (var i = 0; i < 12; i++) {
      datas.push({ text: i + '月', value: i });
    }
    return datas;
  }();

  var birthYearPicker = function () {
    var picker = new mui.PopPicker();
    var years = [];
    for (var i = nowYear; i >= 1941; i--) {
      years.push(i);
    }
    picker.setData(years);
    return picker;
  }();

  var salaryTypePicker = function () {
    var picker = new mui.PopPicker();
    picker.setData(["银行转账", "现金", "银行转账+现金"]);
    return picker;
  }();

  var workingYearMonthPicker = new mui.PopPicker({ layer: 2 });

  function Consume(item) {
    this.type = 'consume';
    this.bankId = item.bankId;
    this.companyType = item.companyType();
    this.birthYear = item.birthYear();
    this.salaryType = item.salaryType(); // 工资
    this.salary = item.salary; // 工资
    this.workingYear = item.workingYear;
    this.workingMonth = item.workingMonth;

    this.isCreditCard = item.isCreditCard();
    this.creditCardCount = item.creditCardCount;
    this.creditCardLimit = item.creditCardLimit;
    this.isDebt = item.isDebt();
    this.debt = item.debt;
    this.isSucceedLoan = item.isSucceedLoan();
    this.isLoan = item.isLoan();
    this.loan = item.loan;

    this.cerName = item.cerName;
    this.phoneNumber = item.phoneNumber;
    this.icode = item.icode;
    this.email2 = item.email;
    this.extend = item.extend;
  }

  function validate1(consume) {
    return app.validate.require(consume.companyType, '公司类型') &&
      app.validate.require(consume.birthYear, '出生年份') &&
      app.validate.require(consume.salaryType, '工资发放') &&
      app.validate.require(consume.salary, '每月工资') &&
      app.validate.require(consume.workingYear, '您的工龄1') &&
      app.validate.require(consume.workingMonth, '您的工龄2');
  }

  function validate2(consume) {
    console.log(consume.email2)
    return validate1(consume) && app.validate.require(consume.cerName, '称呼') &&
      app.validate.validatePhone(consume.phoneNumber, '联系方式') &&
      app.validate.require(consume.icode, '手机验证码') &&
      app.validate.validateEMail(consume.email2, '电子邮箱') &&
      app.validate.require(consume.extend, '补充说明');
  }

  function ViewModel(extras) {
    app.module.ValidateCode.call(this, '#fff');
    this.codeType = 4;

    var self = this;
    this.logoImagePath = extras.logoImagePath;
    this.secondYearRate = extras.secondYearRate;
    this.theName = extras.theName;
    this.feature = extras.feature;

    this.bankId = extras.bankId;
    this.companyType = ko.observable();
    this.birthYear = ko.observable();
    this.salaryType = ko.observable();
    this.salary = '';
    this.workingYear = '';
    this.workingMonth = '';
    this.workingYearMonth = ko.observable();

    this.isCreditCard = ko.observable(0);
    this.creditCardCount = '';
    this.creditCardLimit = '';
    this.isDebt = ko.observable(0);
    this.debt = '';
    this.isSucceedLoan = ko.observable(0);
    this.isLoan = ko.observable(0);
    this.loan = '';

    this.cerName = '';
    this.phoneNumber = '';
    this.icode = '';
    this.email = '';
    this.extend = '';

    this.isCredit = ko.observable(false);
    this.isLink = ko.observable(false);

    this.next = function () {
      var consume = new Consume(self);
      if (self.isCredit()) {
        self.isCredit(false);
        self.isLink(true);
      } else {
        if (validate1(consume)) {
          self.isCredit(true);
        }
      }
    };

    this.submit = function () {
      var consume = new Consume(self);
      if (validate2(consume)) {
        app.request.postActionAuth('tudwr', 'LoanConsumptionCerAdd', consume, function (response) {
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

    this.companyTypeTap = function () {
      companyTypePicker.show(function (selectedItem) {
        self.companyType(selectedItem[0]);
      });
    };
    this.birthYearTap = function () {
      birthYearPicker.show(function (selectedItem) {
        self.birthYear(selectedItem[0]);
      });
    };
    this.salaryTypeTap = function () {
      salaryTypePicker.show(function (selectedItem) {
        self.salaryType(selectedItem[0]);
      });
    };
    this.workingYearMonthTap = function () {
      var year = self.birthYear();
      if (!year) {
        workingYearMonthPicker.setData([{ text: '0年', value: 0, children: months }]);
      } else {
        var datas = [];
        var loadYear = nowYear - year;
        for (var i = 0; i <= loadYear; i++) {
          datas.push({ text: i + '年', value: i, children: months });
        }
        workingYearMonthPicker.setData(datas);
      }
      workingYearMonthPicker.show(function (selectedItem) {
        self.workingYear = selectedItem[0].value;
        self.workingMonth = selectedItem[1].value || 0;
        self.workingYearMonth(selectedItem[0].text + selectedItem[1].text);
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
      viewModel.isCredit(true);
    } else if (viewModel.isCredit()) {
      viewModel.isCredit(false);
    } else {
      old_back();
    }
  };

  app.plusReady(initialize);

})(app, mui, ko, jQuery, _);