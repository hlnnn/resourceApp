(function (app, mui, $, ko, _) {

  // 加载广告
  (function (app, ko, mui) {
    function CityAd(model) {
      this.imagePath = model.imagePath;
      this.introduction = model.introduction;
      this.imgAttr = {
        src: this.imagePath,
        alt: this.introduction
      };
    }

    function CityAds() {
      var self = this;
      this.cityAds = ko.observableArray();
      this.first = ko.observable();
      this.last = ko.observable();
      this.length = ko.pureComputed(function () {
        return self.cityAds().length;
      });
    }

    CityAds.prototype.initialize = function (dom, cityAds) {
      this.slider = mui(dom);
      ko.applyBindings(this, dom);
      if (cityAds)
        this.load(cityAds);
    };
    CityAds.prototype.load = function (datas) {
      if (!datas) return;

      this.cityAds.removeAll();
      for (var i = 0, len = datas.length; i < len; i++) {
        this.cityAds.push(new CityAd(datas[i]));
      }
      this.first(this.cityAds()[0]);
      this.last(this.cityAds()[datas.length - 1]);
      // 循环轮播
      this.slider.slider({
        interval: this.length() ? 3000 : 0
      });
    }

    app.module.cityAds = new CityAds();
  })(app, ko, mui);

  // 加载查询
  (function (app, ko, mui) {
    function SearchPosition() {
      var self = this;
      this.cityName = ko.observable();
      this.visible = ko.observable(false);
      //this.city = ko.observable('城市');
      var city = this.city = app.localStorage.getCity();
      if (city) {
        self.cityName(city.theName);
      } else {
        this.city = app.defaultCity;
        app.cache.set('city', app.defaultCity);
        self.cityName(app.defaultCity.theName);
        if (app.location) {
          var setCity = app.location.setCity;
          app.location.setCity = function (locationCity) {
            setCity(locationCity);
            self.cityName(locationCity.theName);
          }
          app.location.getLocation();
        }
      }
    }

    //跳转城市页面
    SearchPosition.prototype.switchCity = function () {
      app.util.goTo('switchCity.htm');
    };

    //跳转房源搜索页面
    SearchPosition.prototype.goSearch = function () {
      app.util.goTo('houseSearch.htm');
    }

    SearchPosition.prototype.initialize = function (dom, cityDom, scrollDom) {
      ko.applyBindings(this, dom);
      ko.applyBindings(this, cityDom);
      //跳转城市页面
      //cityDom.addEventListener('tap', function () {
      //  app.util.goTo('switchCity.htm');
      //});
      var self = this,
        header = document.body, //getElementById('header');
        domDock = dom.parentElement,
        cityDomDock = cityDom.parentElement;

      //window.addEventListener('scroll', function () {
      //  handlerHeader(0 - window.scrollY);
      //});

      function handlerHeader(y) {
        if (y + 165 > 0) {
          if (self.visible()) {
            domDock.appendChild(dom);
            cityDomDock.appendChild(cityDom);
            self.visible(false);
          }
        } else if (y + 200 > 0) {
          if (!self.visible()) {
            dom.style.opacity = .8;
            header.appendChild(dom);
            dom.appendChild(cityDom);
            self.visible(true);
          }
        } else {
          if (!self.visible()) {
            self.visible(true);
            header.appendChild(dom);
            dom.appendChild(cityDom);
          }
          if (dom.style.opacity !== 1) {
            dom.style.opacity = 1;
          }
        }
      }

      //if (mui.os.ios) {
      //  var deceleration = mui.os.ios ? 0.003 : 0.0006;
      //  var scroll = mui(scrollDom).scroll({
      //    bounce: false,
      //    indicators: false, //是否显示滚动条
      //    deceleration: deceleration
      //  });
      //  scrollDom.addEventListener('scroll', function (e) {
      //    handlerHeader(scroll.y);
      //  });
      //}

      //cityDom.addEventListener('tap', function () {
      //  app.request.post({
      //    trigger: this,
      //    mask: true,
      //    url: '/tIndexList.thtml',
      //    data: { p1: app.defaultCityId, p2: 'recommend' },
      //    onSuccessEvent: function (response) {
      //      //console.log(response);
      //      throw { message: 'error test.' };
      //    }
      //  });
      //});
    };

    SearchPosition.prototype.load = function () {
      this.city = app.cache.get('city');
      this.cityName(this.city.theName);
    }

    app.module.searchPosition = new SearchPosition();
  })(app, ko, mui);

  // 加载模块
  (function (app, ko) {
    function Modules() {
      function Module(title, css, fontColor, href, extras, auth) {
        this.title = title;
        this.css = css;
        this.fontColor = fontColor;
        this.href = href;
        this.extras = extras;
        this.auth = auth;

        this.moduleCss = {};
        this.moduleCss[this.css] = true;
      }

      this.modules = [
        new Module('新房', 'icon-new-house', '#f68bf5', 'houseList.htm', {
          type: 'newHouse'
        }),
        new Module('租房', 'icon-rent-house', '#4baae7', 'houseList.htm', {
          type: 'rentHouse'
        }),
        new Module('二手房', 'icon-sale-house', '#ffcb63', 'houseList.htm', {
          type: 'saleHouse'
        }),
        new Module('发布房源', 'icon-publish-house', '#fc7375', '', {
          type: 'saleHouse'
        }, true),
        new Module('商铺出售', 'icon-sale-shop', '#f0cdac', 'houseList.htm', {
          type: 'saleShop'
        }),
        new Module('商铺出租', 'icon-rent-shop', '#abf1ae', 'houseList.htm', {
          type: 'rentShop'
        }),
        new Module('写字楼出售', 'icon-sale-office', '#bcbcbc', 'houseList.htm', {
          type: 'saleOffice'
        }),
        new Module('写字楼出租', 'icon-rent-office', '#b9adf7', 'houseList.htm', {
          type: 'rentOffice'
        })
      ];
      this.goTo = function (record) {
        if (record.auth) {
          app.module.publish.publish();
          //app.util.goToAuth(record.href, record.extras);
        } else {
          app.util.goTo(record.href, record.extras, false);
        }
      }
    }

    Modules.prototype.initialize = function (dom) {
      ko.applyBindings(this, dom);
    };

    app.module.resources = new Modules();
  })(app, ko);
  //发布房源
  (function (app, mui, $) {

    var publishPopoverMask = mui.createMask(function () {
      $('#topPopover').addClass('mui-hidden');
    });

    function publishClose() {
      publishPopoverMask.close();
      $('#topPopover').addClass('mui-hidden');
    };

    function Publish() {  }

    Publish.prototype.publish = function () {
      publishPopoverMask.show();
      $('#topPopover').removeClass('mui-hidden');
    }
    Publish.prototype.saleHouse = function () {
      publishClose();
      app.util.goToAuth('publishHouseFirst.htm', {
        type: 'saleHouse'
      });
    }
    Publish.prototype.rentHouse = function () {
      publishClose();
      app.util.goToAuth('publishHouseFirst.htm', {
        type: 'rentHouse'
      });
    }
    Publish.prototype.wantedBuyHouse = function () {
      publishClose();
      app.util.goToAuth('publishHouseFirst.htm', {
        type: 'wantedBuyHouse'
      });
    }
    Publish.prototype.wantedRentHouse = function () {
      publishClose();
      app.util.goToAuth('publishHouseFirst.htm', {
        type: 'wantedRentHouse'
      });
    }

    Publish.prototype.initialize = function (dom) {
      ko.applyBindings(this, dom);
    }

    app.module.publish = new Publish();
  })(app, mui, jQuery);

  // 加载服务
  (function (app, ko, mui, $) {
    function Services() {
      function Service(title, subTitle, css, toService) {
        this.title = title;
        this.subTitle = subTitle;
        this.css = css;
        this.toService = toService;

        this.serviceCss = {};
        this.serviceCss[this.css] = true;
        this.svgCss = '#' + this.css;
      }

      this.services = [
        new Service('代办过户', '代办过户', 'icon-transfer-agent', function () {
          app.util.goToAuth('transferAgent.htm');
        }),
        new Service('委托评估', '委托评估', 'icon-commissioned-estimate', function () {
          app.util.goToAuth('commissionedEstimate.htm');
        }),
        new Service('专业人士', '专业人士', 'icon-professional', function () {
          $('#professional').toggle();
        }),
        new Service('贷款申请', '贷款申请', 'icon-loan-application', function () {
          app.util.goTo('bankingFinance.htm');
        })
      ];
      this.personalList = [
        new Service('设计师', '设计师', 'icon-designer', function () {
          app.util.goTo('personalList.htm', {
            type: 'designer'
          });
        }),
        new Service('验房师', '验房师', 'icon-house-inspection', function () {
          app.util.goTo('personalList.htm', {
            type: 'inspector'
          });
        }),
        new Service('律师', '律师', 'icon-lawyer', function () {
          app.util.goTo('personalList.htm', {
            type: 'lawyer'
          });
        }),
        new Service('经纪人', '经纪人', 'icon-surveyor', function () {
          app.util.goTo('personalList.htm', {
            type: 'agent'
          });
        })
      ];
    }

    Services.prototype.initialize = function (dom) {
      ko.applyBindings(this, dom);
    };

    app.module.services = new Services();
  })(app, ko, mui, jQuery);

  // 加载资讯
  (function (app, ko) {
    function News(model) {
      this.tableId = model.tableId;
      this.coverImagePath = model.coverImagePath;
      this.theName = model.theName;
      this.dateTime = model.dateTime;

      this.orginSrc = this.coverImagePath;
      this.imagePath = app.image.get(this.coverImagePath, app.config.noImage);
      this.title = this.theName;
      this.date = app.util.dateString(this.dateTime);

      //模块未开放
      this.unopened = app.messager.unopened;
    }

    function NewsInfoes() {
      this.news = ko.observableArray();
      this.first = ko.observable();

      //咨询列表
      this.goInfoList = function () {
        app.util.goTo('informationList.htm');
      }

      //跳转详情
      this.goDetail = function (record) {
        app.util.goTo('informationDetail.htm', {
          tableId: record.tableId
        });
      }
    }

    NewsInfoes.prototype.initialize = function (dom, infos) {
      ko.applyBindings(this, dom);
      if (infos)
        this.load(infos);
    };
    NewsInfoes.prototype.load = function (datas) {
      this.news.removeAll();
      for (var i = 0, len = datas.length; i < len; i++) {
        this.news.push(new News(datas[i]));
      }
      this.first(this.news()[0]);
    };

    app.module.news = new NewsInfoes();
  })(app, ko);

  // 加载推荐房源
  (function (app, ko, _) {
    function House(model) {
      this.tableId = model.tableId;
      this.areaName = model.areaName;
      this.communityName = model.communityName;
      this.feature = model.feature;
      this.square = model.square;
      this.room = model.room;
      this.hall = model.hall;
      this.theFloor = model.theFloor;
      this.totalFloor = model.totalFloor;
      this.unitPrice = model.unitPrice;
      this.totalPrice = model.totalPrice;
      this.orginSrc = model.imagePath;
      this.imagePath = app.image.get(model.imagePath, app.config.noImage);

      this.theTitle = _.sprintf('%s %s', this.areaName, this.communityName);
      this.features = this.feature.split(',').splice(0, 4);
      this.squareDisplay = _.sprintf('%s㎡', this.square);
      this.houseTypeDisplay = _.sprintf('%s室%s厅', this.room, this.hall);
      this.floorDisplay = _.sprintf('%s/%s层', this.theFloor, this.totalFloor);
      this.unitPriceDisplay = _.sprintf('%f元/㎡', this.unitPrice);
      this.totalPriceDisplay = _.sprintf('%f万元', this.totalPrice);

      this.unopened = app.messager.unopened;
    }

    function Houses() {
      this.color = ['#ff8498', '#7cd9e1', '#ffb284', '#7ce17c'];
      this.recommends = ko.observableArray();

      this.goHouseList = function () {
        app.util.goTo('houseList.htm', {
          type: 'saleHouse'
        });
      };
      this.goHouseDetail = function (record) {
        app.util.goTo('houseDetail.htm', {
          tableId: record.tableId,
          type: 'saleHouse'
        }, false);
      }
    }

    Houses.prototype.initialize = function (dom, houses) {
      ko.applyBindings(this, dom);
      if (houses)
        this.load(houses);
    };
    Houses.prototype.load = function (datas) {
      this.recommends.removeAll();
      for (var i = 0, len = datas.length; i < len; i++) {
        this.recommends.push(new House(datas[i]));
      }
    };

    app.module.houses = new Houses();
  })(app, ko, _);

  function initialize() {
    //console.log('home.htm initialize');
    $('#professional').hide();
    var module = app.module;
    module.cityAds.initialize(document.getElementById('ads-section'));
    module.news.initialize(document.getElementById('news-section'));
    module.houses.initialize(document.getElementById('recommend-section'));
    module.searchPosition.initialize(document.getElementById('search-section'), document.getElementById('city-switch'), document.getElementById('tab-home'));
    module.resources.initialize(document.getElementById('house-section'), document.getElementById('recommend-section'));
    module.services.initialize(document.getElementById('service-section'));
    module.publish.initialize(document.getElementById('topPopover'));

    load();
    events();
  }

  function load() {
    //console.log('home.htm load');
    app.module.searchPosition.load();
    var module = app.module,
      home = app.cache.get('home');
    if (home) {
      bind(home);
      setTimeout(function () {
        ajaxBind(function (response) {
          bind(response);
        });
      }, 100);
    } else {
      ajaxBind(function (response) {
        bind(response);
      });
    }

    function ajaxBind(callback) {
      var cityId = app.module.searchPosition.city.tableId;
      app.request.postAction('tdwr', 'IndexList', {
        p1: cityId,
        p2: 'recommend'
      }, function (response) {
        //app.cache.set('home', response);
        callback(response);
      });
    }

    function bind(data) {
      module.cityAds.load(data.advertisementList);
      module.news.load(data.informationList);
      module.houses.load(data.saleHouseList);

      app.cache.set('home', {
        advertisementList: module.cityAds.cityAds(),
        informationList: module.news.news(),
        saleHouseList: module.houses.recommends()
      });
    }

    function reload() {
      //console.log('home.htm reload');
      ajaxBind(function (data) {
        bind(data);
        mui('#refreshContainer').pullRefresh().endPulldownToRefresh(); //参数为true代表没有更多数据了。
      });
    }

    mui.init({
      pullRefresh: {
        container: '#refreshContainer',
        //up: {
        //  contentrefresh: '正在加载...',
        //  callback: pullupRefresh
        //},
        down: {
          callback: reload
        }
      }
    });
  }

  function events() {
    document.addEventListener('pagebeforeshow', function () {
      // when subpages create, does not trigger 'pagebeforeshow' event
      //console.log('home.htm pagebeforeshow');
      load();
    }, false);

    window.addEventListener('toggle-noImage', function (event) {
      var noImage = event.detail.noImage;
      $('#recommend-section,#news-section').find('img').each(function () {
        var imagePath = app.image.get($(this).attr('orginSrc'), noImage);
        this.src = imagePath;
      });
    });
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _)