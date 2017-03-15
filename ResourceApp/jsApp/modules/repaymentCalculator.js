(function (app, mui, $, ko) {
  var city = app.cache.get('city'), //城市Id 
    cityId = city.tableId,
    vm,
    date = new Date(),
    now = date.getFullYear(),
    pickerRepaymentPeriod = new mui.PopPicker(),
    pickerRateTime = new mui.PopPicker(),
    pickerFirstRepayment = new mui.PopPicker({ layer: 2 }), //第一次还款时间
    pickerPredictYear = new mui.PopPicker({ layer: 2 }); //预计提前还款时间

  function DataArr(text, value, children) {
    this.text = text;
    this.value = value;
    this.children = children;
  }

  //原还款期限
  var repaymentPeriod = _.range(1, 31).map(function(el) {
      return new DataArr(el + '年' + '(' + el * 12 + ')' + '期', el);
    });
  pickerRepaymentPeriod.setData(repaymentPeriod);
  pickerRepaymentPeriod.pickers[0].setSelectedValue(20); //设置开始选中项

  //第一次还款时间
  var
    monthArr = _.range(1, 13).map(function (el) {
      return new DataArr(el + '月', el);
    }),
    firstRepayment = _.range(2005, now+1).map(function (el) {
    return new DataArr(el + '年', el, monthArr);
  });
  pickerFirstRepayment.setData(firstRepayment);
  pickerFirstRepayment.pickers[0].setSelectedValue(now);
  pickerFirstRepayment.pickers[1].setSelectedIndex(1);

  //预计提前还款时间

  var predictYear = _.range(2009, 2048).map(function(el) {
    return new DataArr(el + '年', el, monthArr);
  });
  pickerPredictYear.setData(predictYear);
  pickerPredictYear.pickers[0].setSelectedValue(now);
  pickerPredictYear.pickers[1].setSelectedIndex(1);

  function ViewModel() {
    var self = this;
    this.type = ko.observable('business');
    this.selectType = ko.pureComputed({
      read: function () {
        return self.type();
      },
      write: function (value) {
        self.type(value);
        ratePercent();
      }
    });
    this.totalLoan = ko.observable(0); //总额
    this.theYearCn = ko.observable('20年(240期)'); //还款期限
    this.theYear = ko.observable(20); //还款期限
    this.repaymentPeriodTap = function () { //还款期限
      pickerRepaymentPeriod.show(function (selectedItems) {
        self.theYearCn(selectedItems[0].text);
        self.theYear(selectedItems[0].value);
      });
    };
    this.rateTime = ko.observable();
    this.rateTimeTap = function () {
      pickerRateTime.show(function (selectedItems) {
        self.rateTime(selectedItems[0]);
        ratePercent();
      });
    };
    this.rate = ko.observable();
    this.firstPay = ko.observable('2017年2月');
    this.firstYear = ko.observable(2017); //第一次还款时间
    this.firstMonth = ko.observable(2);
    this.firstYearTap = function () {
      pickerFirstRepayment.show(function (selectedItems) {
        self.firstPay(selectedItems[0].text + selectedItems[1].text);
        self.firstYear(selectedItems[0].value);
        self.firstMonth(selectedItems[1].value);
      });
    };
    this.predictPay = ko.observable('2017年2月');
    this.predictYear = ko.observable(2017); //预计提前还款时间
    this.predictMonth = ko.observable(2);
    this.predictYearTap = function () {
      pickerPredictYear.show(function (selectedItems) {
        self.predictYear(selectedItems[0].text + selectedItems[1].text);
        self.predictYear(selectedItems[0].value);
        self.predictMonth(selectedItems[1].value);
      });
    };
    this.loanType = ko.observable('1');//提前还款方式
    this.handleType = ko.observable('1');//处理方式
    this.houseLoanCalculator = function () { //跳转房贷计算器
      app.util.goTo('houseLoanCalculator.htm');
    };
    this.calculatorResult = function () { //跳转计算结果
      var data = ko.toJS(self);
      checkCalculatorResult();
      if (checkCalculatorResult()) {
        app.util.goTo('repaymentCalculatorResult.htm', { data: data });
      }
    };
  }

  //贷款利率请求
  function loadRateName() {
    app.request.postAction('tdwr', 'LoanRateOfNameList', { p1: cityId }, function (response) {
      if (response.result === "success") {
        vm.rateTime(response.nameList[0]);
        pickerRateTime.setData(response.nameList);
        ratePercent();
      }
    });
  }

  //当时利率请求
  function ratePercent() {
    var model = { p1: vm.type(), p2: vm.theYear(), p3: vm.rateTime() };
    if (vm.theYear()) {
      app.request.postAction('tdwr', 'LoanRate', model, function (response) {
        vm.rate(response.loanRate);
      });
    }
  }

  function checkCalculatorResult() {
    if (!vm.totalLoan()) {
      app.messager.toast('请填写正确的贷款总额');
      return false;
    };
    if (!vm.rate()) {
      app.messager.toast('请填写正确的当时利率');
      return false;
    };
    return true;
  }

  function initialize() {
    loadRateName();
    vm = new ViewModel();
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko);
