;(function (app, mui, $, ko, _) {
  var city = app.localStorage.getCity(), //城市Id 
    vm,
    type,
    tableId,
    dataPack,
    datas,
    dataSource = {},
    title,
    dongHtml = '<div class="toast mui-text-center"><input type="number" name="dong" id="dong"/>栋' +
    '<input type="number" id="unit" />单元' +
    '<input type="number" id="shi" />室</div>',
    totalFloorHtml = '<div class="toast mui-text-center">第<input type="number" name="theFloor" id="theFloor"/>层，' +
    '共<input type="number"  id="totalFloor" name="totalFloor"/>层</div>',
    areaArr = [],
    roomArr = [],
    hallArr = [],
    guardArr = [],
    rentTypeArr = [],
    orientationArr = [],
    finishDegreeArr = [],
    buildingTypeArr = [],
    propertyTypeArr = [],
    pickerArea = new mui.PopPicker({ layer: 2 }),
    pickerHuXing = new mui.PopPicker({ layer: 3 }),
    pickerOrientation = new mui.PopPicker(),
    pickerFinishDegree = new mui.PopPicker(),
    pickerBuildingType = new mui.PopPicker(),
    pickerPropertyType = new mui.PopPicker(),
    pickerRentType = new mui.PopPicker();

  function PopPickerData(text, value, children) {
    this.text = text;
    this.value = value;
    this.children = children;
  }

  for (var i = 0; i <= 10; i++) {
    guardArr.push(new PopPickerData(i + '卫', i));
    hallArr.push(new PopPickerData(i + '厅', i, guardArr));
    roomArr.push(new PopPickerData(i + '室', i, hallArr));
  }
  pickerHuXing.setData(roomArr);

  orientationArr.push(new PopPickerData('面东', '面东'), new PopPickerData('东南', '东南'), new PopPickerData('面南', '面南'), new PopPickerData('西南', '西南'), new PopPickerData('面西', '面西'), new PopPickerData('西北', '西北'), new PopPickerData('东北', '东北'));
  pickerOrientation.setData(orientationArr);

  finishDegreeArr.push(new PopPickerData('豪华装修', '豪华装修'), new PopPickerData('精装修', '精装修'), new PopPickerData('中等装修', '中等装修'), new PopPickerData('简单装修', '简单装修'), new PopPickerData('毛坯', '毛坯'));
  pickerFinishDegree.setData(finishDegreeArr);

  buildingTypeArr.push(new PopPickerData('钢混', '钢混'), new PopPickerData('混合', '混合'), new PopPickerData('框架', '框架'), new PopPickerData('砖木', '砖木'));
  pickerBuildingType.setData(buildingTypeArr);

  propertyTypeArr.push(new PopPickerData('多层', '多层'), new PopPickerData('高层', '高层'), new PopPickerData('小高层', '小高层'), new PopPickerData('双拼', '双拼'), new PopPickerData('联排', '联排'), new PopPickerData('独栋', '独栋'));
  pickerPropertyType.setData(propertyTypeArr);

  rentTypeArr.push(new PopPickerData('押一付一', '押一付一'), new PopPickerData('押一付二', '押一付二'), new PopPickerData('押一付三', '押一付三'), new PopPickerData('半年付', '半年付'), new PopPickerData('年付', '年付'), new PopPickerData('面议', '面议'));
  pickerRentType.setData(rentTypeArr);

  function DataPack() {
    var self = this;
    this.data = function () {
      this.title = '';
      this.rentSale = true;
      this.rentVisible = false;
      this.wantRentVisible = false;
      this.wantVisible = true;
      this.saleVisible = true;
      this.myVisible = true;　 //来源于编辑
      this.facilities = '';
      this.features = '';
      this.finishDegreeText = '房屋配置';
      this.requestUrl = 'PublishSaleHouseSecond';
      this.detailRequestUrl = '';
      this.detailRequestData = '';
      this.type='';
    };

    this.saleHouse = function () {
      self.data.call(this);
      this.title = '发布出售';
      this.type='SaleHouse';
      this.facilities = _.map(['餐饮美食', '服饰鞋包', '医疗美容', '银行金融', '百货超市', '酒店宾馆', '家居建材', '休闲娱乐', '学校', '菜场', '其他'], function (el) {
        return { text: el, value: el };
      });
      this.features = _.map(['精装修', '南北通透', '家电齐全', '拎包入住', '随时看房', '产权满两年', '产权满五年', '唯一房产', '电梯房', '学区房', '高端住宅'], function (el) {
        return { text: el, value: el };
      });
      this.finishDegreeText = '配套设施';
      this.requestUrl = 'PublishSaleHouseSecond';
    };
    this.rentHouse = function () {
      self.data.call(this);
      this.title = '发布出租';
      this.type='RentHouse';
      this.rentVisible = true;
      this.saleVisible = false;
      this.wantRentVisible = true;
      this.facilities = _.map(['床', '家具', '有线电视', '宽带', '热水器', '空调', '洗衣机', '冰箱', '煤气', '独立厨房', '车位', '电梯', '露台/花园', '其他'], function (el) {
        return { text: el, value: el };
      });
      this.features = _.map(['精装修', '含水电', '含物业费', '家电齐全', '拎包入住', '地铁沿线', '干净整洁', '多路公交', '独立车库', '送宽带', '学区房', '单身公寓', '其他'], function (el) {
        return { text: el, value: el };
      });
      this.requestUrl = 'PublishRentHouseSecond';
    };
    this.wantedRentHouse = function () {
      self.rent.call(this);
      this.title = '发布求租';
      this.type='WantedRentHouse';
      this.rentSale = false;
      this.wantVisible = false;
      this.requestUrl = 'PublishWantedRentHouseSecond';
    };
    this.wantedBuyHouse = function () {
      self.sale.call(this);
      this.title = '发布求购';
      this.rentSale = false;
      this.rentVisible = false;
      this.wantRentVisible = false;

      this.wantVisible = false;
      this.requestUrl = 'PublishWantedBuyHouseSecond';
    };

    this.mySaleHouse = function () {
      self.saleHouse.call(this);
      this.mySaleVisible = false;
      this.myVisible = false;
      this.detailRequestUrl = 'SaleHouseDetail';
      this.detailRequestData = 'saleHouse';
    };
    this.myRentHouse = function () {
      self.rentHouse.call(this);
      this.myVisible = true;
      this.detailRequestUrl = 'RentHouseDetail';
      this.detailRequestData = 'rentHouse';
    };
    this.myWantBuy = function () {
      self.wantedBuyHouse.call(this);
      this.detailRequestUrl = 'WantedBuyHouseDetail';
      this.detailRequestData = 'wantedBuyHouse';
    };
    this.myWantRent = function () {
      self.wantedRentHouse.call(this);
      this.detailRequestUrl = 'WantedRentHouseDetail';
      this.detailRequestData = 'wantedRentHouse';
    };
  }

  function Data(item) {
    this.tableId = tableId;
    this.houseType = item.houseType;
    this.cityPartitionId = item.cityPartitionId;
    this.areaName = item.areaName;
    this.businessAreaId = item.businessAreaId;
    this.businessAreaName = item.businessAreaName;
    this.communityName = item.communityName;
    this.communityId = item.communityId;
    this.dong = item.dong;
    this.unit = item.unit;
    this.shi = item.shi;
    this.room = item.room;
    this.hall = item.hall;
    this.toilet = item.toilet;
    this.theFloor = item.theFloor;
    this.totalFloor = item.totalFloor;
    this.orientation = item.orientation;
    this.square = item.square;
    this.coverSquare = item.coverSquare;
    this.gardenSquare = item.gardenSquare;
    this.totalPrice = item.totalPrice;
    this.finishDegree = item.finishDegree;
    this.feature = item.features;
    this.facility = item.facilities;
    this.description = item.description;
    this.buildingType = item.buildingType;
    this.propertyType = item.propertyType;
    this.propertyFee = item.propertyFee;
    this.landImagePath = item.landImagePath;
    this.houseImagePath = item.houseImagePath;
    this.coverImage = item.coverImage();

    //租房
    this.theType = item.theType;
    this.rentType = item.rentType;
    this.rent = item.rent;
  }

  //前端视图模型
  function ViewModel(item) {
    var self = this;
    this.title = dataPack.title;
    this.houseType = ko.observable(item.houseType); //住宅类型
    this.houseTypeShow = function () {
      if (this.houseType() === "别墅") {
        return true;
      } else {
        return false;
      }
    } //别墅面积显示
    this.cityPartitionId = ko.observable(item.areaId); //区域商圈(区域ID)
    this.businessAreaId = ko.observable(item.businessAreaId); //区域商圈(街道ID)
    this.areaName = ko.observable(item.areaName); //区域商圈(区域ID)
    this.businessAreaName = ko.observable(item.businessAreaName); //区域商圈(街道ID)
    this.businessName = ko.observable('');
    this.communityName = ko.observable(item.communityName); //小区名字
    this.communityId = ko.observable(item.communityId); //小区名字Id
    this.dong = ko.observable(item.dong); //楼栋号（栋）
    this.unit = ko.observable(item.unit); //楼栋号（单元）
    this.shi = ko.observable(item.shi); //楼栋号（室）
    this.room = ko.observable(item.room); //户型(室)
    this.hall = ko.observable(item.hall); //户型(厅)
    this.toilet = ko.observable(item.toilet); //户型(卫)
    this.huxing = ko.observable(''); //户型
    this.theFloor = ko.observable(item.theFloor); //楼层（第几层）
    this.totalFloor = ko.observable(item.totalFloor); //楼层（共几层）
    this.orientation = ko.observable(item.orientation); //朝向
    this.square = ko.observable(item.square); //面积
    this.coverSquare = ko.observable(item.coverSquare); //
    this.gardenSquare = ko.observable(item.gardenSquare); //别墅花园面积
    this.totalPrice = ko.observable(item.totalPrice); //售价
    this.finishDegree = ko.observable(item.finishDegree); //装修
    if (item.feature) {
      item.feature = item.feature.split(',');
    }
    this.features = ko.observableArray(item.feature); //房源特色

    if (item.facility) {
      item.facility = item.facility.split(',');
    }
    this.facilities = ko.observableArray(item.facility);

    this.facilitiesArr = dataPack.facilities;
    this.featuresArr = dataPack.features;

    this.theTitle = ko.observable(item.theTitle); //标题
    
    this.buildingType = ko.observable(item.buildingType); //建筑类型
    this.propertyType = ko.observable(item.propertyType); //物业类别
    this.propertyFee = ko.observable(item.propertyFee); //物业费

    this.blockNo = ko.observable();
    if (this.dong() || this.unit() || this.shi()) {
      this.blockNo(this.dong() + '栋' + this.unit() + '单元' + this.shi() + '室');
    }

    this.floor = ko.observable();
    if (this.theFloor() || this.totalFloor()) {
      this.floor('第' + this.theFloor() + '层，总共' + this.totalFloor() + '层');
    }
    this.businessTap = function () {
      pickerArea.show(function (selectedItems) {
        self.businessName(selectedItems[0].text + selectedItems[1].text);
        self.cityPartitionId(selectedItems[0].value);
        self.businessAreaId(selectedItems[1].value);
      });
    };
    this.communityShow = function () {
      if (self.businessAreaId()) {
        app.util.goTo('communityChoice.htm', {
          selected: self.communityName(),
          businessAreaId: self.businessAreaId()
        });
      } else {
        app.messager.toast('区域还没选择');
      }
    }; //小区选择
    this.huXingTap = function () {
      pickerHuXing.show(function (selectedItems) {
        self.room(selectedItems[0].value);
        self.hall(selectedItems[1].value);
        self.toilet(selectedItems[2].value);
        self.huxing(self.room() + '室' + self.hall() + '厅' + self.toilet() + '卫');
      });
    };
    this.orientationTap = function () {
      pickerOrientation.show(function (selectedItems) {
        self.orientation(selectedItems[0].text);
      });
    };
    this.finishDegreeTap = function () {
      pickerFinishDegree.show(function (selectedItems) {
        self.finishDegree(selectedItems[0].text);
      });
    };
    this.buildingTypeTap = function () {
      pickerBuildingType.show(function (selectedItems) {
        self.buildingType(selectedItems[0].text);
      });
    };
    this.propertyTypeTap = function () {
      pickerPropertyType.show(function (selectedItems) {
        self.propertyType(selectedItems[0].text);
      });
    };
    this.publishMultipleChoice = function (type) { //配套设施、房源特色
      var selecteds;
      if (type === 'facility') {
        title = '配套设施';
        datas = JSON.stringify(self.facilitiesArr);
        selecteds = self.facilities();
      } else {
        title = '房源特色';
        datas = JSON.stringify(self.featuresArr);
        selecteds = self.features();
      }
      app.util.goTo('ctrlChoiceMutli.htm', { title: title, datas: datas, selecteds: selecteds, type: type });
    };
    this.landImagePath = ko.observable();
    this.houseImagePath = ko.observable();
    this.imgDefault = app.config.imagePath + 'ico_upload_certificate.png';
    if (item.landImagePath) {
      this.landImagePath = ko.observable(item.landImagePath);
    } else {
      this.landImagePath(this.imgDefault); //土地证图片
    }

    if (item.houseImagePath) {
      this.houseImagePath(item.houseImagePath); //房产证图片
    } else {
      this.houseImagePath(this.imgDefault);
    }
    
    this.coverImagePathArr = ko.observableArray(); //图片设置封面
    this.coverImage = ko.observable(); //图片设置封面
    for (var i = 0; i < item.imageList.length; i++) {
      this.coverImagePathArr.push(item.imageList[i].imagePath);
    }
    this.getPhoto = function (imgType) {
      var btnArray = [{
        title: "拍照或录像"
      }, {
        title: "选取现有的"
      }];
      plus.nativeUI.actionSheet({
        title: "选择照片",
        cancel: "取消",
        buttons: btnArray
      }, function (e) {
        var index = e.index;
        switch (index) {
          case 0:
            break;
          case 1:
            app.module.photo.getImage();
            break;
          case 2:
            app.module.photo.galleryImg();
            break;
        }
      });
      app.module.photo.uploadHeadSuccess = function (response) {
        if (imgType === 'landImage') {
          self.landImagePath(response.imagePath);
        } else if (imgType === 'houseBuildingImage') {
          self.houseImagePath(response.imagePath);
        } else {
          self.coverImagePathArr.push(response.imagePath);
          var coverImg = self.coverImagePathArr().join(',');
          var imageInfoAdd = { p1: dataPack.type, p2: tableId, p3: coverImg };
          
          app.request.postActionAuth('tdwr', 'ImageInfoAdd', imageInfoAdd, function (response) {
            self.coverImage(response.imageInfoIdList[0]);
          }); 
        }
      };
    };
    this.saleVisible = dataPack.saleVisible;
    this.rentSale = dataPack.rentSale;
    this.wantRentVisible = dataPack.wantRentVisible;
    this.wantVisible = dataPack.wantVisible;
    this.myVisible = dataPack.myVisible;
    this.finishDegreeText = dataPack.finishDegreeText;

    //出租
    this.theType = ko.observable(item.theType);
    this.rentVisible = dataPack.rentVisible;
    this.rent = ko.observable(item.rent);
    this.rentType = ko.observable(item.rentType);
    this.payWayTap = function () {
      pickerRentType.show(function (selectedItems) {
        self.rentType(selectedItems[0].text);
      });
    };
    this.nexTap = function () {
      var model = new Data(self);
      
      app.request.postActionAuth('tudwr', dataPack.requestUrl, model, function (response) {
        if (response.result === "success") {
          app.util.goTo('publishHouseSuccess.htm');
        } else {
          app.messager.toast(response.info);
        }
      });
    };

    //空组合输出处理
    if (!(_.isEmpty(item))) {
      this.businessName(this.areaName() + this.businessAreaName());
      this.huxing(this.room() + '室' + this.hall() + '厅' + this.toilet() + '卫');
    }
    this.description = ko.pureComputed(function () {
      if (item.theDescription) {
        return item.theDescription;
      } else {
        if (self.huxing() && self.businessName() && self.communityName() && self.theFloor() && self.features() && self.facilities()) {
          return "我的房子是" + self.huxing() + ",在" + self.businessName() + self.communityName() + ",位于" + self.theFloor() + "层,周边有" + self.features() + self.facilities();
        }
        return '';
      }
    });; //描述
  };

  
  function detailSearch() {  
    if (dataPack.detailRequestUrl) {
       app.request.postAction('tudwr', dataPack.detailRequestUrl, { p1: tableId }, function (response) {
        if (response.result === 'success') {
          dataSource = response[dataPack.detailRequestData];
          vm = new ViewModel(dataSource);
          ko.applyBindings(vm);
        }
        app.util.show();
      });
    } else {
      vm = new ViewModel(dataSource);
      ko.applyBindings(vm);
      app.util.show();
    }
  }; //来源编辑页面请求

  function Area() {  //区域请求数据
    if (city.areas) {
      var areaList = city.areas.areaList;
      for (var i = 1; i < areaList.length; i++) {
        var area = areaList[i],
          areaItem = { 'text': area.theName, 'value': area.tableId, 'children': [] },
          itemList = area.itemList;
        for (var j = 1; j < itemList.length; j++) {
          var street = itemList[j],
            streetItem = { 'text': street.theName, 'value': street.tableId };
          areaItem.children.push(streetItem);
        }
        areaArr.push(areaItem);
      }
      pickerArea.setData(areaArr);
    }
  }

  function events() {
    Area();
    window.addEventListener('community-selected', function (event) {
      var detail = event.detail;
      vm.communityId(detail.communityId),
        vm.communityName(detail.communityName);
    });

    window.addEventListener('choice-selected-facility', function (event) {
      _.map(event.detail.selecteds, function (el) {
        vm.facilities.push(el.text);
      });
    });

    window.addEventListener('choice-selected-feature', function (event) {
      _.map(event.detail.selecteds, function (el) {
        vm.features.push(el.text);
      });
    });

    document.getElementById("blockNo").addEventListener('tap', function (e) {
      e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
      var btnArray = ['取消', '确定'];
      mui.prompt(dongHtml, '', '楼栋号', btnArray, function (e) {
        if (e.index === 1) {
          var dong = document.querySelector('#dong').value,
            unit = document.querySelector('#unit').value,
            shi = document.querySelector('#shi').value;
          vm.dong(dong);
          vm.unit(unit);
          vm.shi(shi);
          if (dong || unit || shi) {
            vm.blockNo(vm.dong() + '栋' + vm.unit() + '单元' + vm.shi() + '室');
          } else {
            vm.blockNo('');
          }

        }
      }, 'div');
      document.querySelector('#dong').value = vm.dong();
      document.querySelector('#unit').value = vm.unit();
      document.querySelector('#shi').value = vm.shi();
    });

    document.getElementById("floor").addEventListener('tap', function (e) {
      e.detail.gesture.preventDefault(); //修复iOS 8.x平台存在的bug，使用plus.nativeUI.prompt会造成输入法闪一下又没了
      var btnArray = ['取消', '确定'];
      mui.prompt(totalFloorHtml, '', '楼层', btnArray, function (e) {
        if (e.index === 1) {
          vm.theFloor(document.querySelector('#theFloor').value);
          vm.totalFloor(document.querySelector('#totalFloor').value);
          vm.floor('第' + vm.theFloor() + '层,总共' + vm.totalFloor() + '层');
        }
      }, 'div');
      document.querySelector('#theFloor').value = vm.theFloor();
      document.querySelector('#totalFloor').value = vm.totalFloor();

    });
  };

  function initialize() {
    var extras = app.util.getExtras();
    type = extras.type||{};
    tableId = extras.tableId||{};
    dataPack = new (new DataPack()[type])();

    detailSearch();
    events();
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _);