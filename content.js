const OVERLAY_DETECTION_ATTEMPTS = 100;
let overlayDetectionInterval;
let styleElement;
let isPageLoaded = false;

function detectBlockerOverlay() {
  const primeSelector = rules.filter((rule) => rule.prime)[0].selector;
  const primeElement = document.querySelector(primeSelector);

  return primeElement instanceof Element;
}

function addCSSRules() {
  const styleElementContent = rules.reduce((css, rule) => {
    css +=
      rule.selector +
      JSON.stringify(rule.action)
        .replaceAll('"', "")
        .replaceAll(",", ";")
        .replaceAll("}", ";}");

    return css;
  }, "");

  styleElement = document.createElement("style");
  styleElement.innerText = styleElementContent;
  document.head.appendChild(styleElement);
}

function removeCSSRules() {
  if (styleElement instanceof Element) {
    styleElement.remove();
  }
}

function camelize(string) {
  return string.replace(/-./g, (x) => x[1].toUpperCase());
}

function updateBlockers(value) {
  const inlineRules = rules.filter((rule) => rule.inline);

  inlineRules.forEach(({ selector, action }) => {
    const element = document.querySelector(selector);

    if (element instanceof Element) {
      Object.keys(action).forEach((cssProperty) => {
        const inlineProperty = camelize(cssProperty);
        const inlineValue = value !== undefined ? value : action[cssProperty];

        element.style[inlineProperty] = inlineValue;
      });
    }
  });
}

function restoreBlockers() {
  updateBlockers(null);
}

async function getIsActiveState() {
  const { isActiveState } = await chrome.storage.local.get("isActiveState");

  return isActiveState !== undefined ? isActiveState : true;
}

function findBlockersAndClear() {
  let iteration = 0;

  overlayDetectionInterval = setInterval(() => {
    // Looking for the main authorization element on the page
    const overlay = detectBlockerOverlay();

    if (++iteration > OVERLAY_DETECTION_ATTEMPTS) {
      clearInterval(overlayDetectionInterval);
      removeCSSRules();
    }

    if (overlay) {
      clearInterval(overlayDetectionInterval);
      // Running the main cleaning function
      // It uses inline styles and guaranteed cleanup unlike addCSSRules()
    }
  }, 100);
}

// Listening for changes of global state
// The global state is needed to control whether the extension enabled or disabled
chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local" && changes.isActiveState) {
    if (changes.isActiveState.newValue) {
      findBlockersAndClear();
    } else {
      // Clearing all traces of the extension work if users has disabled it
      clearInterval(overlayDetectionInterval);
      removeCSSRules();
      restoreBlockers();
    }
  }
});

(async function () {
  // Add opacity for overlay before it appears
  // If it doesn't appear, the rules will be removed after max overlay detection attempts are reached
  // This script doesn't have to wait until the overlay appears unlike updateBlockers()
  addCSSRules();

  window.addEventListener("load", () => {
    isPageLoaded = true;
  });

  // Get the initial state of the extension
  const isActiveState = await getIsActiveState();

  // Extension could be disabled before opening a target page
  // Do nothing in this case
  if (!isActiveState) {
    removeCSSRules();
    return;
  }

  if (isPageLoaded) {
    findBlockersAndClear();
  } else {
    window.addEventListener("load", findBlockersAndClear);
  }
})();
