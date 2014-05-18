window.meatflow = (function (meatflow) {

  meatflow.getUserMedia = (function () {
    return function () {
      return (navigator.getUserMedia ||
              navigator.webkitGetUserMedia ||
              navigator.mozGetUserMedia ||
              navigator.msGetUserMedia || function () {
          try {
            console.log('This browser does not support navigator.getUserMedia.');
          } catch(e) {
            // Or the console, for that matter..
          }
      }).apply(navigator, arguments);
    };
  })();

  meatflow.createObjectURL = (function () {
    return window.URL.createObjectURL;
  })();

  meatflow.scaledDimensions = function (video) {
    var computed = window.getComputedStyle(video);
    var elementWidth = window.parseInt(computed.width.replace('px', ''));
    var elementHeight = window.parseInt(computed.height.replace('px', ''));
    var videoWidth = video.videoWidth;
    var videoHeight = video.videoHeight;

    var scaledWidth = elementHeight / videoHeight * videoWidth;
    var scaledHeight = elementHeight;

    var originX = (elementWidth - scaledWidth) / 2;
    var originY = (elementHeight - scaledHeight) / 2;

    console.log(originX, originY, scaledWidth, scaledHeight);

    return [
      video,
      originX, originY,
      scaledWidth * 2,
      scaledHeight * 2,
      0, 0, 320, 240
    ];
  };

  meatflow.$ = function (selector) {
    return document.querySelector(selector);
  };

  meatflow.postToImgur = function (gif, callback) {

    gif.getBase64GIF(function (base64Gif) {
      var request = new XMLHttpRequest();
      var base64Data = base64Gif.split(',').pop();

      request.onreadystatechange = function (e) {
        if (request.readyState < 4) {
          return;
        }

        callback(JSON.parse(request.response).data.link);
        request.onreadystatechange = null;
      };

      request.open('POST', 'https://api.imgur.com/3/upload', true);
      request.setRequestHeader('Accept', 'application/json');
      request.setRequestHeader('Authorization', 'Client-ID b65746fd3674c5b');
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

      request.send('type=base64&image=' + encodeURIComponent(base64Data));
    })
  };

  meatflow.captureFrame = (function () {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var width = 320;
    var height = 240;

    window.canvas = canvas;

    canvas.width = 320;
    canvas.height = 240;

    canvas.debug = function () {
      canvas.id = 'MeatflowDebugCanvas';
      document.body.appendChild(canvas);
    };

    return function (video) {
      context.drawImage.apply(context, meatflow.scaledDimensions(video));
      return context.getImageData(0, 0, width, height);
    };
  })();

  meatflow.record = function (video, seconds, callback) {
    var frames = seconds * 5;
    var handle = function (handler) {
      (function nextFrame () {
        handler(meatflow.captureFrame(video));

        if (frames--) {
          window.setTimeout(nextFrame, 200);
        } else {
          handler();
        }
      })();
    };

    meatflow.handleGifProvider(handle, callback);
  };

  meatflow.handleGifProvider = function (handle, callback) {

    var gif = new Animated_GIF({
      workerPath: chrome.extension.getURL('bower_components/Animated_GIF/dist/Animated_GIF.worker.js')
    });

    gif.setSize(320, 240);
    gif.setDelay(0.2);

    handle(function (frame) {
      if (frame) {
        gif.addFrameImageData(frame);
      } else {
        meatflow.postToImgur(gif, function (url) {
          callback(url);
          gif.destroy();
        });
      }
    });
  };

  return meatflow;
})(window.meatflow || {});
