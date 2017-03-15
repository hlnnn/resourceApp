// filter
(function (app, mui, $, ko, _) {
  var city = app.localStorage.getCity(),
    cityId = city.tableId,
    member = app.localStorage.getMember(),
    memberId = member.memberId;
  app.defined = {};

  // Api params
  var dataPacks = new(function () {
    function SaleHouse() {
      this.title = '';
      this.type = 'saleHouse';
      this.requestUrl = 'SaleHouseListForMe';
      this.responseData = 'saleHouseList';
      this.renderType = 'mySaleHouse';
      this.delType = 'sale';
    };

    function RentHouse() {
      this.type = 'rentHouse';
      this.requestUrl = 'RentHouseListForMe';
      this.responseData = 'rentHouseList';
      this.renderType = 'myRentHouse';
      this.delType = 'rent';
    }

    function WantedBuyHouse() {
      this.type = 'wantedBuyHouse';
      this.requestUrl = 'WantedBuyHouseListForMe';
      this.responseData = 'wantedBuyHouseList';
      this.renderType = 'myWantBuy';
      this.delType = 'wantedBuy';
    }

    function WantedSaleHouse() {
      this.type = 'wantedSaleHouse';
      this.requestUrl = 'WantedRentHouseListForMe';
      this.responseData = 'wantedRentHouseList';
      this.renderType = 'myWantRent';
      this.delType = 'wantedRent';
    }

    return [SaleHouse, RentHouse, WantedBuyHouse, WantedSaleHouse];
  })();
  var selected;
  var hiddenCss = 'icon-triangle';
  var showCss = 'icon-triangle-up';
  var closeMask = function () {
    var els = $('#filter-section').find('a');
    els.removeClass('mui-active');
    els.find('i').removeClass(showCss).addClass(hiddenCss);
    els.each(function () {
      $(this.dataset.toggle).addClass('mui-hidden');
    });
    selected = undefined;
  }
  var mask = mui.createMask(closeMask);
  //创建houseList模型
  var houseList = app.module.houseList = (function () {
    function HouseList() {}

    HouseList.prototype.initialize = function (dom) {
      this.source = new app.module.Source(this);
      this.filter = new app.module.Filter();

      mui(dom).on('tap', 'a', function (e) {
        e.stopPropagation();
        if (selected === this) {
          closeMask();
          mask.close();
        } else {
          selected = this;
          $(this).toggleClass('mui-active').siblings().removeClass('mui-active');
          $(this).find('i').removeClass(hiddenCss).addClass(showCss).parent().siblings().find('i').addClass(hiddenCss).addClass(showCss);
          $(this.dataset.toggle).toggleClass('mui-hidden').siblings().addClass('mui-hidden');
          mask.show();
        }
      });
    }

    return new HouseList();
  })();

  houseList.dataPacks = dataPacks;

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
    app.defined = new Defined();
  })();

  // Source
  (function () {
    var _house;

    function Source(house) {
      _house = house;
      //this.sourceSelectVal = ko.observable('出售房源');
      this.areaSelectVal = ko.observable('区域');
      this.publishSelectVal = ko.observable('发布状态');

      sourceData(this);
      areaDatas(this);
      publishData(this);
    }

    //筛选选择关闭
    function domTap() {
      closeMask();
      mask.close();
    }

    function areaDatas(self) {
      self.area = new app.defined.Filter('区域');
      var list = _.map(city.areas.areaList, function (el) {
        return new app.defined.Area(el.theName, el.tableId);
      });
      self.area.list(list);
      initCheck();

      function initCheck() {
        var checkedVal = ko.observable(list[0]);
        self.area.checkedVal = ko.pureComputed({
          read: function () {
            return checkedVal();
          },
          write: function (val) {
            checkedVal(val);
            self.areaSelectVal(val.title);
            domTap();
            app.module.houseList.filter.areaId = val.id;
            app.module.houseList.result.research();
          }
        });
      }
    }

    //出售房源
    function sourceData(self) {
      var filters = ['出售房源', '出租房源', '求购房源', '求租房源'];
      self.sourceSelectVal = ko.observable(filters[_house.type || 0]);
      self.source = new app.defined.Filter('出售房源', filters);
      var checkedVal = ko.observable(0);
      self.source.checkedVal = ko.pureComputed({
        read: function () {
          return checkedVal();
        },
        write: function (val) {
          checkedVal(val);
          domTap();
          dataPacks[val].call(houseList.dataPack);
          self.sourceSelectVal(filters[val]);
          app.module.houseList.result.research();
        }
      });
    }

    //发布状态
    function publishData(self) {
      var filters = ['全部','待审核', '已发布', '发布失败'];
      self.publish = new app.defined.Filter('发布状态', filters);
      var checkedVal = ko.observable(0);
      self.publish.checkedVal = ko.pureComputed({
        read: function () {
          return checkedVal();
        },
        write: function (val) {
          domTap();
          checkedVal(val);
          if (val === 0) {
            self.publishSelectVal('发布状态');
            app.module.houseList.filter.state = '';
          } else {
            self.publishSelectVal(filters[val]);
            app.module.houseList.filter.state = val-1;
          }
          app.module.houseList.result.research();
        }
      });
    }
    app.module.Source = Source;
  })();

  // Filter
  (function () {
    function Filter() {
      this.cityId = cityId;;
      this.state = ''; // 发布状态
      this.areaId = ''; // 区域
      this.memberId = memberId;
      /*this.sourceTypeCn = '出售房源'; // 出售房源
      this.areaTypeCn = '区域'; // 区域
      this.pulishStateCn = '发布状态'; // 发布状态 */
      this.pageNumber = 0;
      this.countPerPage = 10;
      this.totalCount = 0;

      var self = this;
      this.p1 = function () {
        return self.pageNumber;
      }
      this.p2 = function () {
        return self.countPerPage;
      }
      this.p3 = function () {
        return self.areaId;
      }
      this.p4 = function () {
        return self.state;
      }
    }

    app.module.Filter = Filter;
  })();

})(app, mui, jQuery, ko, _);
// result 查询结果
(function (app) {
  var
    dataPack,
    filter,
    pullRefresh;

  function Result() {
    this.color = ['#ff8498', '#7cd9e1', '#ffb284', '#7ce17c'];
    this.houseList = ko.observableArray();
  }

  // 查询返回结果项映射
  var houseItemMap = (function () {

    function HouseItem(model) {
      var self = this;
      this.tableId = model.tableId;
      this.type = dataPack.renderType;
      this.feature = model.feature;
      this.unitPrice = model.unitPrice;
      this.source = model.source;
      this.isSiteProspect = model.isSiteProspect;
      this.isLandlordCer = model.isLandlordCer;
      this.cityPartition = model.cityPartition;
      this.buildingName = model.buildingName;
      this.address = model.address;
      if (this.feature) {
        this.features = this.feature.split(',').splice(0, 4);
      } else {
        this.features = '';
      }

      this.totalPrice = '';
      this.imagePath = '';
      this.square = model.square;
      this.room = model.room;
      this.hall = model.hall;
      this.theFloor = model.theFloor;
      this.totalFloor = model.totalFloor;
      this.floorDisplay = _.sprintf('%s/%s层', self.theFloor, self.totalFloor);
      this.squareDisplay = _.sprintf('%s㎡', this.square);
      this.houseTypeDisplay = _.sprintf('%s室%s厅', this.room, this.hall);
      this.areaName = '';

      this.footer = false; //底部导航
      this.communityName = '';
      this.theTitle = ko.pureComputed(function () {
        return _.sprintf('%s %s', self.areaName, self.communityName);
      });

      this.totalPriceDisplay = '';
      this.unitPriceDisplay = '';
      switch (model.state) {
        case 0:
          this.stateCn = '待审核';
          this.stateIcon = 'icon-audit';
          this.stateColor = '#f3c350';
          break;
        case 1:
          this.stateCn = '已发布';
          this.stateIcon = 'icon-pass';
          this.stateColor = '#50cb53';
          break;
        default:
          this.stateCn = '发布失败';
          this.stateIcon = 'icon-reject';
          this.stateColor = '#999';
      };
    }

    function SaleHouse(model) {
      HouseItem.call(this, model);

      this.totalPrice = model.totalPrice;
      this.imagePath = app.image.get(model.imagePath, app.config.noImage);
      //this.imagePath = model.imagePath;
      this.areaName = model.areaName;
      this.communityName = model.communityName;
      this.unitPriceDisplay = this.unitPrice + '元/㎡';
      this.totalPriceDisplay = this.totalPrice + '万元';
      this.realSupply = true;
      this.prospecting = true;
      this.footer = true;
    }

    function RentHouse(model) {
      HouseItem.call(this, model);
      this.totalPrice = model.rent;
      this.imagePath = app.image.get(model.imagePath, app.config.noImage);
      //this.imagePath = model.imagePath;
      this.areaName = model.areaName;
      this.communityName = model.communityName;
      this.unitPriceDisplay = '';
      this.totalPriceDisplay = this.totalPrice + '元/月';
      this.realSupply = true;
      this.prospecting = true;
      this.footer = true;
    }

    function NewHouse(model) {
      HouseItem.call(this, model);
      this.totalPrice = model.buildingPrice;
      this.imagePath = app.image.get(model.coverImageNewHouse, app.config.noImage);
      //this.imagePath = model.coverImageNewHouse;
      this.areaName = model.cityPartition.theName;
      this.communityName = model.buildingName;
      this.unitPriceDisplay = '';
      this.totalPriceDisplay = this.totalPrice + '元/m²';
      this.square = '';
      this.room = '';
      this.hall = '';
      this.theFloor = '';
      this.totalFloor = '';
      this.floorDisplay = '';
      this.squareDisplay = '';
      this.houseTypeDisplay = '';
      this.count = false;
      this.realSupply = false;
      this.prospecting = false;
    }

    function SaleShop(model) {
      HouseItem.call(this, model);
      this.imagePath = app.image.get(model.imagePath, app.config.noImage);
      //this.imagePath = model.imagePath;
      this.areaName = model.areaName;
      this.communityName = model.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = model.shopType;
      this.totalPriceDisplay = model.totalPrice + '万';
      this.unitPriceDisplay = model.unitPrice + '元/m²';
    }

    function RentShop(model) {
      HouseItem.call(this, model);
      this.imagePath = app.image.get(model.imagePath, app.config.noImage);
      //this.imagePath = model.imagePath;
      this.areaName = model.areaName;
      this.communityName = model.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = model.shopType;
      this.totalPriceDisplay = model.rent + '元/月';
      this.unitPriceDisplay = model.averageRent + '元/m².月';
    }

    function SaleOffice(model) {
      HouseItem.call(this, model);
      this.imagePath = app.image.get(model.imagePath, app.config.noImage);
      //this.imagePath = model.imagePath;
      this.areaName = model.areaName;
      this.communityName = model.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = model.shopType;
      this.totalPriceDisplay = model.totalPrice + '万';
      this.unitPriceDisplay = model.unitPrice + '元/m²';
    }

    function RentOffice(model) {
      HouseItem.call(this, model);
      this.imagePath = app.image.get(model.imagePath, app.config.noImage);
      //this.imagePath = model.imagePath;
      this.areaName = model.areaName;
      this.communityName = model.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = model.shopType;
      this.totalPriceDisplay = model.rent + '元/月';
      this.unitPriceDisplay = model.averageRent + '元/m².月';
    }

    function MySaleHouse(model) {
      SaleHouse.call(this, model);
      this.isSale = true;
    }

    function MyRentHouse(model) {
      RentHouse.call(this, model);
      if (!model.rent || model.rentType === '') {
        this.totalPriceDisplay = '租金面议';
      } else {
        this.totalPriceDisplay = model.rent + "元/月";
      }
      this.isSale = true;
    }

    function MyWantBuy(model) {
      SaleHouse.call(this, model);
      this.areaName = '求购' + model.areaName;
      this.totalPriceDisplay = model.totalPrice + '万';
      this.isSale = false;
    }

    function MyWantRent(model) {
      RentHouse.call(this, model);
      this.areaName = '求租' + model.areaName;
      if (!model.rent || model.rentType === '') {
        this.totalPriceDisplay = '租金面议';
      } else {
        this.totalPriceDisplay = model.rent + "元/月";
      }
      this.isSale = false;
    }

    return {
      saleHouse: SaleHouse,
      rentHouse: RentHouse,
      newHouse: NewHouse,
      saleShop: SaleShop,
      rentShop: RentShop,
      saleOffice: SaleOffice,
      rentOffice: RentOffice,
      mySaleHouse: MySaleHouse,
      myRentHouse: MyRentHouse,
      myWantBuy: MyWantBuy,
      myWantRent: MyWantRent
    }
  })();

  Result.prototype.initialize = function (dom) {
    var houseList = app.module.houseList;
    filter = houseList.filter;
    dataPack = houseList.dataPack;
    pullRefresh = new app.module.PullRefresh('#house-list', {
      down: {
        auto: true,
        callback: pulldownRefresh
      },
      up: {
        auto: true,
        callback: pullupRefresh
      }
    });

    //下拉刷新
    function pulldownRefresh() {
      filter.pageNumber = 1;
      app.module.houseList.result.research(function () {
        pullRefresh.endPulldownToRefresh();
      });
    }

    // 上拉加载具体业务实现
    function pullupRefresh() {
      if (filter.pageNumber >= filter.totalPage)
        pullRefresh.endPullupToRefresh(true);
      else
        setTimeout(function () {
          filter.pageNumber++;
          app.module.houseList.result.search(function () {
            pullRefresh.endPullupToRefresh(filter.pageNumber >= filter.totalPage);
          });
        }, 100);
    }

    ko.applyBindings(this, dom);
  };
  Result.prototype.research = function (callback) {
    filter.pageNumber = 1;
    search(this, callback);
  };
  Result.prototype.search = function (callback) {
    search(this, callback);
  };
  Result.prototype.detail = function (record) {
    app.util.goTo('houseDetail.htm', {
      tableId: record.tableId,
      type: dataPack.type
    }, false);
  }
  Result.prototype.edit = function (record) {
    app.util.goToAuth('publishHouseSecond.htm', {
      tableId: record.tableId,
      type: dataPack.renderType
    }, false);
  }

  Result.prototype.remove = function (record) {
    var self = this;
    app.messager.confirm('提示', '确定要删除该房源?', function (e) {
      if (e.index) {
        app.request.postActionAuth('tudwr', 'HouseResourceForMeDel', {
          p1: dataPack.delType,
          p2: record.tableId
        }, function (response) {
          if (response.result === 'success') {
            self.houseList.remove(record);
            app.messager.toast('删除成功！');
          } else {
            app.messager.toast(response.info);
          }
        });
      }
    });
  }

  function search(self, callback) {
    app.request.postAction('tdwr', dataPack.requestUrl, filter, function (response) {
      if (filter.pageNumber === 1) {
        self.houseList.removeAll();
        pullRefresh && pullRefresh.scrollTop();
      }
      if (response.result === 'success') {
        var houseItem = houseItemMap[dataPack.renderType],
          datas = response[dataPack.responseData];
        for (var i = 0, len = datas.length; i < len; i++) {
          self.houseList.push(new houseItem(datas[i]));
        }
        filter.totalPage = response.totalPage;
      } else {
        app.messager.toast('没有数据');
      }
      callback && callback();
    });
  }

  app.module.houseList.result = new Result();
})(app);
// header & publish
(function (app, mui, $) {

  var publishPopoverMask = mui.createMask(function () {
    $('#topPopover').addClass('mui-hidden');
  });
  $(publishPopoverMask[0]).addClass('mui-backdrop-top');

  function publishClose() {
    publishPopoverMask.close();
    $('#topPopover').addClass('mui-hidden');
  };

  function Publish() {}

  Publish.prototype.publish = function () {
    publishPopoverMask.show();
    $('#topPopover').removeClass('mui-hidden');
  }
  Publish.prototype.saleHouse = function () {
    publishClose();
    app.util.goTo('publishHouseFirst.htm', {
      type: 'saleHouse'
    });
  }
  Publish.prototype.rentHouse = function () {
    publishClose();
    app.util.goTo('publishHouseFirst.htm', {
      type: 'rentHouse'
    });
  }
  Publish.prototype.wantedBuyHouse = function () {
    publishClose();
    app.util.goTo('publishHouseFirst.htm', {
      type: 'wantedBuyHouse'
    });
  }
  Publish.prototype.wantedRentHouse = function () {
    publishClose();
    app.util.goTo('publishHouseFirst.htm', {
      type: 'wantedRentHouse'
    });
  }

  app.module.houseList.publish = new Publish();
})(app, mui, jQuery);

(function (app, mui, $, ko, _) {

  // 初始化环境
  mui.init();

  var map = { 'saleHouse': 0, 'rentHouse': 1 };

  function initialize() {
    var houseList = app.module.houseList,
      params = app.util.getParam() || {},
      extras = app.util.getExtras(),
      type = params.type || extras.type || 'saleHouse';

    houseList.type = map[type]; // 房源类型：出售、出租
    houseList.dataPack = new houseList.dataPacks[houseList.type]();
    houseList.initialize(document.getElementById('filter-section'));
    ko.applyBindings(houseList.publish, document.getElementById('header'));
    ko.applyBindings(houseList.publish, document.getElementById('topPopover'));
    ko.applyBindings(houseList.source, document.getElementById('filter-section'));
    ko.applyBindings(houseList.source, document.getElementById('filter-toggle-section'));
    houseList.result.initialize(document.getElementById('house-list'));
  }
  app.plusReady(initialize);
})(app, mui, jQuery, ko, _);