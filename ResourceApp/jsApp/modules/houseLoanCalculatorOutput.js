(function (app, mui, $, ko) {
  var data,
    vm;
  
  function formatNumberRgx(num) {
    var parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  function ViewModel() {
    var self = this;
    self.totalPrice = formatNumberRgx(totalPrice());
    self.loan = formatNumberRgx(loan()); //贷款金额
    self.firstPay = formatNumberRgx(firstPay());
    self.yinhuaTax = formatNumberRgx(yinhuaTax()) + '元'; //印花税
    self.qiTax = formatNumberRgx(qiTax()) + '元';
    self.yingyeTax = formatNumberRgx(yingyeTax()) + '元';
    self.incomeTax = formatNumberRgx(incomeTax()) + '元';
    self.totalTax = formatNumberRgx(totalTax()) + '元';
    if (data.payWay === '1') {
      self.interestOfBenxi = ko.observable(formatNumberRgx(businessInterestOfBenxi()) + '元');
      self.totalOfBenxi = ko.observable(formatNumberRgx(businessTotalOfBenxi()) + '元'); //还款额
      self.monthOfBenxi = ko.observable(formatNumberRgx(businessMonthOfBenxi()) + '元');
    } else { //等额本金
      self.interestOfBenxi = ko.observable(formatNumberRgx(businessInterestOfBenjin()) + '元');
      self.totalOfBenxi = ko.observable(formatNumberRgx(businessTotalOfBenjin()) + '元'); //还款额
      self.monthOfBenxi = ko.observable(formatNumberRgx(businessMonthOfBenjin()) + '元');
    }

    self.goBankingFinance = function() {
      app.util.goTo('bankingFinance.htm');
    };
    self.typeTap = ko.pureComputed({
      read: function () {
        
      },
      write: function (value) {
        if (data.payWay === '1') {
          principalBenxi(value);
        } else {
          principalBenjin(value);
        }
      } 
    });
  }

  //等额本息
  function principalBenxi(value) {
    if (value === 'business') {
      vm.interestOfBenxi(formatNumberRgx(businessInterestOfBenxi()) + '元');
      vm.totalOfBenxi(formatNumberRgx(businessTotalOfBenxi()) + '元'); //还款额
      vm.monthOfBenxi(formatNumberRgx(businessMonthOfBenxi()) + '元');
    } else if (value === 'providentFund') {
      vm.interestOfBenxi(formatNumberRgx(providentFundInterestOfBenxi()) + '元');
      vm.totalOfBenxi(formatNumberRgx(providentFundTotalOfBenxi()) + '元'); //还款额
      vm.monthOfBenxi(formatNumberRgx(providentFundMonthOfBenxi()) + '元');
    } else if (value === 'sum') {
      vm.interestOfBenxi(formatNumberRgx(totalInterestOfBenxi()) + '元');
      vm.totalOfBenxi(formatNumberRgx(totalOfBenxi()) + '元'); //还款额
      vm.monthOfBenxi(formatNumberRgx(totalMonthOfBenxi()) + '元');
    }
  }

  //等额本金
  function principalBenjin(value) {
    if (value === 'business') {
      vm.interestOfBenxi(businessInterestOfBenjin() + '元');
      vm.totalOfBenxi(businessTotalOfBenjin() + '元'); //还款额
      vm.monthOfBenxi(businessMonthOfBenjin() + '元');
    } else if (value === 'providentFund') {
      vm.interestOfBenxi(providentFundInterestOfBenjin() + '元');
      vm.totalOfBenxi(providentFundTotalOfBenjin() + '元'); //还款额
      vm.monthOfBenxi(providentFundMonthOfBenjin() + '元');
    } else if (value === 'sum') {
      vm.interestOfBenxi(totalInterestOfBenjin() + '元');
      vm.totalOfBenxi(totalOfBenjin() + '元'); //还款额
      vm.monthOfBenxi(totalMonthOfBenjin() + '元');
    }
  }

  //总计
  function totalPrice() {
    return (data.unitPrice * data.square).toFixed(0);
  }

  //贷款金额
  function loan() {
    return parseInt(data.businessLoan * 10000) + parseInt(data.providentFundLoan * 10000);
  }

  //首期付款
  function firstPay() {
    return (totalPrice() - loan()).toFixed(0);
  }

  //印花税
  function yinhuaTax() {
    return parseInt(totalPrice() * 0.05 / 100);
  }

  //契税
  function qiTax() {  
    if (data.isFirst == null || data.meetFiveYears == null || data.isSingle == null) {
      return 0;
    }
    else if (data.isFirst === '1' && data.meetFiveYears === '1' && data.isSingle === '1') {
      if (data.square < 90) {
        return parseInt(totalPrice() * 1 / 100);
      } else if (data.square >= 90 && data.square < 144) {
        return parseInt(totalPrice() * 1.5 / 100);
      } else {
        return parseInt(totalPrice() * 3 / 100);
      }
    }
    else if (data.isFirst === '1' && data.meetFiveYears === '1' && data.isSingle === '0') {
      if (data.square() < 90) {
        return parseInt(totalPrice() * 1 / 100);
      } else if (data.square >= 90 && data.square < 144) {
        return parseInt(totalPrice() * 1.5 / 100);
      } else {
        return parseInt(totalPrice() * 3 / 100);
      }
    } else if (data.isFirst === '1' && data.meetFiveYears === '0' && data.isSingle === '1') {
      if (data.square() < 90) {
        return parseInt(totalPrice() * 1 / 100);
      } else if (data.square >= 90 && data.square < 144) {
        return parseInt(totalPrice() * 1.5 / 100);
      } else {
        return parseInt(totalPrice() * 3 / 100);
      }
    } else if (data.isFirst === '1' && data.meetFiveYears === '0' && data.isSingle === '0') {
      if (data.square() < 90) {
        return parseInt(totalPrice() * 1 / 100);
      } else if (data.square >= 90 && data.square < 144) {
        return parseInt(totalPrice() * 1.5 / 100);
      } else {
        return parseInt(totalPrice() * 3 / 100);
      }
    } else {
      return parseInt(totalPrice() * 3 / 100);
    }
  };

  //营业费
  function yingyeTax() { 
    if (data.isFirst == null || data.meetFiveYears == null || data.isSingle == null) {
      return 0;
    } else if (data.isFirst === '1' && data.meetFiveYears === '1' && data.isSingle === '1') {
      return 0;
    } else if (data.isFirst === '1' && data.meetFiveYears === '1' && data.isSingle === '0') {
      return 0;
    } else if (data.isFirst === '1' && data.meetFiveYears === '0' && data.isSingle === '1') {
      return parseInt(totalPrice() * 5.6 / 100);
    } else if (data.isFirst === '1' && data.meetFiveYears === '0' && data.isSingle === '0') {
      return parseInt(totalPrice() * 5.6 / 100);
    } else if (data.isFirst === '0' && data.meetFiveYears === '1' && data.isSingle === '1') {
      return 0;
    } else if (data.isFirst === '0' && data.meetFiveYears === '1' && data.isSingle === '0') {
      return 0;
    } else {
      return parseInt(totalPrice() * 5.6 / 100);
    }
  };

  //个人所得税
  function incomeTax() {
    //个人所得税待定
    if (data.isFirst == null || data.meetFiveYears == null || data.isSingle == null) {
      return 0;
    } else if (data.isFirst === '1' && data.meetFiveYears === '1' && data.isSingle === '1') {
      return 0;
    } else if (data.isFirst === '1' && data.meetFiveYears === '1' && data.isSingle === '0') {
      return parseInt(totalPrice() * 1 / 100);
    } else if (data.isFirst === '1' && data.meetFiveYears === '0' && data.isSingle === '1') {
      return 0;
    } else if (data.isFirst === '1' && data.meetFiveYears === '0' && data.isSingle === '0') {
      return parseInt(totalPrice() * 1 / 100);
    } else if (data.isFirst === '0 '&& data.meetFiveYears === '1' && data.isSingle === '1') {
      return 0;
    } else if (data.isFirst === '0' && data.meetFiveYears === '1' && data.isSingle === '0') {
      return parseInt(totalPrice() * 1 / 100);
    } else if (data.isFirst === '0' && data.meetFiveYears === '0' && data.isSingle === '1') {
      return 0;
    } else {
      return parseInt(totalPrice() * 1 / 100);
    }
  }

  //税费总计
  function totalTax() {
    //税费总额
    return yinhuaTax() + qiTax() + yingyeTax() + incomeTax();
  };

  function monthRepayment(totalLoan, monthRate, totalMonth) {
    if (totalLoan == null || monthRate == null || totalMonth == null) {
      return 0;
    } else {
      return totalLoan * 10000 * monthRate / 100 / 12 * Math.pow((1 + monthRate / 100 / 12), totalMonth * 12) / ((Math.pow((1 + monthRate / 100 / 12), totalMonth * 12)) - 1);
    }
  }

  //商业月还款
  function businessMonthOfBenxi() {
    return (monthRepayment(data.businessLoan, data.businessRate, data.businessYear)).toFixed(0);
  }

  //公积金月还款
  function providentFundMonthOfBenxi() {
    return (monthRepayment(data.providentFundLoan, data.providentFundRate, data.providentFundYear)).toFixed(0);
  }

  //月还款总计
  function totalMonthOfBenxi() {
     return (parseFloat(businessMonthOfBenxi()) + parseFloat(providentFundMonthOfBenxi())).toFixed(0);
  }

  //商业支付利息
  function businessInterestOfBenxi() {
    return (businessTotalOfBenxi() - data.businessLoan * 10000).toFixed(0);
  }

  //公积金支付利息
  function providentFundInterestOfBenxi() {
    return (providentFundTotalOfBenxi() - data.providentFundLoan * 10000).toFixed(0);
  }

  //利息总计
  function totalInterestOfBenxi() {
     return (parseFloat(businessInterestOfBenxi()) + parseFloat(providentFundInterestOfBenxi())).toFixed(0);
  }

  //商业还款
  function businessTotalOfBenxi() {
    return (businessMonthOfBenxi() * data.businessYear * 12).toFixed(0);
  }

  //公积金还款
  function providentFundTotalOfBenxi() {
    return (providentFundMonthOfBenxi() * data.providentFundYear * 12).toFixed(0);
  }

  //还款总计
  function totalOfBenxi() {
     return (parseFloat(businessTotalOfBenxi()) + parseFloat(providentFundTotalOfBenxi())).toFixed(0);
  }

  //等额本金支付利息（商业）
  function businessInterestOfBenjin() {
    if (data.businessYear == null) {
      return 0;
    } else {
      return ((data.businessYear * 12 + 1) * data.businessLoan * 10000 * data.businessRate / 100 / 12 / 2).toFixed(0);
    }
  }

  //等额本金支付利息（住房公积金）
  function providentFundInterestOfBenjin() {
    if (data.providentFundYear == null) {
      return 0;
    } else {
      return ((data.providentFundYear * 12 + 1) * data.providentFundLoan * 10000 * data.providentFundRate / 100 / 12 / 2).toFixed(0);
    }
  }

  //等额本金总计
  function totalInterestOfBenjin() {
    return (parseFloat(businessInterestOfBenjin()) + parseFloat(providentFundInterestOfBenjin())).toFixed(0);
  }

  //等额本金还款总额
  function businessTotalOfBenjin() {
    return (parseFloat(data.businessLoan * 10000) + parseFloat(businessInterestOfBenjin())).toFixed(0);
  }

  //等额本金还款总额
  function providentFundTotalOfBenjin() {
    return (parseFloat(data.providentFundLoan * 10000) + parseFloat(providentFundInterestOfBenjin())).toFixed(0);
  }

  //等额本金还款总额总计
  function totalOfBenjin() {
    return (parseFloat(businessTotalOfBenjin()) + parseFloat(providentFundTotalOfBenjin())).toFixed(0);
  }

  //等额本金月还款额
  function businessMonthOfBenjin() {
    var daikuan = data.businessLoan * 10000,
    year = data.businessYear,
    theMonthPay = (daikuan / (year * 12) + (1 - (1 - 1) / (year * 12)) * daikuan * data.businessRate / 100 / 12).toFixed(0);
    return theMonthPay;
  }

  function providentFundMonthOfBenjin() {
    var daikuan = data.providentFundLoan * 10000,
    year = data.providentFundYear,
    theMonthPay = (daikuan / (year * 12) + (1 - (1 - 1) / (year * 12)) * daikuan * data.providentFundRate / 100 / 12).toFixed(0);
    return theMonthPay;
  }

  function totalMonthOfBenjin() {
    var businessYear = data.businessYear,
    providentFundYear = data.providentFundYear,
    daikuan_sy = data.businessLoan * 10000,
    daikuan_ggj = data.providentFundLoan * 10000;
    if (businessYear >= providentFundYear) {
      var theMonthPayOfSy = 0,
        theMonthPayOfGjj = 0;

      theMonthPayOfSy = (daikuan_sy / (businessYear * 12) + (1 - (1 - 1) / (businessYear * 12)) * daikuan_sy * data.businessRate / 100 / 12).toFixed(0);
      theMonthPayOfGjj = (daikuan_ggj / (providentFundYear * 12) + (1 - (1 - 1) / (providentFundYear * 12)) * daikuan_ggj * data.providentFundRate / 100 / 12).toFixed(0);
      var theMonthPayTotal = parseFloat(theMonthPayOfSy) + parseFloat(theMonthPayOfGjj);
      return theMonthPayTotal;
    } else {
      var theMonthPayOfSy = 0,
      theMonthPayOfGjj = 0;
      theMonthPayOfSy = (daikuan_sy / (businessYear * 12) + (1 - (i - 1) / (businessYear * 12)) * daikuan_sy * data.businessRate / 100 / 12).toFixed(0);

      theMonthPayOfGjj = (daikuan_ggj / (providentFundYear * 12) + (1 - (i - 1) / (providentFundYear * 12)) * daikuan_ggj * data.providentFundRate / 100 / 12).toFixed(0);
      var theMonthPayTotal = parseFloat(theMonthPayOfSy) + parseFloat(theMonthPayOfGjj);
      return theMonthPayTotal;
    }
  }

  function getChart(){
      
    };

  function initialize() {
    data = app.util.getExtrasValue('data');
    getChart();
    vm = new ViewModel();
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko);
