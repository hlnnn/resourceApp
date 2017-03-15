// Result
(function (app) {
  var
    dataPack,
    filter,
    pullRefresh;

  function Result() {
    this.color = ['#ff8498', '#7cd9e1', '#ffb284', '#7ce17c'];
    this.houseList = ko.observableArray();
  }

  function HouseItem(model) {
    var self = this;
    this.tableId = model.tableId;
    this.type = model.theType;
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
        this.stateCn = '已通过';
        this.stateIcon = 'icon-pass';
        this.stateColor = '#50cb53';
        break;
      default:
        this.stateCn = '失败';
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
        pullRefresh && pullRefresh.endPullupToRefresh(true);
      else
        setTimeout(function () {
          filter.pageNumber++;
          app.module.houseList.result.search(function () {
            pullRefresh.endPullupToRefresh(filter.pageNumber >= filter.totalPage);
          });
        }, 100);
    }

    //ko.applyBindings(this, dom);
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
      if (filter.pageNumber === 1) {
        self.houseList.removeAll();
        pullRefresh && pullRefresh.scrollTop();
      }
      if (response.result === 'success') {
        var houseItem = houseItemMap[dataPack.type],
          datas = response[dataPack.responseData];
        for (var i = 0, len = datas.length; i < len; i++) {
          self.houseList.push(new houseItem(datas[i]));
        }
        filter.totalPage = response.totalPage;
        filter.totalCount(response.totalCount);
      } else {
        app.messager.toast('没有数据');
      }
      callback && callback();
    });
  }

  app.module.Result = Result;
})(app);
