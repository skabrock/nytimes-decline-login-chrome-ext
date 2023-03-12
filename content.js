const OVERLAY_DETECTION_ATTEMPTS = 100;

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

function init() {
  const iteration = 0;

  const timeInterval = setInterval(function () {
    const overlay = detectBlockerOverlay();

    if (overlay || ++iteration > OVERLAY_DETECTION_ATTEMPTS) {
      clearInterval(timeInterval);
    }

    if (overlay) {
      clearBlockers();
    }
  }, 100);
}

window.onload = init;
