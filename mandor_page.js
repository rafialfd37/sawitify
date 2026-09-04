function openModal(id) {
  document.getElementById(id).classList.add("show");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

function closeOutside(event, id) {
  if (event.target.id === id) {
    closeModal(id);
  }
}

let allAncak = [];
async function openDetail(date) {
  const token = localStorage.getItem("token");

  document.getElementById("detailDate").textContent = date;

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      refer: "assignment-detail",
      tanggal: date,
    }),
  });

  const result = await response.json();

  renderAssignmentDetail(result);

  openModal("detailModal");
}

function addWorker() {
  const container = document.getElementById("workerForms");

  const workerCount = container.children.length + 1;

  const id = Date.now();

  const worker = document.createElement("div");

  worker.className = "worker-form";

  worker.innerHTML = `

        <div class="worker-form-header">

          <strong>
            Pemanen ${workerCount}
          </strong>

          <button
            class="btn-remove-worker"
            onclick="removeWorker(this)"
            type="button"
          >
            ×
          </button>

        </div>


        <div class="worker-select">

          <label>
            Pemanen
          </label>

<select class="worker-select-input">
  <option value="">-- Pilih Pemanen --</option>

  ${pemanenData
    .map(
      (pemanen) => `
    <option value="${pemanen.id_pemanen}">
      ${pemanen.nama}
    </option>
  `,
    )
    .join("")}

</select>

        </div>


        <div>

          <div class="ancak-select-title">
            Pilih Ancak
          </div>
    <div class="ancak-options">
            ${ancakData
              .map(
                (ancak) => `
    <div class="ancak-option">
      <input
        type="checkbox"
        id="${id}-${ancak.kode_ancak}"
        value="${ancak.kode_ancak}"
      />

      <label for="${id}-${ancak.kode_ancak}">
        ${ancak.kode_ancak}
      </label>
    </div>
  `,
              )
              .join("")}

        </div>

      `;

  container.appendChild(worker);
}

function removeWorker(button) {
  const container = document.getElementById("workerForms");

  if (container.children.length <= 1) {
    return;
  }

  button.closest(".worker-form").remove();
}

async function submitAssignment() {
  const token = localStorage.getItem("token");

  const forms = document.querySelectorAll(".worker-form");

  const pemanen = [];

  forms.forEach((form) => {
    const select = form.querySelector(".worker-select-input");

    const checkboxes = form.querySelectorAll(
      '.ancak-option input[type="checkbox"]:checked',
    );

    const ancak = Array.from(checkboxes).map((checkbox) => checkbox.value);

    if (select.value && ancak.length > 0) {
      pemanen.push({
        id_pemanen: select.value,
        ancak: ancak,
      });
    }
  });

  const data = {
    tanggal: document.getElementById("assignmentDate").value,
    pemanen: pemanen,
  };

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      refer: "assignment",
      data: data,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    alert(result.message || "Gagal menyimpan penugasan");
    return;
  }

  alert("Penugasan berhasil disimpan.");

  closeModal("addModal");
}

async function auth() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/";
    return;
  }

  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      refer: "AUTH",
    }),
  });

  const result = await response.json();

  if (result.role !== "mandor") {
    localStorage.removeItem("token");
    window.location.href = `/`;
  }
}

async function getMandor() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      refer: "name",
    }),
  });

  const result = await response.json();

  document.getElementById("mandor-name").innerHTML = result.name;
}

let pemanenData = [];
async function getPemanen() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      refer: "pemanen",
    }),
  });

  const result = await response.json();
  pemanenData = result;

  document.getElementById("worker-select").innerHTML =
    `<option value="">-- Pilih Pemanen --</option>`;

  result.forEach((pemanen) => {
    document.getElementById("worker-select").innerHTML +=
      `<option value="${pemanen.id_pemanen}">${pemanen.nama}</option>
`;
  });
}

let ancakData = [];
async function getAncak() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      refer: "ancak",
    }),
  });

  const result = await response.json();
  ancakData = result;

  result.forEach((ancak) => {
    document.getElementById("ancak-options").innerHTML += `
    <div class="ancak-option">
      <input
        type="checkbox"
        id="${ancak.kode_ancak}"
        value="${ancak.kode_ancak}"
      />

      <label for="${ancak.kode_ancak}">
        ${ancak.kode_ancak}
      </label>
    </div>
  `;
  });
}

async function getAssignmentList() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: token,
      refer: "assignment-list",
    }),
  });

  const result = await response.json();

  const container = document.getElementById("assignment-list");

  container.innerHTML = result
    .map((assignment) => {
      const date = new Date(assignment.tanggal);

      const formattedDate = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return `
        <div
          class="assignment-card"
          onclick="openDetail('${assignment.tanggal}')"
        >

          <div class="assignment-top">

            <div class="date-icon">
              📋
            </div>

            <span class="assignment-date">
              ${formattedDate}
            </span>

          </div>

          <h3>
            Penugasan Ancak
          </h3>

          <p>
            ${assignment.jumlah_pemanen} pemanen mendapatkan penugasan
          </p>

          <div class="assignment-summary">

            <div class="summary-item">
              <span>Pemanen</span>
              <strong>
                ${assignment.jumlah_pemanen} orang
              </strong>
            </div>

            <div class="summary-item">
              <span>Buah</span>
              <strong>
                ${Number(assignment.total_buah).toLocaleString("id-ID")} tandan
              </strong>
            </div>

            <div class="summary-item">
              <span>Brondol</span>
              <strong>
                ${Number(assignment.total_brondol).toLocaleString("id-ID")} ember
              </strong>
            </div>

          </div>

          <div class="assignment-footer">

            <span>
              Lihat detail
            </span>

            <span>
              →
            </span>

          </div>

        </div>
      `;
    })
    .join("");
}

