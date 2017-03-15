// FilterDataPack
(function (app) {
    var filterDataPacks = new (function () {
        var self = this;
        this.DataBase = function () {
            this.title = '';
            this.requestUrl = '';
            this.responseData = '';
            this.Price = function () {
            };
            this.priceUnit = '元';
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
            this.countVisible = true;//房源数量
            this.realSupply = false;//真实房源
            this.prospecting = false;//上门实勘
        };

        this.SaleHouse = function () {
            self.DataBase.call(this);

            this.title = '二手房';
            this.timeVisible = false;
            this.Price = function () {
                return new Price('%s万以下', '%s万以上', '%s-%s万');
            };
            this.priceUnit = '万';
            this.setLowerPrice = function (val) {
                app.module.houseList.filter.lowerPrice = val;
            };
            this.setUpperPrice = function (val) {
                app.module.houseList.filter.upperPrice = val;
            };

            //if (plus.webview.getWebviewById('houseMapContent.htm')) {
            if (false) {
                this.areaVisible = false;
                this.areaCss = 'mui-col-sm-8 mui-col-xs-8';
                this.requestUrl = 'SaleHouseListForCommunity';
            } else {
                this.areaVisible = true;
                this.requestUrl = 'saleHouseList';
                this.responseData = 'saleHouseList';
            }
            this.realSupply = true;
            this.prospecting = true;
        };

        this.RentHouse = function () {
            self.DataBase.call(this);

            this.title = '租房';
            this.timeVisible = false;
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

            //if (plus.webview.getWebviewById('houseMapContent.htm')) {
            if (false) {
                this.requestUrl = 'RentHouseListForCommunity';
            } else {
                this.requestUrl = 'rentHouseList';
                this.responseData = 'rentHouseList';
            }
            this.realSupply = true;
            this.prospecting = true;
        };

        this.NewHouse = function () {
            self.DataBase.call(this);

            this.title = '新房';
            this.timeVisible = true;
            this.sourceVisible = false;
            this.Price = function () {
                return new Price('%s元/m²以下', '%s元/m²以上', '%s-%s元/m²');
            };
            this.priceUnit = '元/m²';
            this.sortVisible = false;
            this.areaVisible = false;
            //if (plus.webview.getWebviewById('houseMapContent.htm')) {
            if (false) {
                this.requestUrl = 'NewHouseListForMap';
            } else {
                this.requestUrl = 'newHouseList';
                this.responseData = 'theNewHouseList';
            }
            this.countVisible = false;
        };

        this.SaleShop = function () {
            self.SaleHouse.call(this);

            this.title = '商铺出售';
            this.requestUrl = 'saleShopList';
            this.responseData = 'saleShopList';
            this.theType = function (val) {
                app.module.houseList.filter.shopType = val;
            };
            this.managementVisible = true;
            this.roomVisible = false;  //户型
            this.areaVisible = false;
            this.countVisible = true;
            this.realSupply = false;
            this.prospecting = false;
        };

        this.RentShop = function () {
            self.RentHouse.call(this);

            this.title = '商铺出租';
            this.requestUrl = 'rentShopList';
            this.responseData = 'rentShopList';
            this.theType = function (val) {
                app.module.houseList.filter.shopType = val;
            };
            this.areaVisible = false;
            this.managementVisible = true;
            this.countVisible = true;
            this.realSupply = false;
            this.prospecting = false;
        };

        this.SaleOffice = function () {
            self.SaleHouse.call(this);

            this.title = '写字楼出售';
            this.requestUrl = 'saleOfficeList';
            this.responseData = 'saleOfficeList';
            this.areaVisible = false;
            this.roomVisible = false;
            this.gradeVisible = true;
            this.countVisible = true;
            this.realSupply = false;
            this.prospecting = false;
        };

        this.RentOffice = function () {
            self.RentHouse.call(this);

            this.title = '写字楼出租';
            this.requestUrl = 'rentOfficeList';
            this.responseData = 'rentOfficeList';
            this.areaVisible = false;
            this.roomVisible = false;
            this.gradeVisible = true;
            this.countVisible = true;
            this.realSupply = false;
            this.prospecting = false;
        };

        function Price(upper, lower, between) {
            this.unitUpper = upper;
            this.unitLower = lower;
            this.unitBetween = between;
        }

        return {
            saleHouse: this.SaleHouse,
            rentHouse: this.RentHouse,
            newHouse: this.NewHouse,
            saleShop: this.SaleShop,
            rentShop: this.RentShop,
            saleOffice: this.SaleOffice,
            rentOffice: this.RentOffice
        };
    })();

    app.module.filterDataPacks = filterDataPacks;
})(app);

