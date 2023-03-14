(function () {
  'use strict';

  figma.showUI(__html__, { width: 450, height: 600, title: 'Bud' });

  figma.ui.onmessage = (msg) => {
    if (msg.type === 'clone') {
      const imagePlugin = async () => {
        const node = figma.currentPage.selection[0];
        node.width;
        node.height;

        // Export a 2x resolution PNG of the node
        const bytes = await node.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 2 },
        });
        const processName = 'ImageProcess';

        if (node) {
          sendDatatoUI(bytes);
        }

        // Add the image onto the canvas as an image fill in a frame
        // const image = figma.createImage(bytes)
        // const frame = figma.createFrame()
        // frame.x = 700
        // frame.resize(w, h)
        // frame.fills = [{
        //   imageHash: image.hash,
        //   scaleMode: "FILL",
        //   scalingFactor: 1,
        //   type: "IMAGE",
        // }]

        async function sendDatatoUI(bytes) {
          figma.ui.postMessage({ process: processName, bytesData: bytes });
        }
      };

      imagePlugin();
    }
    if (msg.type === 'LogOut') {
      figma.clientStorage.deleteAsync('access_token').then(() => {
        figma.ui.postMessage({ clear_Access: true });
      });
      figma.clientStorage.deleteAsync('refresh_token').then(() => {
        figma.ui.postMessage({ clear_Refresh: true });
      });
    }
    if (msg.type === 'User_Data') {
      figma.clientStorage
        .setAsync('User_Data', msg.data)
        .then(() => {})
        .catch((err) => console.error('Error Saving value:', err));
    }
    if (msg.type === 'Get_userData') {
      figma.clientStorage
        .getAsync('User_Data')
        .then((value) => {
          figma.ui.postMessage({ user_data: value });
        })
        .catch((err) => console.error('Error retrieving value:', err));
    }
    const interval = 60 * 60 * 1000;
    const clearTokenintervel = () => {
      figma.clientStorage
        .deleteAsync('access_token')
        .then(() => {
          console.log('Access Token Removed Successfully');
        })
        .catch((error) => console.error(error));
      figma.clientStorage
        .deleteAsync('refresh_token')
        .then(() => {
          console.log('Access Token Removed Successfully');
        })
        .catch((error) => console.error(error));
      figma.ui.postMessage({ clear_Access: true });
    };
    if (msg.type === 'Get_Access') {
      figma.clientStorage
        .getAsync('access_token')
        .then((value) => {
          if (value) {
            figma.ui.postMessage({ Get_Access: true, accesstoken: value });
            setInterval(clearTokenintervel, interval);
          } else {
            figma.ui.postMessage({ Get_Access: false });
          }
        })
        .catch((err) => console.error('Error retrieving value:', err));
      figma.clientStorage
        .getAsync('refresh_token')
        .then((value) => {
          if (value) {
            figma.ui.postMessage({ Get_Refresh: true, refreshtoken: value });
            setInterval(clearTokenintervel, interval);
          } else {
            figma.ui.postMessage({ Get_Refresh: false });
          }
        })
        .catch((err) => console.error('Error retrieving value:', err));
    }
    if (msg.type === 'login') {
      async function fetchCode(url) {
        const response = await fetch(url);
        const data = await response.json();
        const code = data.data.code;
        console.log(code);
        const WINDOW_BASE_URL = 'https://api.bud.dev2staging.com/v1/oauth/google?code=';
        const POLL_URL_BASE = 'https://api.bud.dev2staging.com/v1/plugin-auth/code?code=';

        const WINDOW_URL = WINDOW_BASE_URL.concat(code);
        const POLL_URL = POLL_URL_BASE.concat(code);
        const processName = 'LoginProcess';
        figma.ui.postMessage({ process: processName, windowURL: WINDOW_URL, pollURL: POLL_URL });
      }

      fetchCode('https://api.bud.dev2staging.com/v1/plugin-auth/code');
    }
    if (msg.type === 'accessToken') {
      figma.clientStorage
        .setAsync('access_token', msg.accesstoken)
        .then(() => {})
        .catch((err) => console.error('Error Saving value:', err));
      figma.clientStorage
        .setAsync('refresh_token', msg.refreshtoken)
        .then(() => {})
        .catch((err) => console.error('Error Saving value:', err));
      setInterval(clearTokenintervel, interval);
    }
    figma.on('close', () => {
    });
  };

})();
