(function () {
  var endCurrentStream = function () {};

  window.addEventListener('message', function (message) {
    if (message.data === 'enable') {
      endCurrentStream();

      meatflow.getUserMedia({ video: true }, function (mediaStream) {
        var video = document.createElement('video');
        var parent = meatflow.$('body');
        var bodyClickHandler = function () {
          meatflow.record(video, 2, function (url) {
            window.parent.postMessage({ url: url }, 'https://www.flowdock.com');
          });
        };

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
      });
    } else if (message.data === 'disable') {
      endCurrentStream();
    }
  });
})();

