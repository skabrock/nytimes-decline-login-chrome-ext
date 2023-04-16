let styleElement;

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

async function getIsActiveState() {
  const { isActiveState } = await chrome.storage.local.get("isActiveState");

  return isActiveState !== undefined ? isActiveState : true;
}

// Listening for changes of global state
// The global state is needed to control whether the extension enabled or disabled
chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local" && changes.isActiveState) {
    if (changes.isActiveState.newValue) {
      addCSSRules();
    } else {
      removeCSSRules();
    }
  }
});

(async function () {
  addCSSRules();

  // Get the initial state of the extension
  const isActiveState = await getIsActiveState();

  if (!isActiveState) {
    removeCSSRules();
  }
})();
