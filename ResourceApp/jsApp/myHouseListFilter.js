;
(function (app, mui, $, ko, _) {
  var city = app.cache.get('city'), //城市Id
    cityId = city.tableId,
    searchType = null,
    dataPack,
    all = false;
  var types = 'SaleHouseListForMe,RentHouseListForMe,WantedBuyHouseListForMe,WantedRentHouseListForMe'.split(',');
  var responseDatas = 'saleHouseList,rentHouseList,wantedBuyHouseList,wantedRentHouseList'.split(',');
  var renderTypes = 'mySaleHouse,myRentHouse,myWantBuy,myWantRent'.split(',');
  var delTypes = 'sale,rent,wantedBuy,wantedRent'.split(',');

  function DataPack() {
    var self = this;
    this.DataBase = function () {
      this.title = '';
      this.requestUrl = 'SaleHouseListForMe';
      this.responseData = 'saleHouseList';
      this.renderType = 'mySaleHouse';
      this.delType = 'sale';
    };
    self.DataBase.call(this);
  }

  //创建houseList模型
  var defined, module = {};
  var houseList = (function () {
    function HouseList() {}

    HouseList.prototype.initialize = function (dom) {
      this.source = new module.Source();
      this.filter = new module.Filter();
      this.filter.initialize();
      ko.applyBindings(this, dom);
    }

    return new HouseList();
  })();

  // Defined
  (function () {
    function Defined() {

    }

    //筛选源
    Defined.prototype.Filter = function (title, list, tap) {
      this.title = title;
      this.list = ko.observableArray(list);
      this.tap = tap || mui.noop;
      this.selected = ko.observable(false);
    };

    // 区域筛选
    Defined.prototype.Area = function (title, id) {
      this.title = title;
      this.id = id;
    };
    defined = new Defined();
  })();

  // Source
  (function () {
    function Source() {
      areaDatas(this);
      sourceData(this);
      publishData(this);
      //modelVisible(this);
    }

    //筛选选择关闭
    function domTap(dom) {
      $(dom).addClass('mui-hidden');
      if (window.plus) {
        var parent = plus.webview.currentWebview().parent();
        if (!parent) {
          parent = plus.webview.getWebviewById('myHouse.htm');
        }
        app.util.fire(parent, 'hide-dropdown');
      }
    }

    function areaDatas(self) {
      self.area = new defined.Filter('区域');
      app.request.postAction('tdwr', 'AreaList', { cityId: cityId }, function (response) {
        bindArea(response.resultList);
        initCheck();
      });

      function bindArea(data) {
        self.area.data = data;
        self.area.list(_.map(self.area.data[0].areaList, function (el) {
          return new defined.Area(el.theName, el.tableId);
        }));
      }

      function initCheck() {
        var checkedVal = ko.observable(self.area.list()[0]);
        self.area.checkedVal = ko.pureComputed({
          read: function () {
            return checkedVal();
          },
          write: function (val) {
            checkedVal(val.id);
            domTap('#dropdown-areas');
            if (val.id === 0)
              app.module.houseList.filter.areaTypeCn = '区域';
            else
              app.module.houseList.filter.areaTypeCn = val.title;
            app.module.houseList.filter.areaId = val.id;
            app.module.houseList.result.research();
          }
        });
      }
    }

    //出售房源
    function sourceData(self) {
      self.source = new defined.Filter('出售房源', ['出售房源', '出租房源', '求购房源', '求租房源']);
      var checkedVal = ko.observable(0);
      self.source.checkedVal = ko.pureComputed({
        read: function () {
          return checkedVal();
        },
        write: function (val) {
          checkedVal(val);
          searchType = val;
          domTap('#dropdown-source');
          dataPack.requestUrl = types[val];
          dataPack.responseData = responseDatas[val];
          dataPack.renderType = renderTypes[val];
          dataPack.delType = delTypes[val];
          app.module.houseList.filter.sourceTypeCn = self.source.list()[val];
          app.module.houseList.result.research();
        }
      });
    }

    //发布状态
    function publishData(self) {
      self.publish = new defined.Filter('发布状态', ['全部', '待审核', '已发布', '发布失败']);
      var checkedVal = ko.observable(0);
      self.publish.checkedVal = ko.pureComputed({
        read: function () {
          return checkedVal();
        },
        write: function (val) {
          checkedVal(val);
          domTap('#dropdown-publishState');
          if (val === 0) {
            app.module.houseList.filter.pulishStateCn = '发布状态';
            app.module.houseList.filter.state = '';
          } else {
            app.module.houseList.filter.state = val;
            app.module.houseList.filter.pulishStateCn = self.publish.list()[val];
          }
          app.module.houseList.result.research();
        }
      });
    }
    module.Source = Source;
  })();

  // Filter
  (function () {
    function Filter() {
      this.cityId = cityId;;
      this.state = ''; // 发布状态
      this.areaId = ''; // 区域
      this.memberId = app.cache.get('member').memberId;
      this.sourceTypeCn = '出售房源'; // 出售房源
      this.areaTypeCn = '区域'; // 区域
      this.pulishStateCn = '发布状态'; // 发布状态 
      this.pageNumber = 1;
      this.countPerPage = 10;
      this.totalCount = ko.observable(0);

      this.p1 = this.pageNumber;
      this.p2 = this.countPerPage;
      this.p3 = this.areaId;
      this.p4 = this.state;
    }

    //筛选字段处理方法
    Filter.prototype.initialize = function () {}

    module.Filter = Filter;
  })();

  app.module.houseList = houseList;

  // 查询结果
  (function () {
    function Result() {}

    Result.prototype.research = function () {
      research();
    };

    houseList.result = new Result();
  })();

  function initialize() {
    //type = app.util.getExtrasValue('type');
    houseList.initialize(document.getElementById('filter-section'));
    if (!dataPack) dataPack = new DataPack();
    //research();
    //setParams();
  }

  // 初始化环境
  mui.init();

  app.plusReady(initialize);

  function research() {
    var filter = ko.toJS(app.module.houseList.filter);
    var list = plus.webview.getWebviewById('myHouseListContent.htm');
    app.util.fire(list, 'list-research', {
      filter: filter,
      dataPack: dataPack,
      type: dataPack.renderType
    });
    updateSearchTitle(filter);
  }

  function updateSearchTitle(filter) {
    if (filter) {
      var parent = plus.webview.currentWebview().parent();
      app.util.fire(parent, 'updateSearchTitle', {
        filter: filter
      });
    }
  }

  function setParams() {
    var filter = ko.toJS(app.module.houseList.filter);
    var list = plus.webview.getWebviewById('myHouseListContent.htm');
    app.util.fire(list, 'list-setParams', {
      filter: filter,
      dataPack: dataPack,
      type: dataPack.renderType
    });
  }

  function events() {
    window.addEventListener('change-filter', function (event) {
      research();
    });

    window.addEventListener('show-dropdown', function (event) {
      $(event.detail.toggle).removeClass('mui-hidden').siblings().addClass('mui-hidden');
      var height = $(event.detail.toggle).height() + 30;
      //console.log('show-dropdown');
      var parent = plus.webview.currentWebview().parent();
      //console.log(height);
      if (window.plus) {
        if (height < 765) {
          plus.webview.currentWebview().setStyle({ height: height + 'px' });
        } else {
          plus.webview.currentWebview().setStyle({ height: 'auto', bottom: app.config.bottom });
        }
      }
    });
  }

  events();

})(app, mui, jQuery, ko, _);