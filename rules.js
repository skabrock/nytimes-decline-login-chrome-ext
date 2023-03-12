const rules = [
  {
    selector: "#app>div>div:last-child",
    action: { display: "none" },
    prime: true,
    inline: true,
  },
  {
    selector: "#app>div>div:first-child>div:last-child",
    action: { display: "none" },
    inline: true,
  },
  {
    selector: "#app>div>div:first-child",
    action: { "overflow-y": "scroll" },
    inline: true,
  },
  {
    selector: ".css-mcm29f",
    action: { position: "initial", overflow: "initial" },
  },
];
