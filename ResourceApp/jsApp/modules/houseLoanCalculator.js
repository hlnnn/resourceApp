(function (app, mui, $, ko) {
  var city = app.cache.get('city'), //城市Id 
    cityId = city.tableId,
    vm,
    pickerRatio = new mui.PopPicker(),
    pickerBussinessYear = new mui.PopPicker(),
    pickerProvidentFundYear = new mui.PopPicker(),
    pickerBusiness = new mui.PopPicker(),
    pickerProvidentFund = new mui.PopPicker();

  //弹出数据源
  function DataArr(text, value) {
    this.text = text;
    this.value = value;
  }

  var
    ratioArr = _.range(2, 9).map(function (el) {
      return new DataArr(el + '成', el / 10);
    }),
    yeaArr = _.range(1, 30).map(function (el) {
      return new DataArr(el + '年', el);
    });

  function ViewModel(extras) {
    var self = this;
    self.unitPrice = ko.observable(extras.unitPrice);
    self.square = ko.observable(extras.square);
    self.isFirst = ko.observable();
    self.meetFiveYears = ko.observable();
    self.isSingle = ko.observable();
    self.percentCn = ko.observable('7成');
    self.percent = ko.observable(0.7);
    self.businessLoan = ko.observable(0);
    self.providentFundLoan = ko.observable(0);
    self.payWay = ko.observable('1');

    self.businessAmount = ko.computed({ //商业贷款
      read: function () {
        if (self.unitPrice() || self.square()) {
          self.businessLoan((self.percent() * self.unitPrice() * self.square() / 10000).toFixed(0));
        }
        return self.businessLoan();
      },
      write: function (value) {
        if (value > self.businessLoan()) {
          app.messager.toast('您输入的贷款金额大于按揭成数');
        };
      },
      owner: this
    });
    self.providentFundAmount = ko.computed({ //公积金贷款
      read: function () {
        return self.providentFundLoan();
      },
      write: function (value) {
        if (value > self.providentFundAmount()) {
          app.messager.toast('您输入的贷款金额大于按揭成数');
        };
      }
    }, this);
    self.isHide = ko.computed(function () {
      var daikuan = parseInt(self.businessLoan()) + parseInt(self.providentFundLoan());
      var zongjia = parseFloat((self.percent() * self.unitPrice() * self.square() / 10000).toFixed(0));
      return daikuan <= zongjia;
    }, this);
    self.businessRateTime = ko.observable(0); //商业贷款利率
    self.businessRate = ko.observable(0); //商业贷款当时利率
    self.businessYearCn = ko.observable('20年'); //商业按揭年数
    self.businessYear = ko.observable(20); //商业按揭年数
    self.providentFundLoan = ko.observable(0); //公积金贷款
    self.providentFundRateTime = ko.observable(0); //公积金贷款利率
    self.providentFundRate = ko.observable(0); //公积金当时利率

    self.providentFundYearCn = ko.observable('20年'); //公积金按揭年数
    self.providentFundYear = ko.observable(20); //公积金按揭年数

    self.syName = ko.observable(''); //贷款名称
    self.gjjName = ko.observable('');
    self.theType = ko.observable(''); //贷款类型

    pickerRatio.setData(ratioArr);
    pickerRatio.pickers[0].setSelectedValue(7); //设置开始选中项
    self.percentTap = function () { //按揭成数点击
      pickerRatio.show(function (selectedItems) {
        self.percentCn(selectedItems[0].text);
        self.percent(selectedItems[0].value);
      });
    };
    self.businessRateTimeTap = function () { //商业利率点击
      pickerBusiness.show(function (selectedItems) {
        self.businessRateTime(selectedItems[0]);
        businessRatePercent();
      });
    }
    self.providentFundRateTimeTap = function () { //公积金利率点击
      pickerProvidentFund.show(function (selectedItems) {
        self.providentFundRateTime(selectedItems[0]);
        providentFundRatePercent();
      });
    }

    pickerBussinessYear.setData(yeaArr);
    pickerProvidentFundYear.setData(yeaArr);
    pickerBussinessYear.pickers[0].setSelectedValue(20); //设置开始选中项
    pickerProvidentFundYear.pickers[0].setSelectedValue(20);
    self.businessRear = function () { //商业按揭年数
      pickerBussinessYear.show(function (selectedItems) {
        self.businessYearCn(selectedItems[0].text);
        self.businessYear(selectedItems[0].value);
        businessRatePercent();
      });
    }
    self.providentFundRear = function () { //住房公积金按揭年数
      pickerProvidentFundYear.show(function (selectedItems) {
        self.providentFundYearCn(selectedItems[0].text);
        self.providentFundYear(selectedItems[0].value);
        providentFundRatePercent();
      });
    };

    //提前还款
    self.prepayment = function () {
      app.util.goTo('repaymentCalculator.htm');
      //app.messager.unopened();
    };
    self.addUp = function () { //开始计算
      checkAddUp();
      var data = ko.toJS(self);
      if (checkAddUp()) {
        app.util.goTo('houseLoanCalculatorOutput.htm', {
          data: data
        });
      }
    };
  }

  function checkAddUp() {
    if (!vm.unitPrice()) {
      app.messager.toast('请填写正确的房屋单价');
      return false;
    }
    if (!vm.square()) {
      app.messager.toast('请填写正确的房屋面积');
      return false;
    }
    if (!vm.isFirst()) {
      app.messager.toast('请选择是否为首套');
      return false;
    }
    if (!vm.meetFiveYears()) {
      app.messager.toast('请选择房产证是否满5年');
      return false;
    }
    if (!vm.isSingle()) {
      app.messager.toast('请选择是否唯一房产');
      return false;
    }
    if (!vm.businessAmount() || vm.providentFundAmount()) {
      app.messager.toast('请填写贷款额');
      return false;
    }
    if (!vm.businessRate() || !vm.providentFundRate()) {
      app.messager.toast('请填写当时利率');
      return false;
    }
    return true;
  }

  //商业贷款利率请求
  function loadRateName() {
    app.request.postAction('tdwr', 'LoanRateOfNameList', {
      p1: cityId
    }, function (response) {
      if (response.result === 'success') {
        vm.businessRateTime(response.nameList[0]);
        vm.providentFundRateTime(response.nameList[0]);

        pickerBusiness.setData(response.nameList);
        pickerProvidentFund.setData(response.nameList);

        businessRatePercent();
        providentFundRatePercent();
      }
    });
  }

  //商业当时利率请求
  function businessRatePercent() {
    var model = {
      p1: 'business',
      p2: vm.businessYear(),
      p3: vm.businessRateTime()
    };
    app.request.postAction('tdwr', 'LoanRate', model, function (response) {
      vm.businessRate(response.loanRate);
    });
  }

  //公积金当时利率请求
  function providentFundRatePercent() {
    var model = {
      p1: 'providentFund',
      p2: vm.providentFundYear(),
      p3: vm.providentFundRateTime()
    };
    app.request.postAction('tdwr', 'LoanRate', model, function (response) {
      vm.providentFundRate(response.loanRate);
    });
  }

  function initialize() {
    var extras = app.util.getExtras()||{};    
    vm = new ViewModel(extras);
    loadRateName();
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko);