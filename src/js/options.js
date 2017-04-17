/*global chrome:false, document:false,
  setTimeout: false, require*/
// Saves options to chrome.storage
const Pubsub = require('./Pubsub');
const PromiseWrapper = require('./PromiseWrapper');

let optionsPromise = new PromiseWrapper();
let ps = new Pubsub();
const TRIGGERS = {
  MOUSE: 'MOUSE',
  KEYBOARD: 'KEYBOARD'
};
let defaults = {
  longFormat: false,
  trigger: TRIGGERS.MOUSE,
  measureArea: true,
  doScreenCoordinates: false
};
function resetOptions () {
  setOptions(defaults);
  restoreOptions();
}
function messageApp (opts) {
  chrome.tabs.query({}, function (tabs) {
    var i;
    for (i = 0; i < tabs.length; i += 1) {
      chrome.tabs.sendMessage(tabs[i].id, {
        op: 'options',
        value: opts
      });
    }
  });
}
function setOptions (opts) {
  chrome.storage.sync.set(
    opts,
    function () {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      messageApp(opts);
      ps.pub('optionsChanged', opts); // also let options content script know
      setTimeout(function () {
        status.textContent = '';
      }, 750);
    });
}
function getInputValueFromForm () {
  var o = {};
  // function getItemFromForm (item) {
  //   o[item] = document.getElementById(item).value;
  // }
  function getInputValueChecked (item) {
    return document.getElementById(item).checked;
  }
  let isKeyboard = getInputValueChecked('trigger-keyboard');
  let isMouse = getInputValueChecked('trigger-mouse');
  if (isKeyboard) {
    o.trigger = TRIGGERS.KEYBOARD;
  }
  if (isMouse) {
    o.trigger = TRIGGERS.MOUSE;
  }
  o.doScreenCoordinates = getInputValueChecked('screen-coordinates');
  o.measureArea = !!getInputValueChecked('measure-area');
  o.longFormat = !!getInputValueChecked('long-format');
  return o;
}
function saveOptions () {
  document.getElementById('save').classList.remove('dirty');
  setOptions(getInputValueFromForm());
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function onLoad () {
  restoreOptions();
  let inputs = document.querySelectorAll('input, select');
  let i;
  for (i = 0; i < inputs.length; i += 1) {
    inputs[i].addEventListener('change', function () {
      document.getElementById('save').classList.add('dirty');
      ps.pub('optionsChanged', getInputValueFromForm());
    });
  }

  //

  let areaMeasureCheckbox = document.getElementById('measure-area');
  areaMeasureCheckbox.addEventListener('change', function () {
    let triggerKeyboard = document.getElementById('trigger-keyboard');
    let triggerMouse = document.getElementById('trigger-mouse');
    if (areaMeasureCheckbox.checked) {
      triggerKeyboard.removeAttribute('disabled', areaMeasureCheckbox.checked);
      triggerMouse.removeAttribute('disabled', areaMeasureCheckbox.checked);
      let labels = document.querySelectorAll('.triggers-labels');
      labels.forEach((labelDom) => {
        labelDom.classList.remove('disabled');
      });
    } else {
      triggerKeyboard.setAttribute('disabled', areaMeasureCheckbox.checked);
      triggerMouse.setAttribute('disabled', areaMeasureCheckbox.checked);
      let labels = document.querySelectorAll('.triggers-labels');
      labels.forEach((labelDom) => {
        labelDom.classList.add('disabled');
      });
    }
  });
}
function restoreOptions () {
  // Use default value color = 'red'
  chrome.storage.sync.get(defaults, function (items) {
    // function setInputValueToItem (item) {
    //   document.getElementById(item).value = items[item];
    // }
    function setChecked (item, val) {
      document.getElementById(item).checked = val;
    }
    if (items.trigger === TRIGGERS.MOUSE) {
      setChecked('trigger-mouse', true);
    }
    if (items.trigger === TRIGGERS.KEYBOARD) {
      setChecked('trigger-keyboard', true);
    }
    setChecked('screen-coordinates', items.doScreenCoordinates);
    setChecked('measure-area', items.measureArea);
    setChecked('long-format', items.longFormat);
    optionsPromise.resolver(items);
  });
}
document.addEventListener('DOMContentLoaded', onLoad);
document.getElementById('save').addEventListener('click',
    saveOptions);
document.getElementById('reset').addEventListener('click',
    resetOptions);

window.mousepositionOptionsPage = {
  pubsub: ps,
  optionsPromise: optionsPromise
};
