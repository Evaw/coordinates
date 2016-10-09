/* global chrome:false, document:false, console:false*/

(function (window) {
  'use strict';
  const DISPLAY_ID = 'mouseposition-extension-element-coordinate-display';
  if (document.getElementById(DISPLAY_ID)) {
    // already have the elements
    console.log('[coordinates extension already running]');
    return;
  }
  const setStyleProp = (el, obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        el.style[key] = obj[key];
      }
    }
  };
  let measureArea = true;
  let doScreenCoordinates = false;
  let isOn = false;
  let isWidthOn = false;
  let triggeringWithMouse = true;
  let elt;
  elt = document.createElement('div');
  elt.id = DISPLAY_ID;
  let fullContainer = document.createElement('div');
  fullContainer.id = 'mouseposition-extension-element-full-container';
  setStyleProp(fullContainer, {
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
    pointerEvents: 'none',
    zIndex: '2147483647',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif;',
    fontWeight: '400'
  });
  document.body.appendChild(fullContainer);
  let measureElt = document.createElement('div');
  let measureEltTxt = document.createElement('div');
  fullContainer.appendChild(measureElt);
  const areaMeasureColor = '#000';
  const areaMeasureBg = 'rgba(255,255,255,0.7)';
  measureElt.appendChild(measureEltTxt);
  setStyleProp(measureEltTxt, {
    flex: '1',
    textAlign: 'center',
    backgroundColor: areaMeasureBg,
    color: areaMeasureColor,
    minWidth: '42px',
    minHeight: '12px',
    transition: 'all 1s'
  });
  measureElt.id = 'mouseposition-extension-element-rect-display';
  setStyleProp(measureElt, {
    display: 'none'
  });
  let rectInitCornerPos = {
    width: 0,
    height: 0,
    x: 0,
    y: 0
  };
  let lastMouseLocationEv = null;
  fullContainer.appendChild(elt);
  setStyleProp(elt, {
    position: 'absolute',
    display: 'none',
    background: '#fff',
    fontSize: '12px',
    lineHeight: '14px',
    borderRadius: '3px',
    borderWidth: '1px',
    borderColor: 'black',
    borderTopColor: '#222',
    borderBottomColor: '#333',
    borderStyle: 'solid',
    padding: '3px',
    zIndex: '2147483647',
    color: '#222',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'default'
  });
  setStyleProp(measureElt, {
    position: 'absolute',
    background: areaMeasureBg,
    outline: 'black 1px solid',
    fontSize: '12px',
    zIndex: '2147483647',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    alignItems: 'center',
    userSelect: 'none',
    cursor: 'default',
    color: areaMeasureColor
  });
  const toggle = function (onOrOff) {
    if (isOn) {
      if (elt) {
        elt.style.display = 'block';
      }
    } else {
      if (elt) {
        elt.style.display = 'none';
      }
    }
  };
  chrome.runtime.onMessage.addListener(function (request) {
    if (request.op === 'switch') {
      isOn = request.value;
    }
    toggle(isOn);
    if (request.op === 'options') {
      setOptions(request.value);
    }
  });
  let lastEv = null;
  const showPosition = function (ev) {
    if (!isOn) {
      return;
    }
    ev = ev || lastEv;
    if (!ev) {
      return;
    }
    lastEv = ev;
    let x = ev.clientX;
    let y = ev.clientY;
    let xDoc = ev.pageX;
    let yDoc = ev.pageY;
    let topOffset = 20;
    let leftOffset = 10;
    let tooltipText = '';
    tooltipText = ev.clientX + ', ' + ev.clientY;
    lastMouseLocationEv = ev;
    if (x !== xDoc || y !== yDoc) {
      tooltipText = xDoc + ', ' + yDoc + ' (' + ev.clientX + ', ' + ev.clientY + ')';
    }
    if (doScreenCoordinates) {
      tooltipText += ' [' + ev.screenX + ', ' + ev.screenY + ']';
    }
    elt.textContent = tooltipText;
    let rect = elt.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
    if (y + topOffset + height > window.innerHeight) {
      topOffset = -height; // flip
    }
    if (x + leftOffset + width > window.innerWidth) {
      leftOffset = -1 * leftOffset - width;
    }
    setStyleProp(elt, {
      // left: xDoc + leftOffset + 'px',
      // top: yDoc + topOffset + 'px'
      left: x + leftOffset + 'px',
      top: y + topOffset + 'px'
    });
    if (isWidthOn) {
      let w = (x - rectInitCornerPos.x);
      let h = (y - rectInitCornerPos.y);
      let xAreaMeas = rectInitCornerPos.x;
      let yAreaMeas = rectInitCornerPos.y;
      if (x < rectInitCornerPos.x) {
        xAreaMeas = x;
        w = rectInitCornerPos.x - x;
      }
      if (y < rectInitCornerPos.y) {
        yAreaMeas = y;
        h = rectInitCornerPos.y - y;
      }
      measureEltTxt.textContent = w + 'x' + h;
      let textRect = measureEltTxt.getBoundingClientRect();
      // console.log(w + ', ' + h)
      let fontSize = 12;
      if ((w < textRect.width && w < 32) || (h < textRect.height && h < 14)) {
        if (yAreaMeas < h + textRect.height) {
          // too close to the top, cant move to the top
          setStyleProp(measureEltTxt, {
            position: 'relative',
            left: 34 / 2 + 'px',
            top: '0px'
          });
        } else {
          setStyleProp(measureEltTxt, {
            position: 'relative',
            top: -fontSize - 4 + 'px',
            left: '-3px'
          });
        }
        if (xAreaMeas > window.innerHeight - 42) {
          // too close to the right, go left
          setStyleProp(measureEltTxt, {
            position: 'relative',
            left: '-42px',
            top: '0px'
          });
        } else {
          setStyleProp(measureEltTxt, {
            position: 'relative',
            left: '0px'
          });
        }
        setStyleProp(measureEltTxt, {
          backgroundColor: 'rgba(255,255,255,0.9)'
        });
        setStyleProp(measureElt, {
          display: 'block'
        });
      } else {
        setStyleProp(measureElt, {
          display: 'flex'
        });
        setStyleProp(measureEltTxt, {
          top: '0px',
          left: '0px',
          backgroundColor: 'transparent'
        });
      }
      setStyleProp(measureElt, {
        width: w + 'px',
        height: h + 'px',
        left: xAreaMeas + 'px',
        top: yAreaMeas + 'px',
        fontSize: fontSize + 'px'
      });
    }
  };
  let measuringArea = false;
  const SIZE_KEY_CODE = 16; // shift
  const showWidthOn = (ev) => {
    if (measuringArea) {
      return;
    }
    measuringArea = true;
    if (measureArea) {
      if ((ev && ev.keyCode === SIZE_KEY_CODE) || triggeringWithMouse) {
        isWidthOn = true;
        if (lastMouseLocationEv) {
          rectInitCornerPos.x = lastMouseLocationEv.clientX;
          rectInitCornerPos.y = lastMouseLocationEv.clientY;
        }
      }
    }
  };
  const showWidthOff = (ev, force) => {
    measuringArea = false;
    if ((ev && ev.keyCode === SIZE_KEY_CODE) || triggeringWithMouse || force) {
      isWidthOn = false;
      setStyleProp(measureElt, {
        display: 'none',
        width: '0px',
        height: '0px'
      });
    }
  };
  const setOptions = (opts) => {
    measureArea = opts.measureArea;
    document.removeEventListener('keydown', showWidthOn);
    document.removeEventListener('mousedown', showWidthOn);
    document.removeEventListener('mouseup', showWidthOff);
    document.removeEventListener('keyup', showWidthOff);
    measureArea = opts.measureArea;
    doScreenCoordinates = opts.doScreenCoordinates;

    if (measureArea) {
      if (opts.trigger === 'MOUSE') {
        triggeringWithMouse = true;
        document.addEventListener('mousedown', showWidthOn);
        document.addEventListener('mouseup', showWidthOff);
      }
      if (opts.trigger === 'KEYBOARD') {
        triggeringWithMouse = false;
        document.addEventListener('keydown', showWidthOn);
        document.addEventListener('keyup', showWidthOff);
      }
    } else {
      showWidthOff(null, true);
    }
    showPosition();
  };
  showWidthOff(null, true);

  document.addEventListener('mousemove', showPosition, true);
  document.addEventListener('mousedown', showWidthOn, true);
  document.addEventListener('mouseup', showWidthOff);
  if (window.mousepositionOptionsPage) {
    window.mousepositionOptionsPage.pubsub.sub('optionsChanged', setOptions);
    window.mousepositionOptionsPage.optionsPromise.then(function (opts) {
      setOptions(opts);
    });
    isOn = true;
    toggle(isOn);
  }
}(this));
