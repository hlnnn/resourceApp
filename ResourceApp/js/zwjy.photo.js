// Photo
(function (app, ko) {

  function Photo(autoUpload) {
    this.imagePath = ko.observable();
    this.imgData = '';
    this.autoUpload = autoUpload;

    var self = this;
    // 拍照上传
    this.getImage = function () {
      getImage(self);
    };

    //本地相册选择 
    this.galleryImg = function () {
      galleryImg(self);
    };

    //本地相册选择 
    this.uploadHead = function () {
      uploadHead(self);
    };

    this.uploadHeadSuccess = undefined;
  }

  function getImage(self) {
    var c = plus.camera.getCamera();
    c.captureImage(function (e) {
      plus.io.resolveLocalFileSystemURL(e, function (entry) {
        self.imagePath = entry.toLocalURL() + "?version=" + new Date().getTime();
        self.uploadHead(); /*上传图片*/
      }, function (e) {
        console.log("读取拍照文件错误：" + e.message);
      });
    }, function (s) {
      console.log("error" + s);
    }, {
      filename: "_doc/head.png"
    });
  }

  function galleryImg(self) {
    plus.gallery.pick(function (a) {
      plus.io.resolveLocalFileSystemURL(a, function (entry) {
        plus.io.resolveLocalFileSystemURL("_doc/", function (root) {
          root.getFile("head.png", {}, function (file) {
            //文件已存在 
            file.remove(function () {
              console.log("file remove success");
              entry.copyTo(root, 'head.png', function (e) {
                  self.imagePath = e.fullPath + "?version=" + new Date().getTime();
                  self.uploadHead(); /*上传图片*/
                  //变更大图预览的src 
                  //目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现 
                },
                function (e) {
                  console.log('copy image fail:' + e.message);
                });
            }, function () {
              console.log("delete image fail:" + e.message);
            });
          }, function () {
            //文件不存在 
            entry.copyTo(root, 'head.png', function (e) {
              var path = e.fullPath + "?version=" + new Date().getTime();
              uploadHead(path); /*上传图片*/
            }, function (e) {
              console.log('copy image fail:' + e.message);
            });
          });
        }, function (e) {
          console.log("get _www folder fail");
        });
      }, function (e) {
        console.log("读取拍照文件错误：" + e.message);
      });
    }, function (a) {}, {
      filter: "image"
    });
  }

  //上传头像图片 
  function uploadHead(self) {
    console.log("imagePath = " + self.imagePath);
    var mainImage = document.getElementById('myPhoto');
    mainImage.src = self.imagePath;
    /*mainImage.style.width = "60px";
    mainImage.style.height = "60px";*/
    if (!self.autoUpload) return;
    var image = new Image();
    image.src = self.imagePath;
    image.onload = function () {
      var imgData = getBase64Image(image);
      self.imgData = imgData;
      app.request.postActionAuth('tudwr', 'FileUploadQiniuServlet', {
        p2: self.imgData
      }, function (response) {
        console.log(response.imagePath);
        if (response.result === 'success') {
          if (app.module.photo.uploadHeadSuccess) {
            app.module.photo.uploadHeadSuccess(response);
          } else {
            mainImage.src = self.imagePath = response.imagePath;
          }
        } else {
          app.messager.toast(response.info);
        }
      });
    }
  }

  //将图片压缩转成base64 
  function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    var width = img.width;
    var height = img.height;
    // calculate the width and height, constraining the proportions 
    if (width > height) {
      if (width > 100) {
        height = Math.round(height *= 100 / width);
        width = 100;
      }
    } else {
      if (height > 100) {
        width = Math.round(width *= 100 / height);
        height = 100;
      }
    }
    canvas.width = width; /*设置新的图片的宽度*/
    canvas.height = height; /*设置新的图片的长度*/
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height); /*绘图*/
    var dataURL = canvas.toDataURL("image/png", 0.8);
    return dataURL.replace("data:image/png;base64,", "");
  }

  app.module.photo = new Photo(true);
})(app, ko);