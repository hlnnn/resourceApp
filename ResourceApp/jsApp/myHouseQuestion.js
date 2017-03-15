(function (app, mui, ko, $, _) {
  var newestWebview, commonWebview;
  var
    newestOption = {
      url: 'myHouseQuestionContent.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'myQuestionContent.htm', //子页面标志
      styles: {
        top: '135px',
        bottom: 0
      },
      extras: {
        type: 'newest'
      }
    },
    commonOption = {
      url: 'myHouseQuestionContent.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'myCommonQuestionContent.htm', //子页面标志
      styles: {
        top: '135px',
        bottom: 0
      },
      extras: {
        type: 'common'
      }
    };

  var vm;

  function ViewModel() {
    var self = this;
    this.keyWord = '';
    this.type = 'newest';

    this.myAsk = function () {
      app.util.goTo('myAsk.htm');
    };

    this.getNewestList = function () {
      if (self.type !== 'newest') {
        self.type = 'newest';
        commonWebview.hide();
        newestWebview.show();
      }
    };

    this.getCommonList = function () {
      if (self.type === 'newest') {
        self.type = 'common';
        newestWebview.hide();
        commonWebview.show();
      }
    };

    this.search = function () {
      var webview = self.type === 'newest' ? newestWebview : commonWebview;
      app.util.fire(webview, 'reload', { keyWord: self.keyWord });
    };
  }

  function initialize() {
    vm = new ViewModel();
    ko.applyBindings(vm);

    var options = commonOption;
    commonWebview = plus.webview.create(options.url, options.id, options.styles, $.extend({
      preload: true
    }, options.extras));
    commonWebview.hide();
    mui.currentWebview.append(commonWebview);

    options = newestOption;
    newestWebview = plus.webview.create(options.url, options.id, options.styles, $.extend({
      preload: true
    }, options.extras));
    mui.currentWebview.append(newestWebview);
    
    app.util.show();
  }

  function events() {
    document.getElementById('search').addEventListener('keydown', function (e) {
      if (e.keyCode === 13) {
        vm.keyWord = this.value;
        vm.search();
      }
    }, false);
  }
  events();
  app.plusReady(initialize);
})(app, mui, ko, jQuery, _);