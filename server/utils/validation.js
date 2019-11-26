const checkDateFormat = (date) => {
  const dateArray = date.split(`.`);
  for (let i = 0; i < dateArray.length; i++) {
    switch (i) {
      case 0: if (dateArray[i].length !== 2 || isNaN(dateArray[i])) {
        return false;
      }
        break;
      case 1: if (dateArray[i].length !== 2 || isNaN(dateArray[i])) {
        return false;
      }
        break;
      case 2: if (dateArray[i].length !== 4 || isNaN(dateArray[i])) {
        return false;
      }
        break;
      default: return false;
    }
  }
  return true;
};
const number = (value) => {
  if (value !== ``) {
    if (isNaN(value)) {
      throw new Error(`Only number`);
    } else {
      return value;
    }
  } else {
    return value;
  }
};
const date = (value) => {
  if (value !== ``) {
    if (checkDateFormat(value)) {
      return value;
    } else {
      throw new Error(`Only date format dd.mm.yyyy`);
    }
  } else {
    return value;
  }
};
const entityMap = {
  "&": `&amp;`,
  "<": `&lt;`,
  ">": `&gt;`,
  '"': `&quot;`,
  "'": `&#39;`,
  "/": `&#x2F;`
};
const escape = (string) => {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
};
module.exports = (name, value) => {
  switch (name) {
    case `id`:
      value = escape(value);
      break;
    case `inn`:
      value = number(value);
      break;
    case `name`:
      value = escape(value);
      break;
    case `rtp`:
      value = number(value);
      break;
    case `tenzor`:
      value = number(value);
      break;
    case `date`:
      value = date(value);
      break;
    case `comments`:
      if (value === ``) {
        value = [];
      } else {
        for (let i = 0; i < value.length; i++) {
          value[i] = escape(value[i]);
        }
      }
      break;
    case `contacts`:
      if (value === ``) {
        value = [];
      } else {
        for (let i = 0; i < value.length; i++) {
          value[i] = JSON.parse(value[i]);
          for (let key in value[i]) {
            value[i][key] = escape(value[i][key]);
          }
          console.log(value[i]);
        }
      }
      break;
    case `links`: if (value === ``) {
      value = [];
    }
      break;
  }
  console.log(value);
  return value;
};
