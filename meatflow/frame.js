(function () {
  meatflow.getUserMedia({ video: true }, function (mediaStream) {
    var video = document.createElement('video');
    var parent = meatflow.$('body');

    video.id = 'MeatflowVideo';
    video.autoplay = true;
    video.src = meatflow.createObjectURL(mediaStream);

    parent.appendChild(video);

    document.body.addEventListener('click', function () {
      meatflow.record(video, 2, function (url) {
        window.parent.postMessage(url, 'https://www.flowdock.com');
      });
    });
  });
})();

