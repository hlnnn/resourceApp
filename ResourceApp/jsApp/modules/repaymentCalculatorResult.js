(function (app, mui, $, ko) {
  var extras,
    data,
    vm;

  function ViewModel() {
    var self = this;
    self.originalRepayment = originalRepayment() + '元';
    self.lastDate = lastDate();
    self.unRepayment = unRepayment() + '元';
    self.interestPaid = unRepaymentInterest() + '元';//已还利息
    self.monthly = onceRepayment() + '元';  //该月一次还款额
    self.nextMonth = nextMonthRepayment();  //下月起还款额
    self.interestExpense = saveInterest() + '元'; //节省利息支出
    self.newDate = newDate();
    self.goBankingFinance = function () {
      app.util.goTo('bankingFinance.htm');
    }; //申请贷款
  }

  //月利率
  function monthRate() {
    return data.rate / 100 / 12;
  }

  //原月还款额精确值
  function exactOriginalRepayment() {
    if (data.theYear) {
      return data.totalLoan * 10000 * monthRate() * Math.pow((1 + monthRate()), data.theYear * 12) / ((Math.pow((1 + monthRate()), data.theYear * 12)) - 1);
    }
    return '';
  }

  //原月还款额
  function originalRepayment() {
    return exactOriginalRepayment().toFixed(2);
  }

  //原最后还款期
  function lastDate() {
    if (data.theYear && data.firstYear) {
      if (data.firstMonth === 1) {
        return (parseInt(data.firstYear) + parseInt(data.theYear) - 1) + "年12月";
      } else {
        return (parseInt(data.firstYear) + parseInt(data.theYear)) + "年" + (data.firstMonth - 1) + "月";
      }
    }
    return '';
  }

  function unRepaymentTime() {
    //提前还款月份<=第一次还款月
    if (data.predictMonth <= data.firstMonth) {
      return (data.predictYear - data.firstYear - 1) * 12 + parseInt(data.predictMonth) + 12 - data.firstMonth;
    }
    else {
      return (data.predictYear - data.firstYear) * 12 + parseInt(data.predictMonth) - data.firstMonth;
    }
  }

  //已还款总额精确值
  function exactUnRepayment() {
    if (data.firstYear) {
      return exactOriginalRepayment() * unRepaymentTime();
    }
    return '';
  }

  //已还款总额
  function unRepayment() {
    return exactUnRepayment().toFixed(2);
  }

  //已还利息额精确值
  function exactUnRepaymentInterest() {
    return exactUnRepayment() - (exactOriginalRepayment() - data.totalLoan * 10000 * monthRate()) * (Math.pow(1 + monthRate(), unRepaymentTime()) - 1) / monthRate();
  }

  //已还款利息
  function unRepaymentInterest() {
    return exactUnRepaymentInterest().toFixed(2);
  }

  //剩余还款时间 Z
  function remainRepaymentTime() {
    return data.theYear * 12 - unRepaymentTime() - 1;
  }

  //该月一次还款额
  function onceRepayment() {
    //一次还清
    if (data.loanType === "1") {
      return (exactOriginalRepayment() / monthRate() * (1 - (1 / (Math.pow(1 + monthRate(), remainRepaymentTime())))) + exactOriginalRepayment()).toFixed(2);
    } else { //部分提前还款
      return (data.prepayment * 10000 + exactOriginalRepayment()).toFixed(2);
    }
  }

  //还了部分钱后,还剩多少月来还清
  function remainMonthsToPayoff() {
    var temp = 1 / (1 - left() * monthRate() / exactOriginalRepayment());
    var U = Math.log(temp) / Math.log(1 + monthRate());
    return Math.floor(U);
  }

  //下月起月还款额
  function nextMonthRepayment() {
    //一次还清
    if (data.handleType === "1") {
      return 0;
    } else {//部分提前还款
      //缩短期限月还款不变
      if (data.handleType === "1") {
        var temp = 1 - 1 / (Math.pow(1 + monthRate(), remainMonthsToPayoff()));
        var G = left() * monthRate() / temp;
        if (isNaN(G)) G = 0;
        return G.toFixed(2);
      } else {//减少月还款期限不变
        var K = data.prepayment * 10000 * monthRate() / (1 - (1 / Math.pow(1 + monthRate(), remainRepaymentTime())));
        return (exactOriginalRepayment() - K).toFixed(2);
      }
    }
  }

  //节省利息支出
  function saveInterest() {
    //一次还清
    if (data.loanType === "1") {
      var H = exactOriginalRepayment() * data.theYear * 12 - data.totalLoan * 10000 - exactUnRepaymentInterest() - exactOriginalRepayment() * (1 - (1 / Math.pow(1 + monthRate(), remainRepaymentTime())));
      return H.toFixed(2);
    }
    else//部分提前还款
    {
      //缩短期限月还款不变
      if (data.handleType === "1") {
        var H = exactOriginalRepayment() * data.theYear * 12 - exactUnRepayment() - onceRepayment() - nextMonthRepayment() * remainMonthsToPayoff();
        if (isNaN(H)) H = 0;
        return H.toFixed(2);
      }
      else//减少月还款期限不变
      {
        var H = exactOriginalRepayment() * data.theYear * 12 - exactUnRepayment() - onceRepayment() - nextMonthRepayment() * remainRepaymentTime();
        return H.toFixed(2);
      }
    }
  }

  //新的最后还款期
  function newDate() {
    if (data.predictYear) {
      //一次还清
      if (data.loanType === "1") {
        return data.predictYear + "年" + data.predictMonth + "月";
      } else { //部分提前还款
        //缩短期限月还款不变
        if (data.handleType === "1") {
          if (isNaN(remainMonthsToPayoff())) return "";
          if (remainMonthsToPayoff() === Number.POSITIVE_INFINITY || remainMonthsToPayoff() === Number.NEGATIVE_INFINITY) return "";
          var totalMonth = data.predictYear * 12 + parseInt(data.predictMonth) + parseInt(remainMonthsToPayoff());
          if (totalMonth % 12 === 0) {
            return (Math.floor(totalMonth / 12) - 1) + "年" + 12 + "月";
          } else {
            return Math.floor(totalMonth / 12) + "年" + totalMonth % 12 + "月";
          }
        } else { //减少月还款期限不变
          return lastDate();
        }
      }
    }
    return '';
  }

  function initialize() {
    extras = app.util.getExtras() || {},
    data = extras.data || {};
    vm = new ViewModel();
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko);
