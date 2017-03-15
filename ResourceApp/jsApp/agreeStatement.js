(function (app, mui, $, ko, _) {
  var type,
    aboutUs,
    help;

  function ViewModel(type) {
    this.title = '智屋交易服务协议';

    this.member = type === 'registerMember.htm'; //ko.observable(false); //会员注册协议
    this.broker = type === 'registerBroker.htm'; //经纪人注册协议
    this.trade = type === 'transferAgent.htm'; //<!--我要交易(代办过户)-->
    this.evaluate = type === 'commissionedEstimate.htm'; //<!--委托评估-->
    this.publish = ko.observable(false); //房源发布
    this.aboutUs = ko.observable(false); //关于我们
    this.help = ko.observable(false); //帮助
    this.disclaimer = ko.observable(false); //免责声明

    if (type === 'disclaimer') {
      this.title = '免责声明';
      this.disclaimer = ko.observable(true); //免责声明
    }

    if (type === 'lawyer') {
      this.title = '法律协议';
      this.publish = ko.observable(true);
    }

    if (aboutUs === 'aboutUs') {
      this.title = '关于我们';
      this.aboutUs = ko.observable(true); //关于我们
    }
    
    if (help === 'help') {
      this.title = '使用帮助';
      this.help = ko.observable(true); //帮助
    }
  }

  function initialize() {
    type = app.util.getExtrasValue('type');
    aboutUs = app.util.getExtrasValue('aboutUs');
    help = app.util.getExtrasValue('help');
    var vm = new ViewModel(type);
    ko.applyBindings(vm);
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)