function renderAssignmentDetail(data) {
  const container = document.getElementById("assignment-detail");

  container.innerHTML = data
    .map((worker) => {
      const initial = worker.nama_pemanen.charAt(0).toUpperCase();

      let statusClass = "pending";
      let statusText = "Belum Mulai";

      if (worker.status === "Selesai") {
        statusClass = "done";
        statusText = "Selesai";
      } else if (worker.status === "Berlangsung") {
        statusClass = "progress";
        statusText = "Berlangsung";
      }

      const ancakHTML = worker.ancak
        .map((ancak) => {
          const fotoHTML =
            ancak.foto && ancak.foto.length > 0
              ? `
                <div class="photo-grid">
                  ${ancak.foto
                    .map(
                      (foto) => `
                        <img
                          src="${foto.url}"
                          alt="Bukti Panen"
                          class="photo-thumb"
                          onclick="window.open('${foto.url}','_blank')"
                        >
                      `,
                    )
                    .join("")}
                </div>
              `
              : `<div class="no-photo">Belum ada foto bukti.</div>`;

          return `
          <div class="ancak-detail">

            <div class="ancak-detail-header">
              <span class="ancak">${ancak.kode_ancak}</span>
            </div>

            <div class="ancak-detail-data">

              <div class="data-box">
                <span>Jumlah Buah</span>
                <strong>${Number(ancak.jumlah_buah).toLocaleString("id-ID")} tandan</strong>
              </div>

              <div class="data-box">
                <span>Jumlah Brondol</span>
                <strong>${Number(ancak.jumlah_brondol).toLocaleString("id-ID")} ember</strong>
              </div>

            </div>

            ${
              ancak.catatan
                ? `
                <div class="catatan-box">
                  <span>Catatan</span>
                  <p>${ancak.catatan}</p>
                </div>
              `
                : ""
            }

            <div class="foto-section">
              <span>Foto Bukti Panen</span>
              ${fotoHTML}
            </div>

          </div>
        `;
        })
        .join("");

      return `
      <div class="worker-card">

        <div class="worker-header">

          <div class="worker-avatar">${initial}</div>

          <div class="worker-name">
            <strong>${worker.nama_pemanen}</strong>
            <span>Pemanen</span>
          </div>

          <span class="status ${statusClass}">
            ${statusText}
          </span>

        </div>

        <div class="worker-data">

          <div class="data-box">
            <span>Total Buah</span>
            <strong>${Number(worker.jumlah_buah).toLocaleString("id-ID")} tandan</strong>
          </div>

          <div class="data-box">
            <span>Total Brondol</span>
            <strong>${Number(worker.jumlah_brondol).toLocaleString("id-ID")} ember</strong>
          </div>

        </div>

        <div class="ancak-section">

          <span class="ancak-section-title">
            DETAIL ANCAK
          </span>

          <div class="ancak-detail-list">
            ${ancakHTML}
          </div>

        </div>

        <div class="action-buttons">

          <button
            class="btn-edit"
            onclick="openEditAssignment(${worker.id_aktivitas})"
          >
            ✏️ Edit
          </button>

          <button
            class="btn-delete"
            onclick="deleteAssignment(${worker.id_aktivitas})"
          >
            🗑️ Hapus
          </button>

        </div>

      </div>
    `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("performanceMonth").value = new Date()
    .toISOString()
    .slice(0, 7);

  loadPerformanceWorkers();

  getPerformance();

  getMonthlyReport();
});

async function getPerformance() {
  const token = localStorage.getItem("token");
  const bulan = document.getElementById("performanceMonth").value;
  const id_pemanen = document.getElementById("performanceWorker").value;

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "performance",
      bulan,
      id_pemanen,
    }),
  });

  const result = await response.json();

  document.getElementById("summaryBuah").textContent =
    `${result.summary.total_buah} tandan`;

  document.getElementById("summaryBrondol").textContent =
    `${result.summary.total_brondol} ember`;

  document.getElementById("summaryHari").textContent =
    `${result.summary.total_hari} hari`;

  const body = document.getElementById("performanceBody");
  body.innerHTML = "";

  result.workers.forEach((worker, index) => {
    let rankClass = "";

    if (index === 0) rankClass = "gold";
    else if (index === 1) rankClass = "silver";
    else if (index === 2) rankClass = "bronze";

    body.innerHTML += `
      <tr>
        <td class="rank ${rankClass}">${index + 1}</td>
        <td>${worker.nama}</td>
        <td>${worker.total_buah} tandan</td>
        <td>${worker.total_brondol} ember</td>
        <td>${worker.hari_kerja}</td>
      </tr>
    `;
  });
}

