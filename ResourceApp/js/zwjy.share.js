/*
Share 分享组件
*/
(function () {
  function ShareItem(id, extra, title, img, shareHandle) {
    this.id = id;
    this.extra = extra;
    this.title = title;
    this.img = AppConfig.resourceApp + img;
    this.share = shareHandle;
    this.msg = new ShareMessage();
  }

  var shareItems = [
    new ShareItem('weixin', 'WXSceneSession', '微信', '/images/wechat.png', share),
    new ShareItem('weixin', 'WXSceneTimeline', '朋友圈', '/images/friends.png', share),
    new ShareItem('sinaweibo', '', '新浪微博', '/images/weibo.png', share),
    new ShareItem('qq', '', 'QQ', '/images/qq.png', share),
    new ShareItem('messages', '', '短信', '/images/information.png', sms),
    new ShareItem('copyHref', '', '复制链接', '/images/link.png', copyToClip)
  ];
  var shares = {};

  // 分享
  function Share() {
    this.shareItems = shareItems;
    this.shares = shares;
    _.each(shareItems, function (el) {
      el.share = _.bind(el.share, el);
    });
  };
  function ShareMessage(href, title, thumbs, scene) {
    this.href = href;
    this.title = title;
    this.thumbs = thumbs;
    this.extra = {
      scene: scene
    };
  };

  // 发送短信
  function sms() {
    mui('#shareList').popover('toggle');
    var msg = plus.messaging.createMessage(plus.messaging.TYPE_SMS),
      paste = window.location.href + '?id=' + this.tableId;
    msg.to = [];
    msg.body = this.title + paste;
    plus.messaging.sendMessage(msg);
  }

  // 复制链接
  function copyToClip() {
    mui('#shareList').popover('toggle');
    var paste = window.location.href + '?id=' + this.tableId;
    if (plus.os.name === "Android") {
      var Context = plus.android.importClass("android.content.Context");
      var main = plus.android.runtimeMainActivity();
      var clip = main.getSystemService(Context.CLIPBOARD_SERVICE);
      plus.android.invoke(clip, paste);
      app.messager.toast("已复制该链接");
    } else {
      var UIPasteboard = plus.ios.importClass("UIPasteboard");
      //这步会有异常因为UIPasteboard是不允许init的，init的问题会在新版中修改 
      var generalPasteboard = UIPasteboard.generalPasteboard();
      // 设置/获取文本内容: www.bcty365.com
      generalPasteboard.plusCallMethod({ setValue: paste, forPasteboardType: "public.utf8-plain-text" });
      generalPasteboard.plusCallMethod({ valueForPasteboardType: "public.utf8-plain-text" });
      //var value = generalPasteboard.valueForPasteboardType("public.utf8-plain-text");
      app.messager.toast("已复制该链接");
    }
  }

  // 分享
  function share() {
    mui('#shareList').popover('toggle');
    var self = this,
      service = shares[self.id];
    if (service.authenticated) {
      shareMessage(service, self.msg);
    } else {
      service.authorize(function () {
        shareMessage(service, self.msg);
      }, function (e) {
        app.messager.toast("认证授权失败：" + e.code + " - " + e.message);
      });
    }
  }

  function shareMessage(service, msg) {
    service.send(msg, function () {
      app.messager.toast("分享到\"" + service.description + "\"成功！ ");
    }, function (e) {
      if (e.code === -2) {
        app.messager.toast('已取消分享');
      } else {
        console.log(e.code + e.message);
        app.messager.toast("分享到\"" + service.description + "\"失败: "); // + e.code + " - " + e.message
      }
    });
  }

  app.plusReady(function () {
    if (window.plus) {
      plus.share.getServices(function(s) {
        for (var i = 0; i < s.length; i++) {
          shares[s[i].id] = s[i];
        }
      }, function() {
        app.messager.toast("获取分享服务列表失败");
      });
    }
    document.getElementById("share").addEventListener('tap', function () {
      mui('#shareList').popover('toggle');
    });
  });

  app.module.share = new Share();
})(app);
