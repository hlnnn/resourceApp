(function (app) {
  var city = app.localStorage.getCity(),
    cityName = city.theName;
  var initBounds,
    list,
    topLeftLatitude,
    topLeftLongitude,
    lowerRightLatitude,
    lowerRightLongitude,
    map;

  function Map() {
    var self = this;
    this.initialize = function (elId, height) {
      // 百度地图API功能  //120.590563, 31.312591
      $('#' + elId).height(height || $(window).height());
      self.map = map = new BMap.Map(elId, {
        minZoom: 10,
        maxZoom: 18
      });
      map.centerAndZoom(cityName, 15); // 初始化地图,用城市名设置地图中心点
      map.addEventListener("moveend", function (e) {
        reloadMap();
      });
    };
    this.reload = reloadMap;
    this.disableDragging = function () { //禁用地图拖拽。
      map.disableDragging();
    };
    this.disableDoubleClickZoom = function () { //禁用双击放大。
      map.disableDoubleClickZoom();
    }
    this.disablePinchToZoom = function () { //禁用双指操作缩放。
      map.disablePinchToZoom();
    }
    this.load = function (datas, position) {
      list = datas;
      loadMap();
      if (list.length) {
        if (position) {
          var center = datas[0];
          map.setZoom(15);
          map.setCenter(new BMap.Point(center.longitude, center.latitude));
        } else {
          map.centerAndZoom(cityName, 15);
        }
      } else {
        app.messager.toast('没有数据');
      }
    }
    this.center = function (center) {
      self.load([center]);
      setTimeout(function () {
        map.setCenter(new BMap.Point(center.longitude, center.latitude));
      }, 1000);
    }
  }

  function reloadMap() {
    var bs = map.getBounds(); //获取可视区域
    var bssw = bs.getSouthWest(); //可视区域左下角
    var bsne = bs.getNorthEast(); //可视区域右上角
    if (bssw && bsne) {
      topLeftLatitude = bsne.lat; //左上角纬度
      topLeftLongitude = bssw.lng; //左上角经度
      lowerRightLatitude = bssw.lat; //右下角纬度
      lowerRightLongitude = bsne.lng; //右下角经度
      initBounds = true;
      loadMap();
    }
  }

  function setEvent() {
    //跳转到列表页面
    var communities = document.getElementsByClassName('jumpCommunity');
    var type = app.util.getExtrasValue('type');
    if (type) {
      for (var i = 0, len = communities.length; i < len; i++) {
        var el = communities[i];
        el.addEventListener('touchstart', function () {
          var $el = $(this),
            extras = _.extend({
              itemValue: this.id,
              itemText: this.innerHTML,
              type: type
            }, $el.data());
          //app.util.goTo('houseMapForCommunity.htm',{type: type}, extras);
          app.util.goTo('houseMapForCommunity.htm', extras, true);
        });
      }
    }
  }

  function loadMap() {
    map.clearOverlays();
    if (initBounds && list != null) {
      var len = list.length;
      for (var i = 0; i < len; i++) {
        var item = list[i];
        var longitude = item.longitude;
        var latitude = item.latitude;
        if (longitude > topLeftLongitude && longitude < lowerRightLongitude && latitude < topLeftLatitude && latitude > lowerRightLatitude) {
          var html = _.sprintf('<a class="jumpCommunity" href="#searchByCommunity" style="color:white;text-decoration: none;font-size:10px" id="%s" data-longitude="%s" data-latitude="%s">%s</a>', item.itemValue, item.longitude, item.latitude, item.itemText);
          var myCompOverlay = new getComplexCustomOverlay(new BMap.Point(item.longitude, item.latitude), html);
          map.addOverlay(myCompOverlay);
        };
      };
      setEvent();
    }
  }

  function ComplexCustomOverlay(point, text) {
    this._point = point;
    this._text = text;
  }

  function getComplexCustomOverlay(point, text) {
    // 复杂的自定义覆盖物
    ComplexCustomOverlay.prototype = new BMap.Overlay();
    ComplexCustomOverlay.prototype.initialize = function (map) {
      this._map = map;
      var div = this._div = document.createElement("div");
      div.style.position = "absolute";
      div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
      div.style.border = "1px solid #FFF";
      div.style.borderRadius = "6px";
      div.style.color = "white";
      div.style.backgroundColor = "#EA3333";
      div.style.padding = "2px 4px";
      div.style.lineHeight = "13px";
      div.style.whiteSpace = "nowrap";
      div.style.MozUserSelect = "none";
      div.style.fontSize = "12px";
      var span = this._span = document.createElement("span");
      div.appendChild(span);
      span.innerHTML = this._text;
      var arrow = this._arrow = document.createElement("div");
      arrow.style.background = _.sprintf("url(%s/images/arr_map_mark.png) no-repeat", AppConfig.resourceApp);
      arrow.style.position = "absolute";
      arrow.style.width = "11px";
      arrow.style.height = "10px";
      arrow.style.top = "17px";
      arrow.style.left = "10px";
      arrow.style.overflow = "hidden";
      div.appendChild(arrow);
      map.getPanes().labelPane.appendChild(div);
      return div;
    };
    ComplexCustomOverlay.prototype.draw = function () {
      var map = this._map;
      var pixel = map.pointToOverlayPixel(this._point);
      this._div.style.left = pixel.x - parseInt(this._arrow.style.left) + "px";
      this._div.style.top = pixel.y - 30 + "px";
    };
    return new ComplexCustomOverlay(point, text);
  }

  app.map = new Map();
})(app);