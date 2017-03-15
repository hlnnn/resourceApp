; (function (app, mui, $, ko, _) {
  var module = {},
  type = null, // 房源类型参数
  dataPack,
  opened, // filterWebview 状态
  filterWebview,
  types = 'saleHouse,rentHouse,newHouse,saleShop,rentShop,saleOffice,rentOffice'.split(','),

  filterWebviewOption = {
    url: 'houseListFilter.htm', //子页面HTML地址，支持本地地址和网络地址
    id: 'houseListFilter.htm', //子页面标志
    styles: {
      top: '80px',
      height: '300px'
    },
    afterShowMethodName: undefined,
    extras: {} //额外扩展参数
  };

  function DataPack() {
    var self = this;
    this.DataBase = function () {
      this.title = '';
      this.sourceVisible = true;
      this.areaVisible = true;
      this.areaCss = 'mui-col-sm-5 mui-col-xs-5';
      this.timeVisible = true;
      this.countVisible = true;
      this.realSupply = false;
      this.prospecting = false;
      this.sortVisible = true;
    };

    this.SaleHouseData = function () {
      self.DataBase.call(this);

      this.title = '二手房';
      this.timeVisible = false;
      this.realSupply = true;
      this.prospecting = true;
    };

    this.RentHouseData = function () {
      self.SaleHouseData.call(this);

      this.title = '租房';
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
      this.realSupply = false;
      this.prospecting = false;
    };

    this.RentShopData = function () {
      self.RentHouseData.call(this);

      this.title = '商铺出租';
      this.realSupply = false;
      this.prospecting = false;
    };

    this.SaleOfficeData = function () {
      self.SaleHouseData.call(this);

      this.title = '写字楼出售';
      this.realSupply = false;
      this.prospecting = false;
    };

    this.RentOfficeData = function () {
      self.RentHouseData.call(this);

      this.title = '写字楼出租';
      this.realSupply = false;
      this.prospecting = false;
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

 

  function initialize() {
    type = app.util.getExtrasValue('type');
    dataPack = new (new DataPack()[type])();

    
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
    }
  }

  app.plusReady(initialize);

  function search() {
    app.util.fire(filterWebview, 'change-filter', ko.toJS(app.module.houseList.filter));
  }

  function events() {
    //小区选择
    $('#search').on('input propertychange', function () {
      app.module.houseList.filter.keyWord(this.value);
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