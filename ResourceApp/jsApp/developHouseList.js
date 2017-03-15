;
(function (app, mui, $, ko, _) {
  var type, // 房源类型参数
    dataPack,
    brokerId;

  var contentWebview,
    contentWebviewOption = {
      url: 'houseListContent.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'houseListContent.htm', //子页面标志
      styles: {
        top: '40px'
      },
      afterShowMethodName: undefined,
      extras: {} //额外扩展参数
    };

  function DataPack() {
    var self = this;
    this.DataBase = function () {
      this.title = '';
      this.requestUrl = '';
      this.responseData = '';
      this.filter = { p1: brokerId, p2: 'up', p3: 'up', pageNumber: 1, p5: 10 };
    };

    this.saleHouse = function () {
      self.DataBase.call(this);

      this.title = '二手房';
      this.requestUrl = 'SaleHouseListOfBroker';
      this.responseData = 'saleHouseList';
    };

    this.rentHouse = function () {
      self.DataBase.call(this);

      this.title = '租房';
      this.requestUrl = 'RentHouseListOfBroker';
      this.responseData = 'rentHouseList';
    };
  }

  //设置标题
  function Header() {
    this.title = dataPack.title;
  };

  // 初始化环境
  mui.init();

  function initialize() {
    type = app.util.getExtrasValue('type');
    brokerId = app.util.getExtrasValue('brokerId');
    dataPack = new(new DataPack()[type])();

    ko.applyBindings(new Header());

    if (window.plus) {
      if (!contentWebview) {
        contentWebviewOption.extras.type = type;
        contentWebviewOption.extras.brokerId = brokerId;
      }
      var options = contentWebviewOption;
      contentWebview = plus.webview.create(options.url, options.id, options.styles, $.extend({
        preload: true
      }, options.extras));
      contentWebview.addEventListener('loaded', function () {
        search();
      });
      plus.webview.currentWebview().append(contentWebview);
    }
  }

  function search() {
    if (window.plus) {
      app.util.fire(contentWebview, 'list-research', {
        type: type,
        dataPack: dataPack,
        filter: dataPack.filter
      });
    }
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko, _);