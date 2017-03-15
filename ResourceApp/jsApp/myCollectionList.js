(function (app, mui, $, ko, _) {

  //var types = 'MyCollectedSaleHouseList,MyCollectedRentHouseList,MyCollectionRentShop,MyCollectionSaleShop,MyCollectionRentOffice,MyCollectionSaleOffice'.split(',');
  var types = 'saleHouse,rentHouse,rentShop,saleShop,rentOffice,saleOffice'.split(',');

  var dataPacks;
  var dataPack;
  var module = {};

  // 查询结果
  (function () {
    function Result() {

      this.color = ['#ff8498', '#7cd9e1', '#ffb284', '#7ce17c'];
      //this.houseList = ko.observableArray();
      //this.houseLists = {};
      this.titles = '';
      // 滑动事件
      this.slide = function (v, e) {
        //e.detail.slideNumber 滑动的选项卡
        dataPack = dataPacks[e.detail.slideNumber];
        this.research();
        //self.getSaleHouseList(e.detail.slideNumber);
      };

    }

    function HouseItem(model) {
      var self = this;
      this.tableId = model.tableId;
      this.type = dataPack.type;
      this.feature = model.feature;
      this.unitPrice = model.unitPrice;
      this.source = model.source;
      this.isSiteProspect = model.isSiteProspect;
      this.isLandlordCer = model.isLandlordCer;
      this.cityPartition = model.cityPartition;
      this.buildingName = model.buildingName;
      this.address = model.address;
      this.features = this.feature.split(',').splice(0, 4);

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
      if (model.state === 0) {
        this.stateCn = '待审核';
      } else if (model.state === 1) {
        this.stateCn = '已发布';
      } else {
        this.stateCn = '失败';
      }
    }

    function SaleHouse(model) {
      var saleHouseModel = model.saleHouse;
      HouseItem.call(this, saleHouseModel);

      this.totalPrice = saleHouseModel.totalPrice;
      this.imagePath = app.image.get(saleHouseModel.imagePath, app.config.noImage);
      this.areaName = saleHouseModel.areaName;
      this.communityName = saleHouseModel.communityName;
      this.unitPriceDisplay = this.unitPrice + '元/㎡';
      this.totalPriceDisplay = this.totalPrice + '万元';
      this.realSupply = true;
      this.prospecting = true;
      this.footer = true;
    }

    function RentHouse(model) {
      var rentHouseModel = model.rent;
      HouseItem.call(this, rentHouseModel);
      this.totalPrice = rentHouseModel.rent;
      this.imagePath = app.image.get(rentHouseModel.imagePath, app.config.noImage);
      this.areaName = rentHouseModel.areaName;
      this.communityName = rentHouseModel.communityName;
      this.unitPriceDisplay = '';
      this.totalPriceDisplay = this.totalPrice + '元/月';
      this.realSupply = true;
      this.prospecting = true;
      this.footer = true;
    }

    function SaleShop(model) {
      var saleShopModel = model.saleHouse;
      HouseItem.call(this, saleShopModel);
      this.imagePath = app.image.get(saleShopModel.imagePath, app.config.noImage);
      this.areaName = saleShopModel.areaName;
      this.communityName = saleShopModel.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = saleShopModel.shopType;
      this.totalPriceDisplay = saleShopModel.totalPrice + '万';
      this.unitPriceDisplay = saleShopModel.unitPrice + '元/m²';
    }

    function RentShop(model) {
      var rentShopModel = model.rent;
      HouseItem.call(this, rentShopModel);
      this.imagePath = app.image.get(rentShopModel.imagePath, app.config.noImage);

      this.areaName = rentShopModel.areaName;
      this.communityName = rentShopModel.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = rentShopModel.shopType;
      this.totalPriceDisplay = rentShopModel.rent + '元/月';
      this.unitPriceDisplay = rentShopModel.averageRent + '元/m².月';
    }

    function SaleOffice(model) {
      var saleOfficeModel = model.saleHouse;
      HouseItem.call(this, saleOfficeModel);
      this.imagePath = app.image.get(saleOfficeModel.imagePath, app.config.noImage);

      this.areaName = saleOfficeModel.areaName;
      this.communityName = saleOfficeModel.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = saleOfficeModel.shopType;
      this.totalPriceDisplay = saleOfficeModel.totalPrice + '万';
      this.unitPriceDisplay = saleOfficeModel.unitPrice + '元/m²';
    }

    function RentOffice(model) {
      var rentOfficeModel = model.rent;
      HouseItem.call(this, rentOfficeModel);
      this.imagePath = app.image.get(rentOfficeModel.imagePath, app.config.noImage);
      this.areaName = rentOfficeModel.areaName;
      this.communityName = rentOfficeModel.businessAreaName;
      this.room = '';
      this.hall = '';
      this.houseTypeDisplay = rentOfficeModel.shopType;
      this.totalPriceDisplay = rentOfficeModel.rent + '元/月';
      this.unitPriceDisplay = rentOfficeModel.averageRent + '元/m².月';
    }

    var houseItemMap = {
      saleHouse: SaleHouse,
      rentHouse: RentHouse,
      saleShop: SaleShop,
      rentShop: RentShop,
      saleOffice: SaleOffice,
      rentOffice: RentOffice
    }

    Result.prototype.initialize = function (dom, houses) {
      dataPacks = new DataPack();
      dataPack = dataPacks[0];
      this.titles = dataPacks;
      //    console.log(_.pairs(this))
      //    this.detail = function () {
      //      app.util.goTo('houseDetail.htm', {
      //        tableId: dataPack.type.tableId,
      //        type:  dataPack.type
      //      }, false);
      //    };

      ko.applyBindings(this, dom);
      //    if (houses)
      //      this.load(houses);
    };
    Result.prototype.load = function (datas) {
      var houseItem = houseItemMap[dataPack.type];
      for (var i = 0, len = datas.length; i < len; i++) {
        dataPack.houseList.push(new houseItem(datas[i]));
      }
      mui.later(function () {
        mui('#' + dataPack.type + '-scroll-wrapper').scroll({ indicators: true });
      }, 500);
    };
    Result.prototype.reload = function (datas) {
      dataPack.houseList.removeAll();
      this.load(datas);
    };

    Result.prototype.research = function () {
      search(this, this.reload);
    };
    //  Result.prototype.search = function () {
    //    search(this, this.load);
    //  };
    //      Result.prototype.detail = function () {
    //        console.log(1)
    //        app.util.goTo('houseDetail.htm', {
    //          tableId: dataPack.type.tableId,
    //          type: dataPack.type
    //        }, false);
    //      }

    function search(self, callback) {
      if (dataPack.isInit()) {
        //callback.call(self, self.houseLists[dataPack.type]);
        return;
      }
      app.request.postActionAuth('tdwr', dataPack.requestUrl, dataPack.filter, function (response) {
        if (response.result === 'success') {
          callback.call(self, response[dataPack.responseData]);
        } else {
          //self.houseList.removeAll();
          app.messager.toast('没有数据');
        }
        dataPack.isInit(true);
      });
    }

    app.module.result = new Result();
  })();

  function DataPack() {
    var self = this;
    this.DataBase = function () {
      var self = this;
      this.tableId = '';
      this.requestUrl = '';
      this.responseData = '';
      this.type = ko.observable();
      this.isInit = ko.observable(false);
      this.houseList = ko.observableArray();
      this.filter = module.Filter;

      this.detail = function (record) {
        app.util.goTo('houseDetail.htm', {
          tableId: record.tableId,
          type: self.type
        }, false);
      };
    }

    //二手房
    this.SaleHouseData = function () {
      self.DataBase.call(this);
      this.requestUrl = 'MyCollectedSaleHouseList';
      this.responseData = 'saleHouseList';
      this.type = 'saleHouse';
      this.title = '二手房';

    }

    // 租房
    this.RentHouseData = function () {
      self.DataBase.call(this);
      this.requestUrl = 'MyCollectedRentHouseList';
      this.responseData = 'rentHouseList';
      this.type = 'rentHouse';
      this.title = '租房';
    }

    // 商铺出租
    this.RentShopData = function () {
      self.DataBase.call(this);
      this.requestUrl = 'MyCollectedRentShopList';
      this.responseData = 'rentShopList';
      this.type = 'rentShop';
      this.title = '商铺出租';
    }

    // 商铺出售
    this.SaleShopData = function () {
      self.DataBase.call(this);
      this.requestUrl = 'MyCollectedSaleShopList';
      this.responseData = 'saleShopList';
      this.type = 'saleShop';
      this.title = '商铺出售';
    }

    // 写字楼出租
    this.RentOfficeData = function () {
      self.DataBase.call(this);
      this.requestUrl = 'MyCollectedRentOfficeList';
      this.responseData = 'rentOfficeList';
      this.type = 'rentOffice';
      this.title = '写字楼出租';
    }

    // 写字楼出售
    this.SaleOfficeData = function () {
      self.DataBase.call(this);
      this.requestUrl = 'MyCollectedSaleOfficeList';
      this.responseData = 'saleOfficeList';
      this.type = 'saleOffice';
      this.title = '写字楼出售';
    }

    var pack = [];
    for (var i = 0; i < types.length; i++) {
      pack.push(new (this[_.capitalize(types[i]) + 'Data'])());
    }
    return pack;
  }

  function initialize() {

    app.module.result.initialize();
    app.module.result.research();
    //  app.module.result.detail();

    /*mui('#sider-scroll').scroll({
      bounce: true,
      indicators: true,
      deceleration: mui.os.ios ? 0.003 : 0.0009
    });*/

    //mui('#slider').slider().gotoItem(1);
  }

  // Filter
  (function () {
    function Filter() {
      this.pageNumber = 1;
      this.countPerPage = 20;
    }

    module.Filter = new Filter();
  })();

  mui.init();
  //app.plusReady(initialize);
  initialize();
  $('.mui-control-content').height($(window).height() - app.lineHeight * 2);
})(app, mui, jQuery, ko, _)