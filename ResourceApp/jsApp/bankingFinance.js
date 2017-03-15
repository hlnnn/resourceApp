(function (app, mui, ko, $, _) {
  var city = app.cache.get('city');
  var vm;

  //function ResultItem(item) {
  //  this.firstYearRate = item.firstYearRate;
  //  this.logoImagePath = item.logoImagePath;
  //  this.monthRage = item.monthRage;
  //  this.secondYearRate = item.secondYearRate;
  //  this.theName = item.theName;
  //  this.feature = item.feature;
  //  this.secondYearRate = item.secondYearRate;
  //}

  function ViewModel() {
    this.bankList = ko.observableArray();
    this.consumeList = ko.observableArray();

    this.connect = function () {
      app.util.goTo('developing.htm');
      //app.messager.unopened();
    };
    
    this.loanPurchase = function (record) {
      app.util.goToAuth('loanPurchase.htm', {
        firstYearRate: record.firstYearRate,
        logoImagePath: record.logoImagePath,
        monthRage: record.monthRage,
        secondYearRate: record.secondYearRate,
        theName: record.theName,
        feature: record.feature,
        bankId: record.tableId
      });
    };

    this.loanConsume = function (record) {
      app.util.goToAuth('loanConsume.htm', {
        logoImagePath: record.logoImagePath,
        secondYearRate: record.secondYearRate,
        theName: record.theName,
        feature: record.feature,
        bankId: record.tableId
      });
    };

    app.module.ServiceCall.call(this, '400-663-8008');
  }

  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);
    bindBankList();
    bindConsumeList();
  }

  // 绑定购房贷款申请
  function bindBankList() {
    app.request.postAction('tdwr', 'BankListForPurchase', {
      p1: city.tableId
    }, function (response) {
      if (response.result === 'success') {
        var bankList = response.bankList;
        for (var i = 0; i < bankList.length; i++) {
          vm.bankList.push(bankList[i]);
        }
      } else {
        app.messager.toast(response.info);
      }
    });
  }

  //绑定消费贷款申请
  function bindConsumeList() {
    app.request.postAction('tdwr', 'BankListForConsume', {
      p1: city.tableId
    }, function (response) {
      if (response.result === 'success') {
        var bankList = response.bankList;
        for (var i = 0; i < bankList.length; i++) {
          vm.consumeList.push(bankList[i]);
        }
      } else {
        app.messager.toast(response.info);
      }
    });
  }

  app.plusReady(initialize);

})(app, mui, ko, jQuery, _);