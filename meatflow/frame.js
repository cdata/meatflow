(function () {
  var endCurrentStream = function () {};

  window.addEventListener('message', function (message) {
    if (message.data === 'enable') {
      endCurrentStream();

      meatflow.getUserMedia({ video: true }, function (mediaStream) {
        var video = document.createElement('video');
        var parent = meatflow.$('body');
        var progress = document.createElement('div');
        var bodyClickHandler = function () {
          meatflow.record(video, 2, function onProgress (ratio) {
            progress.style.width = Math.floor(ratio * 100) + '%';
          }, function onGif (url) {
            window.parent.postMessage({ url: url }, 'https://www.flowdock.com');
            progress.style.width = 0;
          });
        };

        parent.appendChild(progress);
        progress.classList.add('meatflow-progress');

        endCurrentStream = function () {
          if (!video) {
            return;
          }

          document.body.removeEventListener('click', bodyClickHandler);
          mediaStream.stop();

          parent.removeChild(video);
          video = null;

          endCurrentStream = function () {};
        };

        video.id = 'MeatflowVideo';
        video.autoplay = true;
        video.src = meatflow.createObjectURL(mediaStream);

        parent.appendChild(video);

        document.body.addEventListener('click', bodyClickHandler);

        window.parent.postMessage('enabled', 'https://www.flowdock.com');
      }, function (error) {
        try {
          console.error(error);
        } catch (e) {}
      });
    } else if (message.data === 'disable') {
      endCurrentStream();
    }
  });

  // TODO: Move this to some kind of debug page..
  /*meatflow.getUserMedia({ video: true }, function (ms) {
    var video = document.createElement('video');
    var parent = meatflow.$('body');
    var image = document.createElement('img');

    var gif = new Animated_GIF({
      workerPath: chrome.extension.getURL('bower_components/Animated_GIF/dist/Animated_GIF.worker.js')
    });

    gif.setSize(320, 240);

    video.src = meatflow.createObjectURL(ms);
    video.autoplay = true;

    video.style.width = '160px';
    video.style.height = '120px';

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = 320;
    canvas.height = 240;

    parent.appendChild(video);
    parent.appendChild(canvas);
    parent.appendChild(image);

    video.addEventListener('click', function () {
      console.log(meatflow.scaledDimensions(video));
      context.drawImage.apply(context, meatflow.scaledDimensions(video));
      gif.addFrameImageData(context.getImageData(0, 0, 320, 240));

      gif.getBase64GIF(function (b64) {
        image.src = b64;
      });
    });
  });*/
})();

