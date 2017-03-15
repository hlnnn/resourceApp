(function (app) {

  if (typeof BMap === 'undefined') throw '请添加引用 BMap ';

  function Location() {
    this.getLocation = getLocation;
    this.position = position;
    this.setCity = setCityEx;
    this.switchCity = switchCity;
  }

  function switchCity(city) {
    app.request.postAction('tdwr', 'AreaList', { cityId: city.tableId }, function (response) {
      if (response.result === 'success') {
        var city = app.localStorage.getCity();
        city.areas = response.resultList[0];
        city.metros = response.resultList[1];
        app.localStorage.setCity(city);
        mui.back();
      }
    });
    app.localStorage.setCity(city);

    var homeWebview = plus.webview.getWebviewById('home.htm');
    mui.fire(homeWebview, 'pagebeforeshow');
    var customerWebview = plus.webview.getWebviewById('customerService.htm');
    mui.fire(customerWebview, 'reload', { cityId: city.tableId });
  }

  //是否开始定位城市
  function getLocation() {
    app.messager.confirm('定位城市', '是否开始定位城市?', null, function (r) {
      if (r.index) {
        position();
      }
    });
  }

  function position(callback) {
    var options = {
      enableHighAccuracy: true,
      maximumAge: 1000
    }
    if (window.plus && plus.geolocation) {
      // plus支持geolocation
      plus.geolocation.getCurrentPosition(callback || onSuccess, onError, options);
    } else if (navigator.geolocation) {
      // 浏览器支持geolocation
      //console.log('start navigator location...');
      navigator.geolocation.getCurrentPosition(callback || onSuccess, onError, options);
    } else {
      // 浏览器不支持geolocation
      app.messager.toast("您的浏览器不支持定位");
    }
  }

  function setCityEx(city) {
    switchCity({ tableId: city.tableId, theName: city.theName });
    //app.localStorage.setCity(city);
  }

  //设置当前城市
  function setCity(code) {
    var url = AppConfig.requestPath + "hAreaRegionGetByCode.html";
    $.ajax(url, {
      type: "GET",
      dataType: "json",
      data: {
        p1: code
      },
      timeout: 5000,
      success: function (data) {
        if (data.result === "success") {
          var city = data.city;
          var currentCity = app.localStorage.getCity();
          if (currentCity.tableId !== city.tableId) {
            app.messager.confirm('定位成功', _.sprintf('是否设置%s为您当前城市', city.theName), null, function (r) {
              if (r.index) {
                app.location.setCity(city);
              }
            });
          }
        } else {
          app.messager.toast(data.info);
        }
      },
      error: function (chr) {
        app.messager.toast("请求失败");
      }
    });
  }
  // 成功时
  function onSuccess(position) {
    // 返回用户位置
    /*
     * //经度 var longitude =position.coords.longitude; //纬度 var latitude =
     * position.coords.latitude;
     */
    //console.log('start baidu location...');
    var myCity = new BMap.LocalCity();
    myCity.get(function (result) {
      //console.log('finished baidu location...');
      setCity(result.code);
    });
  }

  // 失败时
  function onError(error) {
    switch (error.code) {
      case 1:
        app.messager.alert("位置服务被拒绝");
        break;
      case 2:
        app.messager.alert("暂时获取不到位置信息");
        break;
      case 3:
        app.messager.alert("获取信息超时");
        break;
      case 4:
        app.messager.alert("未知错误");
        break;
    }
  }

  app.location = new Location();
})(app);