;
(function (app, mui, $, ko, _) {
  var type = null,
    dataPack, filter;
  var parentWebview;

  // 查询结果
  (function () {
    function Result() {
      this.color = ['#ff8498', '#7cd9e1', '#ffb284', '#7ce17c'];
      this.houseList = ko.observableArray();
    }

    function HouseItem(model) {
      var self = this;
      this.tableId = model.tableId;
      this.type = type;
      this.feature = model.feature;
      this.unitPrice = model.unitPrice;
      this.source = model.source;
      this.isSiteProspect = model.isSiteProspect;
      this.isLandlordCer = model.isLandlordCer;
      this.cityPartition = model.cityPartition;
      this.buildingName = model.buildingName;
      this.address = model.address;
      if(this.feature){
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
          this.stateCn = '已通过';
          this.stateIcon = 'icon-pass';
          this.stateColor = '#50cb53';
          break;
        default:
          this.stateCn = '失败';
          this.stateIcon = 'icon-reject';
          this.stateColor = '#999';
      };

//    if (model.state === 0) {
//      this.stateCn = '待审核';
//    } else if (model.state === 1) {
//      this.stateCn = '已发布';
//    } else {
//      this.stateCn = '失败';
//    }
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

    var houseItemMap = {
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

    Result.prototype.initialize = function (dom, houses) {
      ko.applyBindings(this, dom);
      if (houses)
        this.load(houses);
    };
    Result.prototype.load = function (datas) {
      var houseItem = houseItemMap[type];
      for (var i = 0, len = datas.length; i < len; i++) {
        this.houseList.push(new houseItem(datas[i]));
      }
    };
    Result.prototype.reload = function (datas) {
      this.houseList.removeAll();
      this.load(datas);
    };
    Result.prototype.setParams = function (param) {
      filter = param.filter;
      dataPack = param.dataPack;
      type = param.type;
    };
    Result.prototype.research = function () {
      search(this, this.reload);
    };
    Result.prototype.search = function () {
      search(this, this.load);
    };
    Result.prototype.detail = function (record) {
      app.util.goTo('houseDetail.htm', {
        tableId: record.tableId,
        type: type
      }, false);
    }
    Result.prototype.edit = function (record) {
      app.util.goToAuth('publishHouseSecond.htm', {
        type: type,
        tableId: record.tableId
      }, false);
    }
    Result.prototype.delete = function (record) {
      app.request.postAction('tdwr', 'HouseResourceForMeDel', {
        p1: record.table.Id,
        type: dataPack.delType
      }, function (response) {
        if (response.result === 'success') {
          this.houseList.remove(record);
        } else {
          app.messager.toast(response.info);
        }
      });
    }

    function search(self, callback) {
      app.request.postAction('tdwr', dataPack.requestUrl, filter, function (response) {
        if (response.result === 'success') {
          callback.call(self, response[dataPack.responseData]);
          app.util.fire(parentWebview, 'totalCount', {
            totalCount: response.totalCount
          });
          filter.totalPage = response.totalPage;
        } else {
          self.houseList.removeAll();
          app.messager.toast('没有数据');
        }
      });
    }

    app.module.result = new Result();
  })();

  function initialize() {
    app.module.result.initialize(document.getElementById('house-list'));
    if (window.plus) {
      //if (plus.webview.getWebviewById('houseListContent-MapForCommunity.htm')) {
      //  parentWebview = plus.webview.getWebviewById('houseListContent-MapForCommunity.htm');
      //}else {
      //  parentWebview = plus.webview.getWebviewById('houseList.htm');
      //}
      parentWebview = plus.webview.currentWebview().opener();
    }

  }

  //下拉刷新
  function pulldownRefresh() {
    mui('#house-list').pullRefresh().endPulldownToRefresh(); //参数为true代表没有更多数据了。
    filter.pageNumber = 1;
    app.module.result.research();
  }

  // 上拉加载具体业务实现
  function pullupRefresh() {
    setTimeout(function () {
      mui('#house-list').pullRefresh().endPullupToRefresh((filter.pageNumber > filter.totalPage)); //参数为true代表没有更多数据了.
      filter.pageNumber++;
      if (filter.pageNumber <= filter.totalPage) {
        app.module.result.search();
      }
    }, 100);
  }

  function events() {
    window.addEventListener('list-setParams', function (event) {
      app.module.result.setParams(event.detail);
    });
    window.addEventListener('list-search', function (event) {
      app.module.result.setParams(event.detail);
      app.module.result.search();
    });
    window.addEventListener('list-research', function (event) {
      app.module.result.setParams(event.detail);
      app.module.result.research();
    });
  }

  app.plusReady(initialize);

  events();

  // 初始化环境
  mui.init({
    pullRefresh: {
      container: '#house-list',
      down: {
        callback: pulldownRefresh
      },
      up: {
        contentrefresh: '正在加载...',
        callback: pullupRefresh
      }
    }
  });

})(app, mui, jQuery, ko, _);