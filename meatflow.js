(function init () {
  var parent = meatflow.$('#inbox');
  var input = meatflow.$('.message-input');
  var iframe;

  if (!(parent && input)) {
    return window.setTimeout(init, 1000);
  }

  iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('frame.html');
  iframe.id = 'Meatflow';

  meatflow.$('#inbox').appendChild(iframe);

  window.addEventListener('message', function (message) {
    console.log('Meat:', message.data);

    input.value = message.data + '\n' + input.value;
  });
})();
