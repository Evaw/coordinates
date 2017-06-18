/*global chrome:false, document:false, localStorage: false*/
(function (window) {
  'use strict';
  var isOn = {};
  function setIconState (tabId) {
    var icon;
    if (isOn[tabId]) {
      icon = 'img/icons/icon48.png';
    } else {
      icon = 'img/icons/iconoff48.png';
    }
    chrome.browserAction.setIcon({
      tabId: tabId,
      path: icon
    });
  }
  function setContentScriptIsOn (tabId) {
    chrome.tabs.sendMessage(tabId,
      {
        op: 'switch',
        value: isOn[tabId]
      });
  }
  function setCurrentTabIcon (toggle) {
    chrome.tabs.query({active: true,
        lastFocusedWindow: true
      },
      function (tabs) {
        var tab = tabs[0];
        if (toggle) {
          isOn[tab.id] = !isOn[tab.id];
        }
        setContentScriptIsOn(tab.id);
        setIconState(tab.id);
      });
  }
  function onChange () {
    setCurrentTabIcon(true);
  }
  chrome.browserAction.onClicked.addListener(function (tab) {
    onChange();
  });

  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
      setContentScriptIsOn(tabId);
      setIconState(tabId);
      chrome.storage.sync.get({
        trigger: 'MOUSE',
        measureArea: true,
        doScreenCoordinates: false,
        longFormat: false,
        displayMousePosition: true
      }, function (items) {
        chrome.tabs.sendMessage(tabId, {
          op: 'options',
          value: items
        });
      });
    }
  });
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    setContentScriptIsOn(activeInfo.tabId);
  });
  function onInstall () {
    // Add a `manifest` property to the `chrome` object.
    chrome.manifest = chrome.app.getDetails();
    let injectIntoTab = function (tab) {
      // You could iterate through the content scripts here
      let scripts = chrome.manifest.content_scripts[0].js;
      for (let i = 0; i < scripts.length; i += 1) {
        chrome.tabs.executeScript(tab.id, {
          file: scripts[i]
        });
      }
    };

    // Get all windows
    chrome.windows.getAll({
      populate: true
    }, function (windows) {
      let w = windows.length;
      for (let i = 0; i < w; i += 1) {
        let currentWindow = windows[i];
        for (let j = 0; j < currentWindow.tabs.length; j += 1) {
          let currentTab = currentWindow.tabs[j];
          // Skip chrome://
          if (!currentTab.url.match(/^chrome:\/\//gi)) {
            injectIntoTab(currentTab);
          }
        }
      }
    });
  }

  function onUpdate () {
    // console.log('Extension Updated');
  }

  function getVersion () {
    let details = chrome.app.getDetails();
    return details.version;
  }

  // Check if the version has changed.
  let currVersion = getVersion();
  let prevVersion = localStorage['version'];
  if (currVersion !== prevVersion) {
    // Check if we just installed this extension.
    if (typeof prevVersion === 'undefined') {
      onInstall();
    } else {
      onUpdate();
    }
    localStorage['version'] = currVersion;
  }
}(this));
