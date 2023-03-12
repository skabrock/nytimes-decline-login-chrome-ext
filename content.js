const OVERLAY_DETECTION_ATTEMPTS = 100;
let timeInterval;

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

function clearBlockers() {
  // hide elements
  runSelectorHandler(getSelectorsByAction(actions.hide), ({ style }) => {
    style.display = "none";
  });

  // enable scroll
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

function init() {
  const iteration = 0;

  timeInterval = setInterval(() => {
    const overlay = detectBlockerOverlay();

    if (overlay || ++iteration > OVERLAY_DETECTION_ATTEMPTS) {
      clearInterval(timeInterval);
    }

    if (overlay) {
      clearBlockers();
    }
  }, 100);
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local" && changes.isActiveState) {
    if (changes.isActiveState.newValue) {
      init();
    } else {
      clearInterval(timeInterval);
      restoreBlockers();
    }
  }
});

window.onload = async function () {
  const isActiveState = await getIsActiveState();

  if (!isActiveState) {
    return;
  }

  init();
};
