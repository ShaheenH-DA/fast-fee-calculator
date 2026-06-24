let transactionType = "leasehold";
let instructionPeriod = "after"; // default = after April 27

// ------------------------------
// Transaction Type Selector
// ------------------------------
document.querySelectorAll(".segment.type").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".segment.type").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    transactionType = btn.dataset.type;
  });
});

// ------------------------------
// Instruction Period Selector
// ------------------------------
document.querySelectorAll(".segment.instruction").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".segment.instruction").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    instructionPeriod = btn.dataset.period;
  });
});

// ------------------------------
// Working Days (Mon–Fri only)
// ------------------------------
function workingDaysBetween(start, end) {
  let count = 0;
  const d = new Date(start);

  while (d <= end) {
    const day = d.getDay();

    // Exclude Saturday (6) and Sunday (0)
    if (day !== 0 && day !== 6) {
      count++;
    }

    d.setDate(d.getDate() + 1);
  }
  return count;
}

// ------------------------------
// SLA Matrix (NEW LOGIC)
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

  const workingDays = workingDaysBetween(start, stop);

  // Manual exclusion logic
  const adjustedWorkingDays = Math.max(0, workingDays - manualDeduct);

  const workingWeeks = Math.floor(adjustedWorkingDays / 5);

  // ✅ NEW SLA LOGIC
  const sla = slaMatrix[instructionPeriod][transactionType];

  const overdueDays = Math.max(0, adjustedWorkingDays - sla);
  const overdueWeeks = Math.floor(overdueDays / 5);

  const deduction = overdueWeeks * 100;
  const finalFee = Math.max(0, quotedFee - deduction);

  document.getElementById("workingDays").innerText = adjustedWorkingDays;
  document.getElementById("workingWeeks").innerText = workingWeeks;
  document.getElementById("slaLimit").innerText = `${sla} Days`;
  document.getElementById("deduction").innerText = `£${deduction}`;
  document.getElementById("finalFee").innerText = `£${finalFee}`;
}

// ------------------------------
// Export PDF
// ------------------------------


function exportPDF() {
  const element = document.getElementById("pdfArea");
  const opt = {

    margin: 0.2,
    filename: "Fast_Fee_Calculation.pdf",
    image: { type: "jpeg", quality: 1 },

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
 
  html2pdf().set(opt).from(element).save();

}
 

