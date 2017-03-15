(function (app, mui, $, ko) {
  var communityId, baseImagePath = app.imagePath,
    source = {
      sourcePersonal: 'mark_geren.jpg',
      sourceBroker: 'mark_jjr.jpg',
      sourceZhiWu: 'mark_zhiwu.jpg'
    },
    tableId, type;
  app.map.initialize('allmap', 200);
  app.map.disableDragging();
  app.map.disableDoubleClickZoom();
  app.map.disablePinchToZoom();

  function SaleHouse(item) {
    this.tableId = item.tableId;
    this.imagePath = app.image.get(item.imagePath, app.config.noImage);
    //  this.imagePath = item.imagePath;
    this.communityName = item.communityName;
    this.areaName = item.areaName;
    this.house = item.room + '房' + item.hall + '厅';
    this.color = ['#ff8498', '#7cd9e1', '#ffb284', '#7ce17c'];
    this.features = item.feature.split(',').slice(0, 4);
    this.house = item.room + '房' + item.hall + '厅';
    this.sourceImage = baseImagePath + source[item.source];
    this.floor = item.theFloor + '/' + item.totalFloor + '层';
    this.unitPrice = item.unitPrice;
    this.totalPrice = item.totalPrice + '万';
    this.square = item.square;

    this.goToDetail = function () {
      app.util.goTo({
        url: 'houseDetail.htm',
        id: 'houseDetail-plot.htm',
        extras: {
          tableId: this.tableId,
          type: 'saleHouse'
        },
        show: {
          autoShow: false
        }
      });
    }
  }

  function RentHouse(item) {
    SaleHouse.call(this, item);
    this.rent = item.rent + '元/月';

    this.goToDetail = function () {
      app.util.goTo({
        url: 'houseDetail.htm',
        id: 'houseDetail-plot.htm',
        extras: {
          tableId: this.tableId,
          type: 'rentHouse'
        },
        show: {
          autoShow: false
        }
      });
    }
  }

  //unicode转String
  function hexToDec(str) {
    if (str) {
      str = str.replace(/\\/g, "%");
      return unescape(str);
    }
    return null;
  };

  function ViewModel(item) {
    var self = this;
    this.latitude = item.latitude;
    this.longitude = item.longitude;
    this.itemValue = item.theName;
    this.itemText = item.theName;
    this.theName = item.theName;
    this.averagePrice = item.averagePrice + '元/m²';
    this.salesPhone = item.salesPhone;
    this.propertyType = item.propertyType;
    this.volumeRate = item.volumeRate;
    this.developers = item.developers;
    this.communityName = item.communityName;
    this.buildingType = item.buildingType;
    this.greeningRate = item.greeningRate + '%';
    this.propertyFee = item.propertyFee + '元/平米*月';
    this.trafficCondition = item.trafficCondition;
    this.introduction = hexToDec(item.introduction);

    //  二手房
    this.saleHouseListData = _.map(item.saleHouseListData, function (el) {
      return new SaleHouse(el);
    });
    //  出租
    this.rentHouseListData = _.map(item.rentHouseListData, function (el) {
      return new RentHouse(el);
    });

    this.goHouseCalculator = function () {
      app.util.goTo('houseLoanCalculator.htm', {
        unitPrice: self.unitPrice || self.rent,
        square: self.square
      });
    };

  }

  function initialize() {
    //  type = app.util.getExtrasValue('type');
    communityId = app.util.getExtrasValue('communityId');
    app.request.postAction('tdwr', 'CommunityDetail', {
      p1: communityId
    }, function (response) {
      if (response.result === 'success') {
        var plotData = response.community;
        plotData.saleHouseListData = response.saleHouseList;
        plotData.rentHouseListData = response.rentHouseList;

        var vm = new ViewModel(plotData);
        app.map.center(vm);
        ko.applyBindings(vm);

        app.util.show();
      } else {
        app.messager.toast(response.info);
      }
    });
  }

  app.plusReady(initialize);
})(app, mui, jQuery, ko);