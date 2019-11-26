const longValid = (number, from, to) => {
  return {
    assert(number) {
      return number >= from && number <= to;
    },
    message: `should be in range ${from}..${to}`
  };
};

const licensesSchema = {
  name: {
    require: true,
    converter(val) {
      return val.trim();
    },
    inRange: longValid(number, from, to)
  },
  reduction: {
    require: false
  },
  sum: {
    require: false
  }
};
