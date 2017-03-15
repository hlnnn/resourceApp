(function (app, mui, $, ko) {
  var baseImagePath = app.imagePath, // '/ResourceApp/images/',
    tableId, type, dataPack,
    source = {
      sourcePersonal: 'mark_geren.jpg',
      sourceBroker: 'mark_jjr.jpg',
      sourceZhiWu: 'mark_zhiwu.jpg'
    };

  function DataPack() {
    var self = this;
    this.dataBase = function (type) {
      this.requestUrl = ''; //请求地址
      this.responseData = ''; //请求数据
      if (type === 'sale') {
        this.collectUrl = 'HouseResourceCollectedSaleAdd';
        this.uncollectUrl = 'HouseResourceCollectedSaleDel';
      } else if (type === 'rent') {
        this.collectUrl = 'HouseResourceCollectedRentAdd';
        this.uncollectUrl = 'HouseResourceCollectedRentDel';
      } else {
        this.collectUrl = '';
        this.uncollectUrl = '';
      }
      this.viewModel = '';
      this.exceptNewHouse = true; //除了新房其他都有的属性
      this.onlyNewHouse = false; //只有新房有
      this.onlyRentOwner = false; //只有出租有的属性
      this.onlySaleOwner = false; //只有出售有的属性exceptNewHouse
      this.saleRentHouse = false; //只有二手房+租房有的属性
      this.saleRentSellHouse = true; //只有二手房+租房+出售有的属性
      this.sellRent = true; //只有出租+出售有的属性
      this.office = false; //只有写字楼有的属性
      this.fee = true; //物业费
    };
    //二手房
    this.saleHouse = function () {
      self.dataBase.call(this, 'sale');

      this.requestUrl = 'SaleHouseDetail';
      this.responseData = 'saleHouse';
      this.viewModel = SaleHouseModel;
      this.saleRentHouse = true;
      this.sellRent = false;
    };
    //租房
    this.rentHouse = function () {
      self.dataBase.call(this, 'rent');

      this.requestUrl = 'RentHouseDetail';
      this.responseData = 'rentHouse';
      this.viewModel = RentHouseModel;
      this.saleRentHouse = true;
      this.sellRent = false;
    };
    //新房
    this.newHouse = function () {
      self.dataBase.call(this);

      this.requestUrl = 'NewHouseDetail';
      this.responseData = 'theNewHouse';
      this.viewModel = NewHouseModel;
      this.onlyNewHouse = true;
      this.saleRentSellHouse = false;
      this.sellRent = false;
      this.exceptNewHouse = false;
    };
    //商铺出售
    this.saleShop = function () {
      self.dataBase.call(this, 'sale');

      this.requestUrl = 'SaleShopDetail';
      this.responseData = 'saleShop';
      this.viewModel = SaleShopModel;
      this.saleOwner = true;
      this.onlySaleOwner = true;
      this.fee = false;
    };
    //商铺出租
    this.rentShop = function () {
      self.dataBase.call(this, 'rent');

      this.requestUrl = 'RentShopDetail';
      this.responseData = 'rentShop';
      this.viewModel = RentShopModel;
      this.onlyRentOwner = true;
      this.saleRentSellHouse = false;
      this.fee = false;
    };
    //写字楼出售
    this.saleOffice = function () {
      self.dataBase.call(this, 'sale');

      this.requestUrl = 'saleOfficeDetail';
      this.responseData = 'saleOffice';
      this.viewModel = SaleOfficeModel;
      this.saleOwner = true;
      this.onlySaleOwner = true;
      this.office = true;
    };
    //写字楼出租
    this.rentOffice = function () {
      self.dataBase.call(this, 'rent');

      this.requestUrl = 'RentOfficeDetail';
      this.responseData = 'rentOffice';
      this.viewModel = RentOfficeModel;
      this.onlyRentOwner = true;
      this.saleRentSellHouse = false;
      this.office = true;
    };
  }

  //所有页面属性
  function ViewModel(item) {
    //新房有的属性
    this.theName = '';
    this.propertyDeveloper = '';
    this.theOpenDatetime = '';
    this.theTitle = '';
    this.theSchoolDistrict = '';
    this.propertyNumber = '';
    this.theMainHouseType = '';
    this.imageListOfHouseType = '';
    this.grouponDatetime = '';
    this.grouponTitle = '';
    this.publishDatetime = '';
    this.participantNum = '';
    this.buildingPrice = '';

    //出售有的属性
    this.fitManage = '';
    this.fitManageName = '';
    this.shopType = '';
    this.grade = '';

    //出租有的属性
    this.rent = '';
    this.averageRent = '';

    this.color = ['#ff8498', '#7cd9e1', '#ffb284', '#7ce17c'];
    this.clickCount = '浏览' + item.clickCount + '次';
    this.features = item.feature.split(',').slice(0, 4);
    this.imgLength = item.imageList.length;

    this.imageList = item.imageList.length ? _.map(item.imageList, function (el) {
      return {
        imagePath: app.image.get(el.imagePath, app.config.noImage)
      };
    }) : [{
      imagePath: app.image.noImage()
    }];
    //   this.imageList = app.image.get(item.imageList, app.config.noImage);
    //this.imagePath = item.imagePath;
    this.imagePath = app.image.get(item.imagePath, app.config.noImage);

    this.servicePhoneNumber = item.servicePhoneNumber;
    this.phoneNumber = item.phoneNumber;

    this.communityName = '';
    if (item.communityName) {
      this.communityName = item.communityName;
    } else if (item.buildingName) {
      this.communityName = item.buildingName;
    } else if (item.businessAreaName) {
      this.communityName = item.businessAreaName;
    }

    this.address = item.address;
    this.areaName = '';
    if (item.areaName) {
      this.areaName = item.areaName;
    } else if (item.cityPartition.theName) {
      this.areaName = item.cityPartition.theName;
    }

    this.updateTime = '';
    this.clickCount = '浏览' + item.clickCount + '次';
    //将feature字符串转化成数组后截取4个值
    this.square = item.square + 'm²';
    this.house = item.room + '房' + item.hall + '厅';
    this.orientation = item.orientation;
    this.finishDegree = item.finishDegree;
    this.floor = item.theFloor + '/' + item.totalFloor + '层';
    square = item.square; //传递面积

    if (!item.community) item.community = {};
    this.propertyFee = '';
    if (item.propertyFee) {
      this.propertyFee = item.propertyFee + '元/m²';
    } else if (item.community.propertyFee) {
      this.propertyFee = item.community.propertyFee + '元/m²';
    } else {
      this.propertyFee = '';
    }

    this.facility = '';
    this.fitManageName = '';
    if (item.fitManage) {
      this.fitManage = item.fitManage;
      this.fitManageName = '可经营类别：';
    } else if (item.facility) {
      this.fitManage = item.facility;
      this.fitManageName = '周边配套：';
    }
    this.propertyNumber = item.propertyNumber;
    this.theDescription = Base64.decode(item.theDescription);
    this.headImagePath = app.image.getLocal(item.headImagePath, app.config.noImage);
    this.contactName = item.contactName;

    this.sourceImage = baseImagePath + source[item.source];
    this.communityImageList = item.community.imageList;

    this.communityTheName = item.community.theName;
    this.communityDevelopers = item.community.developers;
    this.communityBuildingType = item.community.buildingType;
    this.communityintroduction = hexToDec(item.community.introduction);

    this.price = '';
    this.priceName = '';
    this.firstPaymentLease = '';
    this.firstPaymentLeaseName = '';
    this.monthlyPaymentChargesPaid = '';
    this.monthlyPaymentChargesPaidName = '';
    this.unitPriceArea = '';
    this.unitPriceAreaName = '';
    this.onlyNewHouse = dataPack.onlyNewHouse;
    this.exceptNewHouse = dataPack.exceptNewHouse;
    this.onlyRentOwner = dataPack.onlyRentOwner;
    this.onlySaleOwner = dataPack.onlySaleOwner;
    this.saleRentHouse = dataPack.saleRentHouse;
    this.saleRentSellHouse = dataPack.saleRentSellHouse;
    this.sellRent = dataPack.sellRent;
    this.office = dataPack.office;
    this.fee = dataPack.fee;

    this.unitPrice = item.unitPrice;
    this.communityId = item.communityId;
    this.latitude = item.latitude; //纬度
    this.longitude = item.longitude; //经度

    this.isSiteProspect = item.isSiteProspect;
    this.isLandlordCer = item.isLandlordCer;
    var self = this;
    // methods
    this.collect = function () {
      collect(self); //收藏
    }
    this.callZw = function () {
      app.util.call(this.servicePhoneNumber);
    };
    //this.callLandlord = function () {
    //  app.util.call(this.phoneNumber);
    //};
    this.share = function () {
      mui('#shareList').popover('toggle');
    };
    this.connect = function () {
      app.util.goTo('developing.htm');
    };
    this.feedback = function () {
      app.util.goTo('housingReport.htm', {
        type: type,
        houseId: tableId,
        feedback: 'housingReport'
      });
    };
    //小区详情页面跳转
    var plotId = 'housePlotDetail.htm';
    this.housePlotDetails = function () {
      if (window.plus && plus.webview.currentWebview().opener().id === plotId) {
        mui.back();
      } else {
        app.util.goTo(plotId, {
          communityId: self.communityId
        }, false);
      }
    };
    //地图页面跳转
    this.houseDetailsMap = function () {
      app.util.goTo('houseDetailMap.htm', {
        address: self.address,
        latitude: self.latitude,
        longitude: self.longitude
      });
    }

    //房贷计算器跳转
    this.goHouseCalculator = function () {
      app.util.goTo('houseLoanCalculator.htm', {
        unitPrice: self.unitPrice || self.rent,
        square: square
      });
    };
    this.shareItems = ko.observableArray();

    app.module.ServiceCall.call(this, '400-663-8008');
  }

  //收藏
  function collect(self) {
    var isCollected = self.isCollected(),
      url = isCollected ? dataPack.uncollectUrl : dataPack.collectUrl;
    app.request.postActionAuth('tudwr', url, {
      p1: tableId
    }, function (response) {
      if (response.result === "success") {
        self.isCollected(!isCollected);
        app.messager.toast(isCollected ? '取消收藏成功' : '收藏成功');
      } else {
        app.messager.toast(response.info);
      }
    });
  };

  //二手房+出租+出售共有的属性
  function SaleRentBase(item) {
    this.firstPaymentLeaseName = '参考首付：';
    this.firstPaymentLease = item.firstPayment + '万元';
    this.updateTime = item.updateTime + '天前';
    //this.areaName = item.areaName;
    this.theTitle = item.theTitle;
    this.price = item.totalPrice + '万';
    this.priceName = '总价';
    this.monthlyPaymentChargesPaid = item.monthlyPayment + '元';
    this.monthlyPaymentChargesPaidName = '参考月供：';
    this.unitPriceArea = item.unitPrice + '元/m²';
    this.unitPriceAreaName = '面积单价：';
    this.shopType = '';
    if (item.shopType) {
      this.shopType = item.shopType;
    } else if (item.officeType) {
      this.shopType = item.officeType;
    } else {
      this.shopType = '';
    }
  }

  //二手房Model
  function SaleHouseModel(item) {
    ViewModel.call(this, item);
    SaleRentBase.call(this, item);
    // 数据没有Base64编码
//  this.theDescription = item.theDescription;
  }

  //租房Model
  function RentHouseModel(item) {
    ViewModel.call(this, item);
    this.updateTime = item.updateTime + '天前';
    this.areaName = item.areaName;
    this.theTitle = item.theTitle;
    this.price = item.rent + '元';
    this.priceName = '月租';
    this.firstPaymentLease = item.theType;
    this.firstPaymentLeaseName = '租赁方式:';
    this.monthlyPaymentChargesPaid = item.rentType;
    this.monthlyPaymentChargesPaidName = '租金押付：';
    this.unitPriceArea = item.square + 'm²';
    this.unitPriceAreaName = '面积：';
    this.unitPrice = item.rent;
  }

  //新房Model
  function NewHouseModel(item) {
    ViewModel.call(this, item);
    //没有的属性
    this.communityintroduction = '';
    this.updateTime = item.updateTime + '天前';
    this.buildingPrice = item.buildingPrice + '元/m²';
    //参与团购
    this.grouponTitle = item.grouponTitle;
    this.grouponDatetime = item.grouponDatetime.split('T')[0];
    this.updateTime = item.publishDatetime.split('T')[0];
    this.participantNum = item.participantNum;
    //开发商
    this.propertyDeveloper = item.propertyDeveloper;
    //开盘时间
    this.theOpenDatetime = item.theOpenDatetime.split('T')[0];
    //最新开盘
    this.theTitle = item.theTitle;
    this.theSchoolDistrict = item.theSchoolDistrict;
    //主力户型
    this.theMainHouseType = item.theMainHouseType;
    //项目介绍
    //this.theDescription = Base64.decode(item.theDescription);
    this.imageListOfHouseType = item.imageListOfHouseType;

    this.extendInfo = item.imageListOfHouseType.imagePath;

    this.imagePath = app.image.get(item.imageListOfHouseType.imagePath, app.config.noImage);
    //  this.imagePath = item.imageListOfHouseType.imagePath;
  }

  //商铺销售Model
  function SaleShopModel(item) {
    ViewModel.call(this, item);
    SaleRentBase.call(this, item);
  }

  //商铺出租Model
  function RentShopModel(item) {
    ViewModel.call(this, item);
    SaleRentBase.call(this, item);
    this.grade = item.grade;
    this.rent = item.rent + '元';
    this.averageRent = item.averageRent;
  }

  //写字楼出售Model
  function SaleOfficeModel(item) {
    ViewModel.call(this, item);
    SaleRentBase.call(this, item);
    this.grade = item.grade;
  }

  //写字楼出租Model
  function RentOfficeModel(item) {
    ViewModel.call(this, item);
    SaleRentBase.call(this, item);
    this.grade = item.grade;
    this.rent = item.rent + '元';
    this.averageRent = item.averageRent;
  }

  //unicode转String
  function hexToDec(str) {
    if (str) {
      str = str.replace(/\\/g, "%");
      return unescape(str);
    }
    return null;
  };

  mui.init();
  function initialize() {
    
    //轮播的数字
    document.querySelector('.mui-slider').addEventListener('slide', function (event) {
      document.getElementById("info").innerText = event.detail.slideNumber + 1;
    });

    mui.previewImage();
    var member = app.localStorage.getMember(),
      memberId = member == null ? undefined : member.memberId,
      params = app.util.getParam() || {},
      extras = app.util.getExtras();
    tableId = params.id || extras.tableId;
    type = params.type || extras.type;
    dataPack = new(new DataPack()[type])();
    var url = dataPack.requestUrl,
      responseData = dataPack.responseData,
      viewModel = dataPack.viewModel;

    app.request.postAction('tdwr', url, {
      p1: tableId,
      memberId: memberId
    }, function (response) {
      if (response.result === 'success') {
        var detail = response[responseData];
        detail.servicePhoneNumber = response.servicePhoneNumber;
        detail.communityId = response.communityId;
        var vm = new viewModel(detail);
        vm.isCollected = ko.observable(response.isCollected);
        var shareItems = app.module.share.shareItems;
        _.each(shareItems, function (el) {
          //el.msg.href = app.config.requestPath + 'App/' + fileName + '?id=' + tableId + '&type=' + type;
          el.msg.href = app.config.requestPath + 'webApp/' + type + 'Detail.html5?houseId=' + tableId;
          el.msg.title = vm.communityName;
          el.msg.thumbs = vm.imageList;
          el.msg.extra.scene = el.extra;
        });
        vm.shareItems(shareItems);
        ko.applyBindings(vm);
      } else {
        app.messager.toast(response.info);
      }
      app.util.show();
    });

  }
  //initialize();

  app.plusReady(initialize);
})(app, mui, jQuery, ko);