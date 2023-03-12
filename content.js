const OVERLAY_DETECTION_ATTEMPTS = 100;
let timeInterval;
let styleElement;

const actions = {
  hide: "hide",
  scroll: "scroll",
};

const rules = [
  {
    selector: "#app>div>div:last-child",
    actions: [actions.hide],
    prime: true,
  },
  {
    selector: "#app>div>div:first-child>div:last-child",
    actions: [actions.hide],
  },
  {
    selector: "#app>div>div:first-child",
    actions: [actions.scroll],
  },
];

function detectBlockerOverlay() {
  const primeSelector = rules.filter((rule) => rule.prime)[0].selector;
  const primeElement = document.querySelector(primeSelector);

  return primeElement instanceof Element;
}

function runSelectorHandler(selectors, rule) {
  selectors.forEach(function (selector) {
    const element = document.querySelector(selector);

    if (element instanceof Element) {
      rule(element);
    }
  });
}

function getSelectorsByAction(action) {
  return rules
    .filter((rule) => rule.actions.includes(action))
    .map((rule) => rule.selector);
}

function addCSSRules() {
  const styleElementSelector = getSelectorsByAction(actions.hide).join(",");
  const styleElementRules = "{opacity:0;display:none;}";
  const styleElementContent = styleElementSelector + styleElementRules;

  styleElement = document.createElement("style");
  styleElement.innerText = styleElementContent;
  document.body.appendChild(styleElement);
}

function removeCSSRules() {
  if (styleElement instanceof Element) {
    styleElement.remove();
  }
}

function clearBlockers() {
  runSelectorHandler(getSelectorsByAction(actions.hide), ({ style }) => {
    style.display = "none";
  });

  runSelectorHandler(getSelectorsByAction(actions.scroll), ({ style }) => {
    style.overflowY = "scroll";
  });
}

function restoreBlockers() {
  runSelectorHandler(getSelectorsByAction(actions.hide), ({ style }) => {
    style.display = null;
  });

  runSelectorHandler(getSelectorsByAction(actions.scroll), ({ style }) => {
    style.overflowY = null;
  });
}

async function getIsActiveState() {
  const { isActiveState } = await chrome.storage.local.get("isActiveState");

  return isActiveState !== undefined ? isActiveState : true;
}

function findBlockersAndClear() {
  // Add opacity for overlay before it appears
  // If it doesn't appear, the rules will be removed after max overlay detection attempts are reached
  // This script doesn't have to wait until the overlay appears unlike clearBlockers()
  addCSSRules();
  let iteration = 0;

  timeInterval = setInterval(() => {
    // Looking for the main authorization element on the page
    const overlay = detectBlockerOverlay();

    if (++iteration > OVERLAY_DETECTION_ATTEMPTS) {
      clearInterval(timeInterval);
      removeCSSRules();
    }

    if (overlay) {
      clearInterval(timeInterval);
      // Running the main cleaning function
      // It uses inline styles and guaranteed cleanup unlike addCSSRules()
      clearBlockers();
    }
  }, 100);
}

// Listen to changes of global state
// The global state is needed to control whether the extension enabled or disabled
chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local" && changes.isActiveState) {
    if (changes.isActiveState.newValue) {
      findBlockersAndClear();
    } else {
      // Clearing all traces of the extension work if users has disabled it
      clearInterval(timeInterval);
      removeCSSRules();
      restoreBlockers();
    }
  }
});

(async function () {
  // Get the initial state of the extension
  const isActiveState = await getIsActiveState();

  // Extension could be disabled before opening a target page
  // Do nothing in this case
  if (!isActiveState) {
    return;
  }

  findBlockersAndClear();
})();
