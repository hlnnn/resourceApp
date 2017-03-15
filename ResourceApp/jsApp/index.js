(function (app, mui, $, ko, _) {
  var subpage_style = {
    top: '0px',
    bottom: app.config.bottom
  };
  var aniShow = {};
  var subpages = ['home.htm', 'customerNotLogin.htm', 'my.htm'];
  mui.init();

  function initialize() {
    var self = plus.webview.currentWebview();
    for (var i = 0; i < subpages.length; i++) {
      var temp = {};
      var sub = plus.webview.create(subpages[i], subpages[i], subpage_style);
      if (i > 0) {
        sub.hide();
      } else {
        temp[subpages[i]] = "true";
        mui.extend(aniShow, temp);
      }
      self.append(sub);
    }

    checkVersion(app.location.position); // plus ready进行版本更新检查
  }

  // 检查版本更新
  function checkVersion(failCallback) {
    // 获取本地应用资源版本号
    plus.runtime.getProperty(plus.runtime.appid, function (inf) {
      var version = inf.version;
      toDefaultCity(version);
      app.request.post('update/last-version', { version: version }, function (response) {
        if (response.result === 'success') {
          // 服务器版本列表
          var serverVersion = response.lastVersion[0], //数据第1个
            force = serverVersion.force;
          if (force) {
            plus.nativeUI.showWaiting('Version ' + serverVersion.version + ' 更新中...');
            downWgt(serverVersion.filePath);
          } else {
            var remark = serverVersion.remark || serverVersion.version,
              btnArray = ['下次再更新', '现在更新'];
            app.messager.confirm('有新版本更新', remark, btnArray, function (e) {
              if (e.index === 1) {
                downWgt(serverVersion.filePath);
              } else {
                failCallback();
              }
            });
          }
        } else {
          failCallback();
        }
      });
    });
  }

  function toDefaultCity(version) {
    // 每次更新强制更新城市信息
    var force = app.cache.get('force');
    if (!force || force.version !== version) {
      app.cache.set('force', { version: version });
      app.location.switchCity(app.localStorage.getCity() || app.defaultCity);
    }
  }

  // 下载更新文件
  function downWgt(wgtUrl) {
    plus.nativeUI.showWaiting('下载应用资源文件中...');
    plus.downloader.createDownload(wgtUrl, {
      filename: '_doc/update/'
    }, function (d, status) {
      if (status === 200) {
        installWgt(d.filename); // 安装wgt包
      } else {
        plus.nativeUI.alert('下载应用资源文件失败！');
      }
      plus.nativeUI.closeWaiting();
    }).start();
  }

  // 更新应用资源
  function installWgt(path) {
    plus.nativeUI.showWaiting('应用资源更新中...');
    plus.runtime.install(path, {}, function () {
      plus.nativeUI.closeWaiting();
      plus.nativeUI.alert('应用资源更新完成！', function () {
        plus.runtime.restart();
      });
    }, function (e) {
      plus.nativeUI.closeWaiting();
      plus.nativeUI.alert('应用资源文件更新失败[' + e.code + ']：' + e.message);
    });
  }
  events();

  function events() {
    var activeTab = subpages[0],
      aniShow = {};
    //选项卡点击事件
    mui('#nav-footer').on('tap', 'a', function (e) {
      var targetTab = this.getAttribute('href');
      if (targetTab === activeTab) {
        return;
      }
      //更换标题
      //title.innerHTML = this.querySelector('.mui-tab-label').innerHTML;
      //显示目标选项卡
      //若为iOS平台或非首次显示，则直接显示
      if (mui.os.ios || aniShow[targetTab]) {
        plus.webview.show(targetTab);
      } else {
        //否则，使用fade-in动画，且保存变量
        var temp = {};
        temp[targetTab] = 'true';
        mui.extend(aniShow, temp);
        plus.webview.show(targetTab, 'fade-in', 300);
      }
      //隐藏当前;
      plus.webview.hide(activeTab);
      //更改当前活跃的选项卡
      activeTab = targetTab;
    });
  }

  app.plusReady(initialize);

})(app, mui, jQuery, ko, _);