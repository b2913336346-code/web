(function () {
  const display = document.getElementById("display");
  const keys = document.querySelector(".keys");

  let current = "0";
  let previous = null;
  let operator = null;
  let overwrite = false;

  function updateDisplay() {
    const text = formatNumber(current);
    display.textContent = text;
    display.style.fontSize = text.length > 12 ? "1.45rem" : "";
  }

  function formatNumber(value) {
    if (value === "错误") return value;
    if (value.includes("e") || value.includes("E")) return value;

    const negative = value.startsWith("-");
    const raw = negative ? value.slice(1) : value;
    const [intPart, decPart] = raw.split(".");
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    let result = (negative ? "-" : "") + withCommas;
    if (decPart !== undefined) result += "." + decPart;
    return result;
  }

  function inputDigit(digit) {
    if (overwrite) {
      current = digit;
      overwrite = false;
      return;
    }
    if (current === "0" && digit !== "0") {
      current = digit;
      return;
    }
    if (current === "0" && digit === "0") return;
    if (current.replace("-", "").replace(".", "").length >= 12) return;
    current += digit;
  }

  function inputDecimal() {
    if (overwrite) {
      current = "0.";
      overwrite = false;
      return;
    }
    if (!current.includes(".")) current += ".";
  }

  function clearAll() {
    current = "0";
    previous = null;
    operator = null;
    overwrite = false;
    setActiveOperator(null);
  }

  function toggleSign() {
    if (current === "0" || current === "错误") return;
    current = current.startsWith("-") ? current.slice(1) : "-" + current;
  }

  function percent() {
    const num = parseFloat(current);
    if (Number.isNaN(num)) return;
    current = String(round(num / 100));
    overwrite = true;
  }

  function setOperator(nextOp) {
    if (operator && !overwrite && previous !== null) {
      const result = calculate(previous, current, operator);
      current = result;
      previous = result === "错误" ? null : result;
    } else {
      previous = current;
    }
    operator = nextOp;
    overwrite = true;
    setActiveOperator(nextOp);
    updateDisplay();
  }

  function equals() {
    if (operator === null || previous === null) return;
    current = calculate(previous, current, operator);
    previous = null;
    operator = null;
    overwrite = true;
    setActiveOperator(null);
  }

  function calculate(a, b, op) {
    const x = parseFloat(a);
    const y = parseFloat(b);
    if (Number.isNaN(x) || Number.isNaN(y)) return "错误";

    let result;
    switch (op) {
      case "+":
        result = x + y;
        break;
      case "-":
        result = x - y;
        break;
      case "*":
        result = x * y;
        break;
      case "/":
        if (y === 0) return "错误";
        result = x / y;
        break;
      default:
        return b;
    }

    if (!Number.isFinite(result)) return "错误";
    return String(round(result));
  }

  function round(num) {
    return Math.round(num * 1e10) / 1e10;
  }

  function setActiveOperator(op) {
    keys.querySelectorAll(".key-op").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.value === op);
    });
  }

  keys.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const { action, value } = button.dataset;

    switch (action) {
      case "digit":
        inputDigit(value);
        break;
      case "decimal":
        inputDecimal();
        break;
      case "clear":
        clearAll();
        break;
      case "sign":
        toggleSign();
        break;
      case "percent":
        percent();
        break;
      case "operator":
        setOperator(value);
        return;
      case "equals":
        equals();
        break;
      default:
        break;
    }

    updateDisplay();
  });

  document.addEventListener("keydown", (event) => {
    const { key } = event;

    if (/\d/.test(key)) {
      inputDigit(key);
      updateDisplay();
      return;
    }

    if (key === ".") {
      inputDecimal();
      updateDisplay();
      return;
    }

    if (key === "+" || key === "-" || key === "*" || key === "/") {
      event.preventDefault();
      setOperator(key);
      return;
    }

    if (key === "Enter" || key === "=") {
      event.preventDefault();
      equals();
      updateDisplay();
      return;
    }

    if (key === "Escape" || key === "c" || key === "C") {
      clearAll();
      updateDisplay();
      return;
    }

    if (key === "%") {
      percent();
      updateDisplay();
    }

    if (key === "Backspace" && !overwrite) {
      current = current.length <= 1 || (current.length === 2 && current.startsWith("-"))
        ? "0"
        : current.slice(0, -1);
      updateDisplay();
    }
  });

  updateDisplay();
})();
