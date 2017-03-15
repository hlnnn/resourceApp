(function (app, mui, ko) {
  var
    type, // 房源类型参数
    dataPack,
    module = {},
    opened, // filterWebview 状态
    types = 'saleHouse,rentHouse,newHouse'.split(','),
    filterWebview,
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
      url: 'houseMapContent.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'houseMapContent.htm', //子页面标志
      styles: {
        top: '142px',
        bottom: '0px'
      },
      afterShowMethodName: undefined,
      extras: {} //额外扩展参数
    };

  function DataPack() {
    var self = this;
    this.DataBase = function () {
      this.sourceVisible = true;
      this.timeVisible = true;
      this.sortVisible = true;
    };

    this.SaleHouseData = function () {
      self.DataBase.call(this);
      this.timeVisible = false;
    };

    this.RentHouseData = function () {
      self.SaleHouseData.call(this);
    };

    this.NewHouseData = function () {
      self.DataBase.call(this);
      this.timeVisible = true;
      this.sourceVisible = false;
      this.sortVisible = false;
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

  var houseList = (function () {
    function HouseList() {
    }

    HouseList.prototype.initialize = function (dom) {
      this.source = new module.Source();
      this.source.load(type);
      this.filter = new module.Filter();
      ko.applyBindings(this, dom);

      mui(dom).on('tap', '.filter>div', function () {
      	$('#search').blur();
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
          	var any = _.any(plus.webview.currentWebview().children(), function (el) { return el.id === 'houseListFilter.htm' });
            if (!any) {
              plus.webview.currentWebview().append(filterWebview);
            }
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
        case 'rentHouse':
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
    }

    module.Filter = Filter;
  })();

  function initialize() {
    events();
    
    type = app.util.getExtrasValue('type');
    dataPack = new (new DataPack()[type])();
    houseList.initialize(document.getElementById('filter-section'));
    if (window.plus) {
      var loadAll;
      if (!contentWebview) {
        contentWebviewOption.extras.type = type;
      }
      contentWebview = plus.webview.create(contentWebviewOption.url, contentWebviewOption.id, contentWebviewOption.styles, $.extend({
        preload: true
      }, contentWebviewOption.extras));
      contentWebview.addEventListener('loaded', function () {
        if (loadAll)
          setTimeout(search, 100);
        loadAll = true;
      });

      if (!filterWebview) {
        filterWebviewOption.extras.type = type;
      }
      filterWebview = plus.webview.create(filterWebviewOption.url, filterWebviewOption.id, filterWebviewOption.styles, $.extend({
        preload: true
      }, filterWebviewOption.extras));
      filterWebview.addEventListener('loaded', function () {
        if (loadAll)
          setTimeout(search, 100);
        loadAll = true;
      });
      plus.webview.currentWebview().append(contentWebview);
      //plus.webview.currentWebview().append(filterWebview);
      //contentWebview.show();
    }
  }
	app.module.houseList = houseList; 
	
	function search() {
    app.util.fire(filterWebview, 'change-filter', ko.toJS(app.module.houseList.filter));
  }
	
  app.plusReady(initialize);

  mui.init();

  function events() {
    //小区选择
    $('#search').on('input propertychange', function () {
      app.module.houseList.filter.keyWord(this.value);
      search();
    });

    window.addEventListener('hide-dropdown', function () {
    	$('#filter-section .filter').find('div').removeClass('red').find('i').addClass('iconfont icon-triangle');
      filterWebview.hide();
      opened = undefined;
    });

  }

})(app, mui, ko);