function Meatflow () {
  return new Promise(function (resolve, reject) {
    (function init () {
      var parent = meatflow.$('.message-form');
      var input = meatflow.$('.message-input');
      var chat = meatflow.$('#chat');
      var flow = meatflow.$('.flow');
      var isCriticalElement;
      var iframe;
      var messageHandler;
      var iconClickHandler;
      var enableCamera;
      var disableCamera;
      var teardown;
      var reinitializeTimer;

      if (!(parent && input && chat && flow)) {
        return window.setTimeout(init, 1000);
      }

      isCriticalElement = function (element) {
        return element === parent ||
          element === input ||
          element === chat ||
          element === flow;
      };

      enableCamera = function () {
        if (parent.classList.contains('meatflow-active')) {
          return;
        }

        window.addEventListener('message', function enable (message) {
          if (!(message.data === 'enabled')) {
            return;
          }

          parent.classList.add('meatflow-active');
          window.removeEventListener('message', enable);
        });

        iframe.contentWindow.postMessage('enable', meatflow.extensionOrigin);
      };

      disableCamera = function () {
        if (!parent.classList.contains('meatflow-active')) {
          return;
        }

        iframe.addEventListener('webkitTransitionEnd', function disable () {
          iframe.contentWindow.postMessage('disable', meatflow.extensionOrigin);
          iframe.removeEventListener('webkitTransitionEnd', disable);
        });

        parent.classList.remove('meatflow-active');
      };

      iframe = document.createElement('iframe');
      iframe.src = chrome.runtime.getURL('frame.html');
      iframe.id = 'Meatflow';
      iframe.width = 160;
      iframe.height = 120;

      parent.appendChild(iframe);
      parent.classList.add('meaty');

      icon = document.createElement('div');
      icon.classList.add('meatflow-icon');
      icon.style.backgroundImage = 'url(' + chrome.runtime.getURL('meatflow-256.png') + ')';

      chat.classList.add('meaty');

      iconClickHandler = function () {
        if (parent.classList.contains('meatflow-active')) {
          disableCamera();
        } else {
          enableCamera();
        }
      };
      icon.addEventListener('click', iconClickHandler);

      parent.appendChild(icon);

      messageHandler = function (message) {
        if (message.data && message.data.url) {
          input.value = message.data.url + '\n' + input.value;
        }
      };

      window.addEventListener('message', messageHandler);

      teardown = function () {
        console.log('teardown');
        window.removeEventListener('message', messageHandler);
        icon && icon.removeEventListener('click', iconClickHandler);

        chat && chat.classList.remove('meaty');
        parent && parent.classList.remove('meaty');
        parent && parent.classList.remove('meatflow-active');

        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }

        if (icon && icon.parentNode) {
          icon.parentNode.removeChild(icon);
        }

        iframe = null;
        icon = null;
        chat = null;
        parent = null;
        flow = null;
      };

      document.body.addEventListener('DOMNodeRemoved', function removeHandler(event) {
        if (!(isCriticalElement(event.srcElement))) {
          return;
        }

        document.body.removeEventListener('DOMNodeRemoved', removeHandler);
        teardown();

        window.clearTimeout(reinitializeTimer);
        reinitializeTimer = window.setTimeout(Meatflow, 100);
      });

      resolve({
        enableCamera: enableCamera,
        disableCamera: disableCamera,
        teardown: teardown
      });
    })();
  });
}

Meatflow();