async function loadPerformanceWorkers() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "pemanen",
    }),
  });

  const result = await response.json();

  const select = document.getElementById("performanceWorker");

  select.innerHTML = `<option value="">Semua Pemanen</option>`;

  result.forEach((pemanen) => {
    select.innerHTML += `
      <option value="${pemanen.id_pemanen}">
        ${pemanen.nama}
      </option>`;
  });
}

async function openEditAssignment(id) {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "assignment-by-id",
      id_aktivitas: id,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    alert(result.message);
    return;
  }

  const data = result.data;

  document.getElementById("editAktivitasId").value = id;
  document.getElementById("editDate").textContent = data.tanggal;

  const worker = document.getElementById("editWorker");

  worker.innerHTML = `
    <option value="${data.id_pemanen}">
      ${data.nama_pemanen}
    </option>
  `;

  const container = document.getElementById("editAncakOptions");

  container.innerHTML = "";

  ancakData.forEach((a) => {
    const checked = data.ancak.includes(a.kode_ancak) ? "checked" : "";

    container.innerHTML += `
      <div class="ancak-option">

        <input
          type="checkbox"
          id="edit-${a.kode_ancak}"
          value="${a.kode_ancak}"
          ${checked}
        >

        <label for="edit-${a.kode_ancak}">
          ${a.kode_ancak}
        </label>

      </div>
    `;
  });

  openModal("editModal");
}

async function updateAssignment() {
  const token = localStorage.getItem("token");

  const id = document.getElementById("editAktivitasId").value;

  const ancak = [
    ...document.querySelectorAll("#editAncakOptions input:checked"),
  ].map((i) => i.value);

  const response = await fetch("/api/mandor_page", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      id_aktivitas: id,
      ancak,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    alert(result.message);
    return;
  }

  closeModal("editModal");
  getAssignment();
}

async function deleteAssignment(id) {
  if (!confirm("Hapus penugasan ini?")) return;

  const token = localStorage.getItem("token");

  const response = await fetch("/api/mandor_page", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      id_aktivitas: id,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    alert(result.message);
    return;
  }

  getAssignment();
}

async function openMonthlyReport() {
  const token = localStorage.getItem("token");
  const bulan = document.getElementById("performanceMonth").value;

  const response = await fetch("/api/mandor_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "monthly-report",
      bulan,
    }),
  });

  const result = await response.json();
  const s = result.summary || {};

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Bulanan Sawitify</title>
      <style>
        body{
          font-family: Arial,sans-serif;
          margin:30px;
          color:#333;
        }
        h1{
          color:#2e7d32;
          margin-bottom:5px;
        }
        table{
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        }
        th,td{
          border:1px solid #ccc;
          padding:8px;
          text-align:left;
        }
        th{
          background:#f3f3f3;
        }
        .summary{
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:12px;
          margin:20px 0;
        }
        .card{
          border:1px solid #ddd;
          padding:12px;
          border-radius:8px;
        }
        .signature{
          width:220px;
          margin-left:auto;
          margin-top:50px;
          text-align:center;
        }
        .line{
          border-top:2px solid #333;
          margin-top:60px;
          margin-bottom:8px;
        }
      </style>
    </head>
    <body>

      <h1>Sawitify</h1>
      <h3>Laporan Bulanan Mandor</h3>

      <p><strong>Periode:</strong> ${bulan}</p>
      <p><strong>Mandor:</strong> ${s.nama_mandor || "-"}</p>
      <p><strong>Divisi:</strong> ${s.divisi || "-"}</p>

      <div class="summary">
        <div class="card">
          <strong>Total Buah</strong><br>
          ${Number(s.total_buah || 0).toLocaleString("id-ID")} tandan
        </div>
        <div class="card">
          <strong>Total Brondol</strong><br>
          ${Number(s.total_brondol || 0).toLocaleString("id-ID")} ember
        </div>
        <div class="card">
          <strong>Pemanen Aktif</strong><br>
          ${s.total_pemanen || 0}
        </div>
        <div class="card">
          <strong>Ancak Selesai</strong><br>
          ${s.total_ancak || 0}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Pemanen</th>
            <th>Buah</th>
            <th>Brondol</th>
          </tr>
        </thead>
        <tbody>
          ${result.days
            .map(
              (day) => `
            <tr>
              <td>${day.tanggal}</td>
              <td>${day.jumlah_pemanen}</td>
              <td>${Number(day.total_buah).toLocaleString("id-ID")}</td>
              <td>${Number(day.total_brondol).toLocaleString("id-ID")}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <div class="signature">
        <p>Mengetahui,</p>
        <div class="line"></div>
        <strong>${s.nama_mandor || "-"}</strong><br>
        Mandor
      </div>

    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 300);
}

function logout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
}

auth();
getMandor();
getPemanen();
getAncak();
getAssignmentList();
getPerformance();
