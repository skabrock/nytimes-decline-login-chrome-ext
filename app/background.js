const activeIconPath = chrome.runtime.getManifest().icons;

const inactiveIconPath = {
  128: "images/inactive/icon-128.png",
  64: "images/inactive/icon-64.png",
  48: "images/inactive/icon-48.png",
};

async function setIsActiveState(value) {
  await chrome.storage.local.set({ isActiveState: value });
}

async function getIsActiveState() {
  let { isActiveState } = await chrome.storage.local.get("isActiveState");

  if (isActiveState === undefined) {
    await setIsActiveState(true);
    isActiveState = true;
  }

  return isActiveState;
}

chrome.action.onClicked.addListener(async () => {
  const prevState = await getIsActiveState();
  const nextState = !prevState;
  await setIsActiveState(nextState);

  await chrome.action.setIcon({
    path: nextState ? activeIconPath : inactiveIconPath,
  });
});
