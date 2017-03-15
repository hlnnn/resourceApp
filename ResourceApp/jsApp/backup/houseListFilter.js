; (function (app, mui, $, ko, _) {
  var city = app.cache.get('city'), //城市Id
    cityId = city.tableId,
    type = null,
    dataPack,
    all= false;
  var types = 'saleHouse,rentHouse,newHouse,saleShop,rentShop,saleOffice,rentOffice'.split(',');

  function DataPack() {
    var self = this;
    this.DataBase = function () {
      this.title = '';
      this.requestUrl = '';
      this.responseData = '';
      this.Price = function () {
      };
      this.setLowerPrice = function (val) {
      };
      this.setUpperPrice = function (val) {
      };
      this.theType = function (val) {
      };
      this.sourceVisible = true;
      this.areaVisible = false;
      this.areaCss = 'mui-col-sm-5 mui-col-xs-5';
      this.timeVisible = true;  //开盘时间
      this.sortVisible = true;  //来源
      this.roomVisible = true;  //户型
      this.managementVisible = false;
      this.gradeVisible = false;
    };

    this.SaleHouseData = function () {
      self.DataBase.call(this);

      this.title = '二手房';
      this.timeVisible = false;
      this.Price = function () {
        return new Price('%s万以下', '%s万以上', '%s-%s万');
      };
      this.setLowerPrice = function (val) {
        app.module.houseList.filter.lowerPrice = val;
      };
      this.setUpperPrice = function (val) {
        app.module.houseList.filter.upperPrice = val;
      };
      
      if(plus.webview.getWebviewById('houseMapContent.htm')){
      	this.areaVisible = false;
      	this.areaCss = 'mui-col-sm-8 mui-col-xs-8';
      	this.requestUrl = 'SaleHouseListForCommunity';
      }else{
      	this.areaVisible = true;
      	this.requestUrl = 'saleHouseList';
      	this.responseData = 'saleHouseList';
      }
    };

    this.RentHouseData = function () {
      self.SaleHouseData.call(this);

      this.title = '租房';
      this.Price = function () {
        return new Price('%s元以下', '%s元以上', '%s-%s元');
      };
      this.setLowerPrice = function (val) {
        app.module.houseList.filter.lowerRent = val;
      };
      this.setUpperPrice = function (val) {
        app.module.houseList.filter.upperRent = val;
      };
      this.theType = function (val) {
        app.module.houseList.filter.theType = val;
      };
      
      if(plus.webview.getWebviewById('houseMapContent.htm')){
      	this.requestUrl = 'RentHouseListForCommunity';
      }else{
      	this.requestUrl = 'rentHouseList';
      	this.responseData = 'rentHouseList';
      }
    };

    this.NewHouseData = function () {
      self.SaleHouseData.call(this);

      this.title = '新房';
      this.timeVisible = true;
      this.sourceVisible = false;
      this.Price = function () {
        return new Price('%s元/m²以下', '%s元/m²以上', '%s-%s元/m²');
      };
      this.sortVisible = false;
      this.areaVisible = false;
      if(plus.webview.getWebviewById('houseMapContent.htm')){
      	this.requestUrl = 'NewHouseListForMap';
      }else{
      	this.requestUrl = 'newHouseList';
      	this.responseData = 'theNewHouseList';
      }
    };

    this.SaleShopData = function () {
      self.SaleHouseData.call(this);

      this.title = '商铺出售';
      this.requestUrl = 'saleShopList';
      this.responseData = 'saleShopList';
      this.theType = function (val) {
        app.module.houseList.filter.shopType = val;
      };
      this.managementVisible = true;
      this.roomVisible = false;  //户型
      this.areaVisible = false;
    };

    this.RentShopData = function () {
      self.RentHouseData.call(this);

      this.title = '商铺出租';
      this.requestUrl = 'rentShopList';
      this.responseData = 'rentShopList';
      this.theType = function (val) {
        app.module.houseList.filter.shopType = val;
      };
      this.areaVisible = false;
      this.managementVisible = true;
    };

    this.SaleOfficeData = function () {
      self.SaleHouseData.call(this);

      this.title = '写字楼出售';
      this.requestUrl = 'saleOfficeList';
      this.responseData = 'saleOfficeList';
      this.areaVisible = false;
      this.roomVisible = false;
      this.gradeVisible = true;
    };

    this.RentOfficeData = function () {
      self.RentHouseData.call(this);

      this.title = '写字楼出租';
      this.requestUrl = 'rentOfficeList';
      this.responseData = 'rentOfficeList';
      this.areaVisible = false;
      this.roomVisible = false;
      this.gradeVisible = true;
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

  //创建houseList模型
  var defined, module = {};
  var houseList = (function () {
    function HouseList() {
    }

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
    Defined.prototype.Area = function (title, id, tap) {
      this.title = title;
      this.id = id;
      this.tap = tap || mui.noop;
    };

    // 总价
    Defined.prototype.Price = function (lowerPrice, upperPrice, title) {
      this.lowerPrice = lowerPrice;
      this.upperPrice = upperPrice;
      if (title) {
        this.title = title;
      } else {
        var printf = dataPack.Price();
        if (!lowerPrice) {
          this.title = _.sprintf(printf.unitUpper, upperPrice);
        } else if (!upperPrice) {
          this.title = _.sprintf(printf.unitLower, lowerPrice);
        } else {
          this.title = _.sprintf(printf.unitBetween, lowerPrice, upperPrice);
        }
      }
    };

    // 面积
    Defined.prototype.Square = function (lowerSquare, upperSquare, title) {
      this.lowerSquare = lowerSquare;
      this.upperSquare = upperSquare;
      if (title) {
        this.title = title;
      } else {
        if (!lowerSquare) {
          this.title = _.sprintf('%s㎡以下', upperSquare);
        } else if (!upperSquare) {
          this.title = _.sprintf('%s㎡以上', lowerSquare);
        } else {
          this.title = _.sprintf('%s-%s㎡', lowerSquare, upperSquare);
        }
      }
    };

    defined = new Defined();
  })();

  // Source
  (function () {
    function Source() {
      areaData(this);
      sourceData(this);
      priceData(this);
      moreData(this);
      timeData(this);
      modelVisible(this);
    }

    //筛选选择关闭
    function domTap(dom) {
    	$(dom).addClass('mui-hidden');
      if (window.plus) {
      	var parent = plus.webview.currentWebview().parent();
   		if (!parent){
				parent = plus.webview.getWebviewById('houseList.htm');
      }
      	app.util.fire(parent, 'hide-dropdown');
      }
    }

    //模块显示、隐藏
    function modelVisible(self) {
      self.sourceVisible = dataPack.sourceVisible;
      self.timeVisible = dataPack.timeVisible;
      self.roomVisible = dataPack.roomVisible;
      self.sortVisible = dataPack.sortVisible;
      self.gradeVisible = dataPack.gradeVisible;
      self.managementVisible = dataPack.managementVisible;
    }

    //区域
    function areaData(self) {
      var isMetro = false;
      self.area = new defined.Filter('区域', [{ title: '区域' }]);
      self.area.first = new defined.Area('不限', 0);
      self.area.firsts = ko.observableArray([self.area.first]);
      self.area.second = new defined.Area('全部', 0);
      self.area.seconds = ko.observableArray([self.area.second]);

      self.area.areaVisible = dataPack.areaVisible;
      self.area.areaCss = dataPack.areaCss;

      app.request.postAction('tdwr', 'AreaList', { cityId: cityId }, function (response) {
        bindArea(response.resultList);
      });

      function bindArea(data) {
        self.area.data = data;
        self.area.list(_.map(self.area.data, function (el, index) {
          return new defined.Area(el.type, index);
        }));
        $('#dropdown-area').find('li').eq(0).addClass('mui-selected');
        bindAreaFirst(self.area.data[0]);
      }

      function bindAreaFirst(first) {
        self.area.firsts.splice(1);
        var len = first.areaList.length;
        for (var i = 1; i < len; i++) {
          var item = first.areaList[i];
          var area = new defined.Area(item.theName, item.tableId);
          area.itemList = item.itemList;
          self.area.firsts.push(area);
        }
      }

      self.area.selectVal = ko.observable('区域');
      self.recordFirst = ko.observable('区域');
      self.recordSecond = ko.observable();

      self.area.tap = function (record) {
        var first = self.area.data[record.id];
        bindAreaFirst(first);
        self.recordFirst(record.title);
        self.area.seconds.splice(1);
      }
      self.area.firstTap = function (record) {
      	houseList.filter.metroId = '';
        houseList.filter.cityPartitionId = '';
        houseList.filter.stationId = '';
        houseList.filter.businessAreaId = '';
        self.recordSecond(record.title);
        	
        if (record.title === '不限') {
        	all = false;
        	domTap('#dropdown-area');
          self.area.selectVal(self.recordFirst());
          self.area.seconds.splice(1);
          app.module.houseList.result.research();
          return;
        }
        if (isMetro) {
          houseList.filter.metroId = record.id;
        } else {
          houseList.filter.cityPartitionId = record.id;
        }
        self.area.seconds.splice(1);
        if (record.itemList) {
        	all = true;
          for (var j = 1; j < record.itemList.length; j++) {
            var secondItem = record.itemList[j];
            self.area.seconds.push(new defined.Area(secondItem.theName, secondItem.tableId));
          }
        }
      }
      self.area.secondTap = function (record) {
        houseList.filter.stationId = '';
        houseList.filter.businessAreaId = '';
        domTap('#dropdown-area');
        if (record.id === 0) {
          if (self.recordSecond() === '不限') {
          	self.area.selectVal(self.recordFirst());
          } else {
            self.area.selectVal(self.recordSecond());
          }
          app.module.houseList.result.research();
          return;
        }
        self.area.selectVal(record.title);
        if (isMetro) {
          houseList.filter.stationId = record.id;
        } else {
          houseList.filter.businessAreaId = record.id;
        }
        app.module.houseList.result.research();
        all = true;
      }
    }

    //来源
    function sourceData(self) {
      self.source = new defined.Filter('来源', ['个人发布', '智屋发布', '经纪人发布']);

      self.source.sourceSelecteds = ko.observableArray();
      self.source.all = ko.pureComputed({
        read: function () {
          return self.source.sourceSelecteds().length === self.source.list().length;
        },
        write: function (value) {
          self.source.sourceSelecteds(value ? self.source.list.slice(0) : []);
        }
      });
      self.source.all(true);

      // 处理来源数据
      function handleSource() {
        var sources = self.source.sourceSelecteds();
        var data = {
          isHaveSourcePersonal: _.any(sources, function (el) { return el === '个人发布' }),
          isHaveSourceBroker: _.any(sources, function (el) { return el === '经纪人发布' }),
          isHaveSourceZhiwu: _.any(sources, function (el) { return el === '智屋发布' })
        };
        data.isUnlimited = data.isHaveSourcePersonal && data.isHaveSourceBroker && data.isHaveSourceZhiwu;
        if(data.isUnlimited){
        	all = false;
        }else{
        	all = true;
        }
        return data;
      }

      self.source.tap = function () {
        var filter = app.module.houseList.filter;
        var source = handleSource();
        domTap('#dropdown-source');
        $.extend(filter, source);
        app.module.houseList.result.research();
        
      };
    }

    //开盘时间
    function timeData(self) {
      self.time = new defined.Filter('开盘时间', ['不限', '本月开盘', '下月开盘', '三个月内开盘', '六个月内开盘', '前三个月开盘', '前六个月开盘']);
      var checkedVal = ko.observable(0);
      self.time.checkedVal = ko.pureComputed({
        read: function () {
          return checkedVal();
        },
        write: function (val) {
        	if(!val){
          	all = false;
          }else{
          	all = true;
          }
          checkedVal(val);
          domTap('#dropdown-time');
          app.module.houseList.filter.openTimeRange = val;
          app.module.houseList.result.research();
        }
      });
      
    }

    var typeMap = {
      saleHouse: {
        price: function () {
          return new defined.Filter('总价', [
            new defined.Price(0, 0, '不限'),
            new defined.Price(0, 50),
            new defined.Price(50, 100),
            new defined.Price(100, 150),
            new defined.Price(150, 200),
            new defined.Price(200, 250),
            new defined.Price(250, 0)
          ]);
        },
        square: function () {
          return new defined.Filter('面积', [
            new defined.Square(0, 0, '全部'),
            new defined.Square(0, 50),
            new defined.Square(50, 100),
            new defined.Square(100, 150),
            new defined.Square(150, 200),
            new defined.Square(200, 250),
            new defined.Square(250, 0)
          ]);
        },
        feature: function () {
          return new defined.Filter('特色', [
            '精装修', '南北通透', '家电齐全', '领包入住', '随时看房', '产权满两年', '产权满五年', '唯一房产', '电梯房', '学区房', '高端住宅'
          ]);
        },
        rentType: function () { }
      },
      rentHouse: {
        price: function () {
          return new defined.Filter('租金', [
            new defined.Price(0, 0, '不限'),
            new defined.Price(0, 500),
            new defined.Price(500, 1000),
            new defined.Price(1000, 1500),
            new defined.Price(1500, 2000),
            new defined.Price(2000, 2500),
            new defined.Price(2500, 0)
          ]);
        },
        square: function () { },
        feature: function () {
          return new defined.Filter('特色', [
            '精装修', '含水电', '含物业费', '家电齐全', '领包入住', '地铁沿线', '干净整洁', '多路公交', '独立车库', '送宽带', '学区房', '单身公寓', '其他'
          ]);
        },
        rentType: function () {
          return new defined.Filter('类型', ['全部', '整租', '合租']);
        }
      },
      newHouse: {
        price: function () {
          return new defined.Filter('价格', [
            new defined.Price(0, 0, '不限'),
            new defined.Price(0, 8000),
            new defined.Price(8000, 12000),
            new defined.Price(12000, 15000),
            new defined.Price(15000, 20000),
            new defined.Price(20000, 0)
          ]);
        },
        square: function () {
          return new defined.Filter('面积', [
            new defined.Square(0, 0, '不限'),
            new defined.Square(0, 50),
            new defined.Square(50, 70),
            new defined.Square(70, 90),
            new defined.Square(90, 120),
            new defined.Square(120, 144),
            new defined.Square(144, 200),
            new defined.Square(200, 0)
          ]);
        },
        feature: function () {
          return new defined.Filter('特色', ['小户型', '精装修', '总价低', '地铁盘', '南北通透', '低密度', '学区房']);
        },
        rentType: function () { }
      },
      saleShop: {
        price: function () {
          return new defined.Filter('价格', [
            new defined.Price(0, 0, '不限'),
            new defined.Price(0, 50),
            new defined.Price(50, 100),
            new defined.Price(100, 150),
            new defined.Price(150, 200),
            new defined.Price(250, 0)
          ]);
        },
        square: function () {
          return new defined.Filter('面积', [
            new defined.Square(0, 0, '不限'),
            new defined.Square(0, 50),
            new defined.Square(50, 100),
            new defined.Square(100, 150),
            new defined.Square(150, 200),
            new defined.Square(200, 250),
            new defined.Square(250, 0)
          ]);
        },
        feature: function () {
          return new defined.Filter('特色', ['沿街旺铺', '商铺中心', '纯底铺', '地铁铺', '市场人流繁多', '停车便利', '带租约', '其他']);
        },
        rentType: function () {
          return new defined.Filter('类型', ['全部', '住宅底商', '商业街商铺', '临街门面', '写字楼配套底商', '购物中心/百货', '其他']);
        }
      },
      rentShop: {
        price: function () {
          return new defined.Filter('租金', [
            new defined.Price(0, 0, '不限'),
            new defined.Price(0, 5000),
            new defined.Price(5000, 10000),
            new defined.Price(10000, 15000),
            new defined.Price(15000, 20000),
            new defined.Price(20000, 25000),
            new defined.Price(25000, 30000),
            new defined.Price(30000, 0)
          ]);
        },
        square: function () {
          return new defined.Filter('面积', [
            new defined.Square(0, 0, '不限'),
            new defined.Square(0, 50),
            new defined.Square(50, 100),
            new defined.Square(100, 150),
            new defined.Square(150, 200),
            new defined.Square(200, 250),
            new defined.Square(250, 0)
          ]);
        },
        feature: function () {
          return new defined.Filter('特色', ['沿街旺铺', '商铺中心', '纯底铺', '地铁铺', '市场人流繁多', '停车便利', '其他']);
        },
        rentType: function () {
          return new defined.Filter('类型', ['全部', '住宅底商', '商业街商铺', '临街门面', '写字楼配套底商', '购物中心/百货', '其他']);
        }
      },
      saleOffice: {
        price: function () {
          return new defined.Filter('租金', [
            new defined.Price(0, 0, '不限'),
            new defined.Price(0, 5000),
            new defined.Price(5000, 10000),
            new defined.Price(10000, 15000),
            new defined.Price(15000, 20000),
            new defined.Price(20000, 25000),
            new defined.Price(25000, 30000),
            new defined.Price(30000, 0)
          ]);
        },
        square: function () {
          return new defined.Filter('面积', [
            new defined.Square(0, 0, '不限'),
            new defined.Square(0, 50),
            new defined.Square(50, 100),
            new defined.Square(100, 150),
            new defined.Square(150, 200),
            new defined.Square(200, 250),
            new defined.Square(250, 0)
          ]);
        },
        feature: function () {
          return new defined.Filter('特色', ['沿街旺铺', '商铺中心', '纯底铺', '地铁铺', '市场人流繁多', '停车便利', '其他']);
        },
        rentType: function () { }
      },
      rentOffice: {
        price: function () {
          return new defined.Filter('租金', [
            new defined.Price(0, 0, '不限'),
            new defined.Price(0, 5000),
            new defined.Price(5000, 10000),
            new defined.Price(10000, 15000),
            new defined.Price(15000, 20000),
            new defined.Price(20000, 25000),
            new defined.Price(25000, 30000),
            new defined.Price(30000, 0)
          ]);
        },
        square: function () {
          return new defined.Filter('面积', [
            new defined.Square(0, 0, '不限'),
            new defined.Square(0, 50),
            new defined.Square(50, 100),
            new defined.Square(100, 150),
            new defined.Square(150, 200),
            new defined.Square(200, 250),
            new defined.Square(250, 0)
          ]);
        },
        feature: function () {
          return new defined.Filter('特色', ['沿街旺铺', '商铺中心', '纯底铺', '地铁铺', '市场人流繁多', '停车便利', '其他']);
        },
        rentType: function () { }
      }
    };

    //总价
    function priceData(self) {
      var price = self.price = typeMap[type].price();

      var totalPrice = ko.observable(price.list()[0]),
        lowerPrice = ko.observable(),
        upperPrice = ko.observable();

      price.totalPrice = ko.pureComputed({
        read: function () {
          return totalPrice();
        },
        write: function (value) {
        	if(value.title =='不限'){
        		all = false;
        	}else{
        		all = true;
        	}
          totalPrice(value);
          lowerPrice(null);
          upperPrice(null);
          domTap('#dropdown-price');
          dataPack.setLowerPrice(value.lowerPrice);
          dataPack.setUpperPrice(value.upperPrice);
          app.module.houseList.result.research();
        }
      });
      price.lowerPrice = ko.pureComputed({
        read: function () {
          return lowerPrice();
        },
        write: function (value) {
          if (value) {
            totalPrice(null);
            lowerPrice(value);
            dataPack.setLowerPrice(value);
          }
        }
      });
      price.upperPrice = ko.pureComputed({
        read: function () {
          return upperPrice();
        },
        write: function (value) {
          if (value) {
            totalPrice(null);
            upperPrice(value);
            dataPack.setUpperPrice(value);
          }
        }
      });
      price.tap = function () {
      	all = true;
        domTap('#dropdown-price');
        app.module.houseList.result.research();
      }
    }

    //更多
    function moreData(self) {
      var more = new defined.Filter('更多', []);
      var roomSelected = ko.observable(0),
        room = ko.observable(),
        hall = ko.observable();
      more.room = new defined.Filter('户型', [
        '全部', '一室', '二室', '三室', '四室', '五室', '五室以上'
      ]);
      more.room.roomSelected = ko.pureComputed({
        read: function () {
          return roomSelected();
        },
        write: function (value) {
        	roomSelected(value);
          room(null);
          hall(null);
          var filter = app.module.houseList.filter;
          if (value === 0) {
            filter.room = '';
          } else {
            filter.room = value;
          }
        }
      });
      more.room.room = ko.pureComputed({
        read: function () {
          return room();
        },
        write: function (value) {
          if (value) {
            roomSelected(null);
            room(value);
            var filter = app.module.houseList.filter;
            filter.room = value;
          }
        }
      });
      more.room.hall = ko.pureComputed({
        read: function () {
          return hall();
        },
        write: function (value) {
          if (value) {
            roomSelected(null);
            hall(value);
            var filter = app.module.houseList.filter;
            filter.hall = value;
          }
        }
      });

      more.feature = typeMap[type].feature();
      more.feature.featureSelecteds = ko.observableArray();
      more.feature.all = ko.pureComputed({
        read: function () {
          return more.feature.featureSelecteds().length === more.feature.list().length;
        },
        write: function (value) {
          more.feature.featureSelecteds(value ? more.feature.list.slice(0) : []);
        }
      });
      more.feature.all(true);

      var square = more.square = typeMap[type].square();

      if (more.square) {
        var totalSquare = ko.observable(square.list()[0]),
          lowerSquare = ko.observable(),
          upperSquare = ko.observable();
        more.square.totalSquare = ko.pureComputed({
          read: function () {
            return totalSquare();
          },
          write: function (value) {
          	if(value == '全部'){
          		all = false;
          	}
          	totalSquare(value);
            lowerSquare(null);
            upperSquare(null);
            var filter = app.module.houseList.filter;
            filter.lowerSquare = value.lowerSquare;
            filter.upperSquare = value.upperSquare;
          }
        });
        more.square.lowerSquare = ko.pureComputed({
          read: function () {
            return lowerSquare();
          },
          write: function (value) {
            totalSquare(null);
            lowerSquare(value);
            var filter = app.module.houseList.filter;
            filter.lowerSquare = lowerSquare();
          }
        });
        more.square.upperSquare = ko.pureComputed({
          read: function () {
            return upperSquare();
          },
          write: function (value) {
            totalSquare(null);
            upperSquare(value);
            var filter = app.module.houseList.filter;
            filter.upperSquare = upperSquare();
          }
        });
      }
			      
      more.grade = new defined.Filter('等级', [
        '全部', '甲级', '乙级', '丙级'
      ]);
      var gradeSelected = ko.observable(more.grade.list()[0]);
      more.grade.gradeSelected = ko.pureComputed({
        read: function () {
          return gradeSelected();
        },
        write: function (value) {
          gradeSelected(value);
          var filter = app.module.houseList.filter;
          if (value === '全部') {
            filter.grade = '';
          } else {
            filter.grade = value;
          }
        }
      });

      more.rentType = typeMap[type].rentType();
      var rentWay = ko.observable();
      if (more.rentType) {
        rentWay(more.rentType.list()[0]);
        more.rentType.rentWay = ko.pureComputed({
          read: function () {
            return rentWay();
          },
          write: function (value) {
          	if(value === '全部'){
          		all = false;
          	}
            rentWay(value);
            dataPack.theType(value);
          }
        });
      }

      more.sort = new defined.Filter('排序', [
        '默认排序', '发布时间较早', '发布时间较晚', '价格较低', '价格较高', '面积较小', '面积较大'
      ]);
      var sortSelected = ko.observable(more.sort.list()[0]);
      more.sort.sortSelected = ko.pureComputed({
        read: function () {
          return sortSelected();
        },
        write: function (value) {
          sortSelected(value);
          order(value);
         }
      });
      function order(value) {
        var filter = app.module.houseList.filter;
        filter.dateOrder = '';
        filter.priceOrder = '';
        filter.squareOrder = '';
        switch (value) {
          case '发布时间较早':
            filter.dateOrder = 'down';
            break;
          case '发布时间较晚':
            filter.dateOrder = 'up';
            break;
          case '价格较低':
            filter.priceOrder = 'up';
            break;
          case '价格较高':
            filter.priceOrder = 'down';
            break;
          case '面积较小':
            filter.squareOrder = 'up';
            break;
          case '面积较大':
            filter.squareOrder = 'down';
            break;
        }
      }

      more.management = new defined.Filter('适合经营', [
        '全部', '餐饮美食', '服饰鞋包', '医疗美容', '百货超市', '酒店宾馆', '家居建材', '酒吧KTV', '洗浴健身', '干洗店', '汽车美容'
      ]);
      var managementSelected = ko.observable(more.management.list()[0]);
      more.management.managementSelected = ko.pureComputed({
        read: function () {
          return managementSelected();
        },
        write: function (value) {
          managementSelected(value);
          var filter = app.module.houseList.filter;
          if (value === '全部') {
            filter.fitManage = '';
          } else {
            filter.fitManage = value;
          }
        }
      });

      more.search = function () {
        domTap('#dropdown-more');
        var filter = app.module.houseList.filter;
        if (more.feature.featureSelecteds().length === app.module.houseList.source.more.feature.list().length) {
          filter.feature = '';
        } else {
          console.log(more.feature.featureSelecteds())
          filter.feature = more.feature.featureSelecteds().join(',');
        }
        if(roomSelected()=== 0 ||room()!==''||hall()!==''||more.feature.all()||sortSelected() == '默认排序'|| rentWay() === '全部' ){
        	all = false;
        }else{
        	all = true;
        }
        
        
        app.module.houseList.result.research();
      };

      more.reset = function () {
        more.room.roomSelected(0);
        more.feature.all(true);
        if (more.square) {
          more.square.totalSquare(square.list()[0]);
        }
        if (more.rentType) {
          more.rentType.rentWay(more.rentType.list()[0]);
        }
        more.grade.gradeSelected(more.grade.list()[0]);
        more.sort.sortSelected(more.sort.list()[0]);
        more.management.managementSelected(more.management.list()[0]);
      };

      self.more = more;
    }

    module.Source = Source;
  })();

  // Filter
  (function () {
    function Filter() {
      this.cityId = cityId;;
      this.cityPartitionId = '';
      this.metroId = '';
      this.stationId = '';
      this.keyWord = '';
      this.businessAreaId = '';
      this.lowerRent = ''; //最低租金
      this.upperRent = ''; //最高租金
      this.lowerPrice = '';
      this.upperPrice = '';
      this.buildingPrice = '';//新房价格
      this.theType = ''; //租房类型
      this.openTimeRange = '';//开盘时间
      this.room = '';
      this.lowerSquare = '';
      this.upperSquare = '';
      this.feature = '';
      this.dateOrder = '';
      this.priceOrder = '';
      this.squareOrder = '';
      this.isUnlimited = true; //来源不限
      this.isHaveSourcePersonal = true;
      this.isHaveSourceBroker = true;
      this.isHaveSourceZhiwu = true;
      this.isHotOrder = false;
      this.isRecommend = false;
      this.isLandlordCer = false;
      this.isSiteProspect = false;
      this.pageNumber = 1;
      this.countPerPage = 10;
      this.totalPage = 0;
      this.hall = '';
      this.fitManage = ''; //适合经营
      this.grade = '';
      this.shopType = ''; //商铺类型
      this.totalCount = ko.observable(0);
    }

    //筛选字段处理方法
    Filter.prototype.initialize = function () {
    }

    module.Filter = Filter;
  })();

  app.module.houseList = houseList;

  // 查询结果
  (function () {
    function Result() {
    }

    Result.prototype.research = function () {
      research();
    };

    houseList.result = new Result();
  })();

  function initialize() {
    type = app.util.getExtrasValue('type');
    dataPack = new (new DataPack()[type])();
    houseList.initialize(document.getElementById('filter-section'));

    events();
    //houseList.result.research();
  }

  // 初始化环境
  mui.init();

  app.plusReady(initialize);

  function research() {
    if (window.plus) {
    	var list;
    	if(plus.webview.getWebviewById('houseMapContent.htm')){
    		list = plus.webview.getWebviewById('houseMapContent.htm');
      }else{
    		list = plus.webview.getWebviewById('houseListContent.htm'); 
    	}
      app.util.fire(list, 'list-research', {
        filter: ko.toJS(app.module.houseList.filter),
        dataPack: dataPack,
        type: type,
        all: all
      });
    }
  }

  function events() {
    window.addEventListener('change-filter', function (event) {
      var detail = event.detail;
      app.module.houseList.filter.keyWord = detail.keyWord;
      app.module.houseList.filter.isLandlordCer = detail.isLandlordCer;
      app.module.houseList.filter.isSiteProspect = detail.isSiteProspect;
      research();
    });
    
    window.addEventListener('show-dropdown', function (event) {
    	$(event.detail.toggle).removeClass('mui-hidden').siblings().addClass('mui-hidden');
      var height = $(event.detail.toggle).height() + 30;
			var parent = plus.webview.currentWebview().parent();
			if (window.plus) {
        if (height < 765) {
        	plus.webview.currentWebview().setStyle({ height: height + 'px' });
        } else {
          plus.webview.currentWebview().setStyle({ height: 'auto', bottom: app.config.bottom });
        }
      }
    });
  }

})(app, mui, jQuery, ko, _);