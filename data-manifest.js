window.MANIFEST = {
  javascript: {
    key: "javascript",
    title: "JavaScript",
    unitLabel: "المستوى",
    accentVar: "--accent-js",
    ids: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    fileFor: function (id) {
      return "level" + id + ".js";
    }
  },
  python: {
    key: "python",
    title: "Python",
    unitLabel: "الفصل",
    accentVar: "--accent-py",
    ids: Array.from({ length: 25 }, function (_, i) { return i + 1; }),
    fileFor: function (id) {
      var padded = id < 10 ? "0" + id : "" + id;
      return "chapter" + padded + ".js";
    }
  }
};
