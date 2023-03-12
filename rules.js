const rules = [
  {
    selector: "#app>div>div:last-child",
    action: { display: "none" },
  },
  {
    selector: "#app>div>div:first-child>div:last-child",
    action: { display: "none" },
  },
  {
    selector: "#app>div>div:first-child",
    action: { "overflow-y": "scroll" },
  },
  {
    selector: ".css-mcm29f",
    action: { position: "initial", overflow: "initial" },
  },
  {
    selector: "#site-content",
    action: { position: "initial !important" },
  },
];