// FilterSource
(function () {
    function FilterSource(type) {
        var filterDataPack = new (app.module.filterDataPacks[type])();
        this.sourceVisible = filterDataPack.sourceVisible;
        this.timeVisible = filterDataPack.timeVisible;
        this.areaSelectVal = ko.observable('区域');
        this.priceTitle = ko.observable('总价');
        switch (type) {
            case 'rentHouse':
            case 'rentOffice':
            case 'rentShop':
                this.priceTitle('租金');
                break;
            case 'newHouse':
                this.priceTitle('价格');
                break;
            default:
                this.priceTitle('总价');
                break;
        }
    }

    app.module.FilterSource = FilterSource;
})();

// Defined
(function (app) {
    var filterDataPack;

    function Defined(dataPack) {
        filterDataPack = dataPack;
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

    // 总价
    Defined.prototype.Price = function (lowerPrice, upperPrice, title) {
        this.lowerPrice = lowerPrice;
        this.upperPrice = upperPrice;
        if (title) {
            this.title = title;
        } else {
            var printf = filterDataPack.Price();
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

    app.module.Defined = Defined;
})(app);

// Source
(function (app) {
    var defined;
    var filterDataPack;
    var _type;
    var city = app.localStorage.getCity();
    var cityId = city.tableId; //城市Id
    function Source(type) {
        filterDataPack = new (app.module.filterDataPacks[type])();
        _type = type;
        defined = new app.module.Defined(filterDataPack);
        areaData(this);
        sourceData(this);
        priceData(this);
        moreData(this);
        timeData(this);
        modelVisible(this);
    }

    //筛选选择关闭
    function domTap(dom) {
        app.module.houseList.closeMask();
        app.module.houseList.mask.close();
    }

    //模块显示、隐藏
    function modelVisible(self) {
        self.sourceVisible = filterDataPack.sourceVisible;
        self.timeVisible = filterDataPack.timeVisible;
        self.roomVisible = filterDataPack.roomVisible;
        self.sortVisible = filterDataPack.sortVisible;
        self.gradeVisible = filterDataPack.gradeVisible;
        self.managementVisible = filterDataPack.managementVisible;
    }

    //区域
    function areaData(self) {

        var isMetro = false;
        self.area = new defined.Filter('区域', [{title: '区域'}]);
        self.area.first = new defined.Area('不限', 0);
        self.area.firsts = ko.observableArray([self.area.first]);
        self.area.second = new defined.Area('全部', 0);
        self.area.seconds = ko.observableArray([self.area.second]);

        self.area.areaVisible = filterDataPack.areaVisible;
        self.area.areaCss = filterDataPack.areaCss;

        /*console.log(app.localStorage.getCity());
         app.request.postAction('tdwr', 'AreaList', { cityId: cityId }, function (response) {
         console.log(response);
         bindArea(response.resultList);
         });*/
        bindArea([city.areas, city.metros]);

        function bindArea(data) {
            self.area.data = data;
            self.area.list(_.map(self.area.data, function (el, index) {
                return new defined.Area(el.type, index);
            }));
            //$('#dropdown-area').find('li').eq(0).addClass('mui-selected');
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
            app.module.houseList.filter.metroId = '';
            app.module.houseList.filter.cityPartitionId = '';
            app.module.houseList.filter.stationId = '';
            app.module.houseList.filter.businessAreaId = '';
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
                app.module.houseList.filter.metroId = record.id;
            } else {
                app.module.houseList.filter.cityPartitionId = record.id;
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
            app.module.houseList.filter.stationId = '';
            app.module.houseList.filter.businessAreaId = '';
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
                app.module.houseList.filter.stationId = record.id;
            } else {
                app.module.houseList.filter.businessAreaId = record.id;
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
                isHaveSourcePersonal: _.any(sources, function (el) {
                    return el === '个人发布'
                }),
                isHaveSourceBroker: _.any(sources, function (el) {
                    return el === '经纪人发布'
                }),
                isHaveSourceZhiwu: _.any(sources, function (el) {
                    return el === '智屋发布'
                })
            };
            data.isUnlimited = data.isHaveSourcePersonal && data.isHaveSourceBroker && data.isHaveSourceZhiwu;
            if (data.isUnlimited) {
                all = false;
            } else {
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
                if (!val) {
                    all = false;
                } else {
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
            rentType: function () {
            }
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
            square: function () {
            },
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
            rentType: function () {
            }
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
            rentType: function () {
            }
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
            rentType: function () {
            }
        }
    };

    //总价
    function priceData(self) {
        var price = self.price = typeMap[_type].price();
        price.priceUnit = filterDataPack.priceUnit;

        var totalPrice = ko.observable(price.list()[0]),
            lowerPrice = ko.observable(),
            upperPrice = ko.observable();

        price.totalPrice = ko.pureComputed({
            read: function () {
                return totalPrice();
            },
            write: function (value) {
                if (value.title == '不限') {
                    all = false;
                } else {
                    all = true;
                }
                totalPrice(value);
                lowerPrice(null);
                upperPrice(null);
                domTap('#dropdown-price');
                filterDataPack.setLowerPrice(value.lowerPrice);
                filterDataPack.setUpperPrice(value.upperPrice);
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
                    filterDataPack.setLowerPrice(value);
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
                    filterDataPack.setUpperPrice(value);
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

        more.feature = typeMap[_type].feature();
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

        var square = more.square = typeMap[_type].square();

        if (more.square) {
            var totalSquare = ko.observable(square.list()[0]),
                lowerSquare = ko.observable(),
                upperSquare = ko.observable();
            more.square.totalSquare = ko.pureComputed({
                read: function () {
                    return totalSquare();
                },
                write: function (value) {
                    if (value == '全部') {
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

        more.rentType = typeMap[_type].rentType();
        var rentWay = ko.observable();
        if (more.rentType) {
            rentWay(more.rentType.list()[0]);
            more.rentType.rentWay = ko.pureComputed({
                read: function () {
                    return rentWay();
                },
                write: function (value) {
                    if (value === '全部') {
                        all = false;
                    }
                    rentWay(value);
                    filterDataPack.theType(value);
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
                filter.feature = more.feature.featureSelecteds().join(',');
            }
            if (roomSelected() === 0 || room() !== '' || hall() !== '' || more.feature.all() || sortSelected() == '默认排序' || rentWay() === '全部') {
                all = false;
            } else {
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

    app.module.Source = Source;
})(app);

// Filter
(function () {
    var dataPack;
    var city = app.localStorage.getCity(),
        cityId = city.tableId; //城市Id

    function Filter(type) {
        dataPack = new (app.module.filterDataPacks[type])();

        this.cityId = cityId;
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
        this.isLandlordCer = ko.observable(false);
        this.isSiteProspect = ko.observable(false);
        this.pageNumber = 1;
        this.countPerPage = 10;
        //this.totalPage = 0;
        this.hall = '';
        this.fitManage = ''; //适合经营
        this.grade = '';
        this.shopType = ''; //商铺类型
        this.totalCount = ko.observable(0);
    }

    //筛选字段处理方法
    Filter.prototype.initialize = function () {
        var isLandlordCer = ko.observable(false);
        var isSiteProspect = ko.observable(false);

        this.isLandlordCer = ko.pureComputed({
            read: function () {
                return isLandlordCer();
            },
            write: function (val) {
                isLandlordCer(val);
                app.module.houseList.result.search();
            }
        });

        this.isSiteProspect = ko.pureComputed({
            read: function () {
                return isSiteProspect();
            },
            write: function (val) {
                isSiteProspect(val);
                app.module.houseList.result.search();
            }
        });
        this.countVisible = dataPack.countVisible;
        this.realSupply = dataPack.realSupply;
        this.prospecting = dataPack.prospecting;
    }

    app.module.Filter = Filter;
})();