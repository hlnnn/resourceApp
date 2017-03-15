; (function (app, mui, $, ko, _) {
  var
    type = null, // 房源类型参数
    keyWord,
    dataPack,
    opened; // filterWebview 状态
  var types = 'saleHouse,rentHouse,newHouse,saleShop,rentShop,saleOffice,rentOffice'.split(',');

  var filterWebview,
    contentWebview,
    filterWebviewOption = {
      url: 'houseListFilter.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'houseListFilter.htm', //子页面标志
      styles: {
        top: '80px',
        height: '300px'
      },
      afterShowMethodName: undefined,
      extras: {} //额外扩展参数
    },
    contentWebviewOption = {
      url: 'houseListContent.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'houseListContent.htm', //子页面标志
      styles: {
        top: '160px',
        bottom: app.config.bottom
      },
      afterShowMethodName: undefined,
      extras: {} //额外扩展参数
    };

  function DataPack() {
    var self = this;
    this.DataBase = function () {
      this.title = '';
      this.myText = '';
      this.publishType = '';
      this.saleRentVisible = false;
      this.sourceVisible = true;
      this.areaVisible = true;
      this.areaCss = 'mui-col-sm-5 mui-col-xs-5';
      this.timeVisible = true;
      this.countVisible = true;
      this.realSupply = false;
      this.prospecting = false;
      this.sortVisible = true;
      this.mapVisible = true;
    };

    this.SaleHouseData = function () {
      self.DataBase.call(this);

      this.title = '二手房';
      this.myText = '我的二手房';
      this.publishType = 'sale';
      this.saleRentVisible = true;
      this.timeVisible = false;
      this.realSupply = true;
      this.prospecting = true;
    };

    this.RentHouseData = function () {
      self.SaleHouseData.call(this);

      this.title = '租房';
      this.myText = '我的租房';
      this.publishType = 'rent';
      this.realSupply = true;
      this.prospecting = true;
    };

    this.NewHouseData = function () {
      self.DataBase.call(this);

      this.title = '新房';
      this.timeVisible = true;
      this.sourceVisible = false;
      this.sortVisible = false;
      this.countVisible = false;
    };

    this.SaleShopData = function () {
      self.SaleHouseData.call(this);
      
      this.title = '商铺出售';
      this.myText = '';
      this.saleRentVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
    };

    this.RentShopData = function () {
      self.RentHouseData.call(this);

      this.title = '商铺出租';
      this.myText = '';
      this.saleRentVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
    };

    this.SaleOfficeData = function () {
      self.SaleHouseData.call(this);

      this.title = '写字楼出售';
      this.myText = '';
      this.saleRentVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
    };

    this.RentOfficeData = function () {
      self.RentHouseData.call(this);

      this.title = '写字楼出租';
      this.myText = '';
      this.saleRentVisible = false;
      this.realSupply = false;
      this.prospecting = false;
      this.mapVisible = false;
    };

    function Price(upper, lower, between) {
      this.unitUpper = upper;
      this.unitLower = lower;
      this.unitBetween = between;
    }

    var pack = { Price: Price };
    for (var i = 0; i < types.length; i++) {
      pack[types[i]] = this[_.capitalize(types[i]) + 'Data'];
    }
    return pack;
  }

  //设置标题
  (function (app, ko, _) {
    function Header() {
      this.title = '';
      this.goMapList = function () {
      	app.util.goTo('houseMap.htm', { type: type });
      }
    }
    Header.prototype.initialize = function (title, mapVisible,dom) {
      if (title && _.isString(title))
        this.title = title;
      this.mapVisible = mapVisible;
      ko.applyBindings(this, dom || document.getElementById('header'));
    };
    app.module.header = new Header();
  })(app, ko, _);

  //设置底部
  (function (app, ko, _) {
    function Footer() {
      var self = this;
      this.publishType = '';
      this.goAgent = function () {
        app.util.goTo('personalList.htm', { type: 'agent' });
      };
      this.goPublishHouse = function () {
        app.util.goToAuth('publishHouseFirst.htm', { type: self.publishType });
      };
      this.goMyHouse = function () {
        app.util.goToAuth('myHouse.htm',{ type: self.type });
      };
    }
    Footer.prototype.initialize = function (type,myText, publishType, saleRentVisible, dom) {
      this.type = type;
      this.publishType = publishType;
      this.myText = myText;
      this.saleRentVisible = saleRentVisible;
      ko.applyBindings(this, dom || document.getElementById('nav-footer'));
    };
    app.module.footer = new Footer();
  })(app, ko, _);

  //创建houseList模型
  var module = {};
  var houseList = (function () {
    function HouseList() {
    }

    HouseList.prototype.initialize = function (dom) {
      this.source = new module.Source();
      this.filter = new module.Filter();
      this.filter.initialize();
      ko.applyBindings(this, dom);

      mui(dom).on('tap', '.filter>div', function () {
      	var self = this;
        $(this).toggleClass('red').siblings().removeClass('red');
        $(this).find('i').toggleClass('iconfont icon-triangle').parent().siblings().find('i').addClass('iconfont icon-triangle');
        if (window.plus) {
          if (opened) {
          	if (opened === self.dataset.toggle) {
              app.util.fire(plus.webview.currentWebview(), 'hide-dropdown');
            } else {
              opened = self.dataset.toggle;
              app.util.fire(filterWebview, 'show-dropdown', { toggle: opened });
            }
          } else {
          	filterWebview.show(filterWebview.aniShow, filterWebview.duration, function () {
              opened = self.dataset.toggle;
              app.util.fire(filterWebview, 'show-dropdown', { toggle: opened });
            });
          }
        } else {
          $(this.dataset.toggle).toggleClass('mui-hidden').siblings().addClass('mui-hidden');
        }
      });
    }

    return new HouseList();
  })();

  // Source
  (function () {
    function Source() {
      self.sourceVisible = dataPack.sourceVisible;
      self.timeVisible = dataPack.timeVisible;
      self.areaSelectVal = ko.observable('区域');
      self.priceTitle = ko.observable('总价');
    }

    Source.prototype.load = function (type) {
      switch (type) {
        case 'renthouse':
          self.priceTitle('租金');
          break;
        default:
          self.priceTitle('总价');
          break;
      }
    };

    module.Source = Source;
  })();

  // Filter
  (function () {
    function Filter() {
      this.keyWord = ko.observable('');
      this.isLandlordCer = ko.observable(false);
      this.isSiteProspect = ko.observable(false);
      this.totalCount = ko.observable(0);
    }

    //筛选字段处理方法
    Filter.prototype.initialize = function () {
      var isLandlordCer = ko.observable(false),
        isSiteProspect = ko.observable(false);

      this.isLandlordCer = ko.pureComputed({
        read: function () {
          return isLandlordCer();
        },
        write: function (val) {
          isLandlordCer(val);
          app.module.houseList.result.search();
        }
      });

      this.isSiteProspect = ko.pureComputed({
        read: function () {
          return isSiteProspect();
        },
        write: function (val) {
          isSiteProspect(val);
          app.module.houseList.result.search();
        }
      });
      this.countVisible = dataPack.countVisible;
      this.realSupply = dataPack.realSupply;
      this.prospecting = dataPack.prospecting;
    }

    module.Filter = Filter;
  })();

  app.module.houseList = houseList;

  // 查询结果
  (function () {
    function Result() {
    }

    Result.prototype.search = function () {
      search();
    };

    houseList.result = new Result();
  })();

  // 初始化环境
  mui.init({
    subpages: [contentWebviewOption]
  });

  function initialize() {
    type = app.util.getExtrasValue('type');
    keyWord = app.util.getExtrasValue('keyWord');
    dataPack = new (new DataPack()[type])();

    app.module.header.initialize(dataPack.title, dataPack.mapVisible);
    app.module.footer.initialize(type,dataPack.myText, dataPack.publishType, dataPack.saleRentVisible);
    houseList.initialize(document.getElementById('filter-section'));
    app.module.houseList.source.load(type);

    events();

    if (window.plus) {
      if (!filterWebview) {
        filterWebviewOption.extras.type = type;
      }
      var options = filterWebviewOption;
      filterWebview = plus.webview.create(options.url, options.id, options.styles, $.extend({
        preload: true
      }, options.extras));
      filterWebview.addEventListener('loaded', function () {
        setTimeout(search, 100);
      });
      app.util.show(mui.currentWebview);
    }
  }

  app.plusReady(initialize);

  function search() {
    app.util.fire(filterWebview, 'change-filter', ko.toJS(app.module.houseList.filter));
  }

  function events() {
    //小区选择
    if(keyWord){
      app.module.houseList.filter.keyWord(keyWord);
      $('#search').focus();
      app.module.houseList.result.search();
    }
    
    $('#search').on('input propertychange', function () {
      app.module.houseList.filter.keyWord($(this).val());
      app.module.houseList.result.search();
    });

    var first;
    document.addEventListener('pagebeforeshow', function () {
      if (first) {
        search();
        app.module.houseList.source.load(type);
      }
      first = true;
    }, false);


    window.addEventListener('totalCount', function (event) {
      app.module.houseList.filter.totalCount(event.detail.totalCount);
    });
    window.addEventListener('hide-dropdown', function () {
      $('#filter-section .filter').find('div').removeClass('red').find('i').addClass('iconfont icon-triangle');
      filterWebview.hide();
      opened = undefined;
    });

  }

})(app, mui, jQuery, ko, _);