let transactionType = "leasehold";
let instructionPeriod = "after";

// ------------------------------
// Working Days (Mon–Fri only)
// ------------------------------
function workingDaysBetween(start, end) {
  let count = 0;
  const d = new Date(start);

  while (d <= end) {
    const day = d.getDay();

    if (day !== 0 && day !== 6) {
      count++;
    }

    d.setDate(d.getDate() + 1);
  }

  return count;
}

// ------------------------------
// Add Working Days
// ------------------------------
function addWorkingDays(startDate, workingDaysToAdd) {
  const date = new Date(startDate);

  let daysAdded = 0;

  while (daysAdded < workingDaysToAdd) {
    date.setDate(date.getDate() + 1);

    const day = date.getDay();

    if (day !== 0 && day !== 6) {
      daysAdded++;
    }
  }

  return date;
}

// ------------------------------
// Format Date
// ------------------------------
function formatDate(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ------------------------------
// SLA Matrix
// ------------------------------
const slaMatrix = {
  before: {
    leasehold: 40,
    freehold: 25
  },

  after: {
    leasehold: 45,
    freehold: 35
  }
};

// ------------------------------
// Auto Update Clock Stop Date
// ------------------------------
function updateClockStopDate() {
  const startVal =
    document.getElementById("startDate").value;

  if (!startVal) {
    document.getElementById("clockStopDate").innerText = "–";
    return;
  }

  const start = new Date(startVal);

  const manualDeduct =
    Number(document.getElementById("manualDeductDays").value) || 0;

  const sla =
    slaMatrix[instructionPeriod][transactionType];

  const stopTargetDays =
    sla + manualDeduct;

  const clockStopDate =
    addWorkingDays(start, stopTargetDays - 1);

  document.getElementById("clockStopDate").innerText =
    formatDate(clockStopDate);
}

// ------------------------------
// Transaction Type Selector
// ------------------------------
document.querySelectorAll(".segment.type").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".segment.type")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    transactionType = btn.dataset.type;

    updateClockStopDate();
  });
});

// ------------------------------
// Instruction Period Selector
// ------------------------------
document.querySelectorAll(".segment.instruction").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".segment.instruction")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    instructionPeriod = btn.dataset.period;

    updateClockStopDate();
  });
});

// ------------------------------
// Auto Update Events
// ------------------------------
document
  .getElementById("startDate")
  .addEventListener("change", updateClockStopDate);

document
  .getElementById("manualDeductDays")
  .addEventListener("input", updateClockStopDate);

// ------------------------------
// Main Calculation Function
// ------------------------------
function calculate() {
  const startVal = startDate.value;
  const stopVal = stopDate.value;
  const quotedFee = Number(fastFee.value);
  const manualDeduct = Number(manualDeductDays.value) || 0;

  if (!startVal || quotedFee <= 0) {
    alert("Clock Start Date and Quoted Fast Fee are required");
    return;
  }

  const start = new Date(startVal);
  const stop = stopVal ? new Date(stopVal) : new Date();

  const workingDays =
    workingDaysBetween(start, stop);

  const adjustedWorkingDays =
    Math.max(0, workingDays - manualDeduct);

  const workingWeeks =
    Math.floor(adjustedWorkingDays / 5);

  const sla =
    slaMatrix[instructionPeriod][transactionType];

  const stopTargetDays =
    sla + manualDeduct;

  const clockStopDate =
    addWorkingDays(start, stopTargetDays - 1);

  const overdueDays =
    Math.max(0, adjustedWorkingDays - sla);

  const overdueWeeks =
    Math.floor(overdueDays / 5);

  const deductionRate =
    instructionPeriod === "after"
      ? 150
      : 100;

  const deduction =
    overdueWeeks * deductionRate;

  const finalFee =
    Math.max(0, quotedFee - deduction);

  document.getElementById("workingDays").innerText =
    adjustedWorkingDays;

  document.getElementById("workingWeeks").innerText =
    workingWeeks;

  document.getElementById("clockStopDate").innerText =
    formatDate(clockStopDate);

  document.getElementById("slaLimit").innerText =
    `${sla} Days`;

  document.getElementById("deduction").innerText =
    `£${deduction}`;

  document.getElementById("finalFee").innerText =
    `£${finalFee}`;
}

// ------------------------------
// Export PDF
// ------------------------------
function exportPDF() {
  const element = document.getElementById("pdfArea");

  const opt = {
    margin: 0.2,

    filename: "Fast_Fee_Calculation.pdf",

    image: {
      type: "jpeg",
      quality: 1
    },

    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0
    },

    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save();
}
