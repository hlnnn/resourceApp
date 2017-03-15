;
(function (app, mui, $, ko, _) {
  var
    type = null, // 房源类型参数
    dataPack, type,
    opened; // filterWebview 状态
  var types = ['myHouse']; //'saleHouse,rentHouse,newHouse,saleShop,rentShop,saleOffice,rentOffice'.split(',');
  var filterWebview,
    contentWebview,
    popoverWebview,
    filterWebviewOption = {
      url: 'myHouseListFilter.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'myHouseListFilter.htm', //子页面标志
      styles: {
        top: '80px',
        height: '300px'
      },
      afterShowMethodName: undefined,
      extras: {} //额外扩展参数
    },
    contentWebviewOption = {
      url: 'myHouseListContent.htm', //子页面HTML地址，支持本地地址和网络地址
      id: 'myHouseListContent.htm', //子页面标志
      styles: {
        top: '85px',
        bottom: app.config.bottom
      },
      afterShowMethodName: undefined,
      extras: {} //额外扩展参数
    };
  /*popoverWebviewOption = {
    url: 'myHousePopover.htm', //子页面HTML地址，支持本地地址和网络地址
    id: 'myHousePopover.htm', //子页面标志
    styles: {
      top: '80px',
      height: '300px'
    },
    afterShowMethodName: undefined,
    extras: {} //额外扩展参数
  }*/

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

    this.MyHouseData = function () {
      self.DataBase.call(this);

      this.title = '我的房源';
      this.timeVisible = false;
      this.realSupply = true;
      this.prospecting = true;
    };

    var pack = {};
    for (var i = 0; i < types.length; i++) {
      pack[types[i]] = this[_.capitalize(types[i]) + 'Data'];
    }
    return pack;
  }

  //设置标题
  (function (app, ko, _) {

    function Header() {
      this.title = '';

      this.popover = function () {
        app.util.goTo('myHousePopover.htm');
        //createPopover();
      }
    }
    Header.prototype.initialize = function (title, dom) {
      if (title && _.isString(title))
        this.title = title;
      ko.applyBindings(this, dom || document.getElementById('header'));
    };
    app.module.header = new Header();
  })(app, ko, _);

  //创建houseList模型
  var module = {};
  var houseList = (function () {
    function HouseList() { }

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
              app.util.fire(filterWebview, 'show-dropdown', {
                toggle: opened
              });
            }
          } else {
            filterWebview.show(filterWebview.aniShow, filterWebview.duration, function () {
              opened = self.dataset.toggle;
              app.util.fire(filterWebview, 'show-dropdown', {
                toggle: opened
              });
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
      this.sourceSelectVal = ko.observable('出售房源');
      this.areaSelectVal = ko.observable('区域');
      this.publishSelectVal = ko.observable('发布状态');
    }
    module.Source = Source;
  })();

  // Filter
  (function () {
    function Filter() {
      this.keyWord = ko.observable('');
      this.totalCount = ko.observable(0);
    }

    //筛选字段处理方法
    Filter.prototype.initialize = function () {
      this.countVisible = dataPack.countVisible;
    }

    module.Filter = Filter;
  })();

  app.module.houseList = houseList;

  // 查询结果
  (function () {
    function Result() { }

    Result.prototype.search = function () {
      search();
    };

    houseList.result = new Result();
  })();

  // 初始化环境
  mui.init({
    //subpages: [contentWebviewOption]
  });

  function initialize() {
    if (window.plus) {
      if (!filterWebview) {
        filterWebviewOption.extras.type = type;
      }
      var options = filterWebviewOption;
      filterWebview = plus.webview.create(options.url, options.id, options.styles, $.extend({
        preload: true
      }, options.extras));
      filterWebview.addEventListener('loaded', function () {
        //search();
        createContent();

      });
      filterWebview.hide();
      plus.webview.currentWebview().append(filterWebview);

      function createContent() {
        contentWebview = plus.webview.create(contentWebviewOption.url, contentWebviewOption.id, contentWebviewOption.styles, $.extend({
          preload: true
        }, contentWebviewOption.extras));
        contentWebview.addEventListener('loaded', function () {
          search();
          //        createPopover();
        });
        plus.webview.currentWebview().append(contentWebview);
      }

      function createPopover() {

        popoverWebview = plus.webview.create(popoverWebviewOption.url, popoverWebviewOption.id, popoverWebviewOption.styles, $.extend({
          preload: false
        }, popoverWebviewOption.extras));

        popoverWebview.addEventListener('loaded', function () {
          filterWebview.hide();
          //createContent.hide();
        });

        plus.webview.currentWebview().append(popoverWebview);
      }

    }

    dataPack = new (new DataPack()['myHouse'])();
    houseList.initialize(document.getElementById('filter-section'));
    app.module.header.initialize(document.getElementById('header'));
    events();
  }

  app.plusReady(initialize);

  function search() {
    app.util.fire(filterWebview, 'change-filter');
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

    window.addEventListener('hide-dropdown', function () {
      $('#filter-section .filter').find('div').removeClass('red').find('i').addClass('iconfont icon-triangle');
      filterWebview.hide();
      opened = undefined;
    });

    window.addEventListener('updateSearchTitle', function (event) {
      //console.log(ko.toJSON(event.detail));
      app.module.houseList.source.sourceSelectVal(event.detail.filter.sourceTypeCn);
      app.module.houseList.source.areaSelectVal(event.detail.filter.areaTypeCn);
      app.module.houseList.source.publishSelectVal(event.detail.filter.pulishStateCn);
    });
  }

})(app, mui, jQuery, ko, _);