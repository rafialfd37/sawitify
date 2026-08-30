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

  if (result.role !== "admin") {
    localStorage.removeItem("token");
    window.location.href = `/`;
  }
}

function switchPage(pageName, element) {
  document
    .querySelectorAll(".menu-link")
    .forEach((link) => link.classList.remove("active"));
  element.classList.add("active");

  document
    .querySelectorAll(".tab-content")
    .forEach((tab) => tab.classList.remove("active-tab"));
  document.getElementById("tab-" + pageName).classList.add("active-tab");

  const titleEl = document.getElementById("headerTitle");
  const subtitleEl = document.getElementById("headerSubtitle");

  if (pageName === "dashboard") {
    titleEl.innerText = "Dashboard Admin";
    subtitleEl.innerText =
      "Ringkasan operasional dan catatan hasil panen sawit";
  } else if (pageName === "mandor") {
    titleEl.innerText = "Manajemen Mandor";
    subtitleEl.innerText = "Kelola data penanggung jawab sektor perkebunan";
    getMandor();
  } else if (pageName === "pemanen") {
    titleEl.innerText = "Manajemen Pemanen";
    subtitleEl.innerText = "Kelola data pekerja panen lapangan";
    getPemanen();
  } else if (pageName === "divisi") {
    titleEl.innerText = "Manajemen Divisi";
    subtitleEl.innerText = "Kelola data divisi";
    getDivisi();
  } else if (pageName === "petak") {
    titleEl.innerText = "Manajemen Petak Divisi";
    subtitleEl.innerText = "Kelola data petak divisi";
    getDivisiFilter();
  } else if (pageName === "ancak") {
    titleEl.innerText = "Manajemen Ancak";
    subtitleEl.innerText = "Kelola data petak ancak";
    getDivisiAncak();
  }
}

// CRUD DIVISI
function openModalDivisi() {
  document.getElementById("modalDivisi").style.display = "flex";
  document.getElementById("modalDivisi").style.alignItems = "center";
  document.getElementById("modalDivisi").style.justifyContent = "center";
}

function closeModalDivisi() {
  document.getElementById("modalDivisi").style.display = "none";
}

function openModalEditDivisi() {
  document.getElementById("modalEditDivisi").style.display = "flex";
}

function closeModalEditDivisi() {
  document.getElementById("modalEditDivisi").style.display = "none";
}

function simpanDivisi() {
  fetch("/api/divisi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("divisiID").value,
      divisi: document.getElementById("divisiNama").value,
    }),
  });
  closeModalDivisi();
  getDivisi();
}

async function getDivisi() {
  const response = await fetch("/api/divisi", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("tbody-divisi").innerHTML = "";

  result.forEach((divisi) => {
    document.getElementById("tbody-divisi").innerHTML += `
          <tr>
            <td>${divisi.id_divisi}</td>
            <td>${divisi.nama_divisi}</td>
            <td><button class="btn-update" onclick="editDivisi('${divisi.id_divisi}','${divisi.nama_divisi}')">Edit</button> <button class="btn-delete" onclick="deleteDivisi('${divisi.id_divisi}')">Hapus</button></td>
          </tr>
          `;
  });
}

async function editDivisi(id, divisi) {
  openModalEditDivisi();
  document.getElementById("editdivisiID").value = id;
  document.getElementById("editdivisiNama").value = divisi;
}

async function updateDivisi() {
  const response = await fetch("/api/divisi", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("editdivisiID").value,
      divisi: document.getElementById("editdivisiNama").value,
    }),
  });
  closeModalEditDivisi();
  getDivisi();
}

async function deleteDivisi(divisi) {
  alert("Yakin Hapus?");
  const response = await fetch("/api/divisi", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: divisi,
    }),
  });

  getDivisi();
}

// CRUD MANDOR
function openModalMandor() {
  document.getElementById("modalMandor").style.display = "flex";
  document.getElementById("modalMandor").style.alignItems = "center";
  document.getElementById("modalMandor").style.justifyContent = "center";
  getDivisiMandor();
}

function closeModalMandor() {
  document.getElementById("modalMandor").style.display = "none";
}

function openModalEditMandor() {
  document.getElementById("modalEditMandor").style.display = "flex";
  document.getElementById("modalEditMandor").style.alignItems = "center";
  document.getElementById("modalEditMandor").style.justifyContent = "center";
}

function closeModalEditMandor() {
  document.getElementById("modalEditMandor").style.display = "none";
}

async function getDivisiMandor() {
  const response = await fetch("/api/divisi", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("mandorDivisi").innerHTML =
    `<option value="">-- Pilih Divisi --</option>`;

  result.forEach((divisi) => {
    document.getElementById("mandorDivisi").innerHTML +=
      `<option value="${divisi.id_divisi}">${divisi.nama_divisi}</option>
`;
  });
}

async function getEditDivisiMandor() {
  const response = await fetch("/api/divisi", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("editmandorDivisi").innerHTML =
    `<option value="">-- Pilih Divisi --</option>`;

  result.forEach((divisi) => {
    document.getElementById("editmandorDivisi").innerHTML +=
      `<option value="${divisi.id_divisi}">${divisi.nama_divisi}</option>
`;
  });
}

async function simpanMandor() {
  await fetch("/api/mandor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("mandorID").value,
      nama: document.getElementById("mandorNama").value,
      divisi: document.getElementById("mandorDivisi").value,
      birth: document.getElementById("mandorBirth").value,
      phone: document.getElementById("mandorNumber").value,
    }),
  });
  await getMandor();
  closeModalMandor();
}

async function getMandor() {
  const response = await fetch("/api/mandor", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("tbody-mandor").innerHTML = "";

  result.forEach((mandor) => {
    document.getElementById("tbody-mandor").innerHTML += `
          <tr>
            <td>${mandor.id_mandor}</td>
            <td>${mandor.id_divisi}</td>
            <td>${mandor.nama}</td>
            <td>${mandor.tanggal_lahir.split("T")[0]}</td>
            <td>${mandor.no_hp}</td>

            <td><button class="btn-update" onclick="editMandor('${mandor.id_mandor}','${mandor.id_divisi}','${mandor.nama}','${mandor.tanggal_lahir}','${mandor.no_hp}')">Edit</button> <button class="btn-delete" onclick="deleteMandor('${mandor.id_mandor}')">Hapus</button></td>
          </tr>
          `;
  });
}

async function editMandor(id, divisi, nama, tanggal_lahir, no_hp) {
  await getEditDivisiMandor();
  openModalEditMandor();
  document.getElementById("editmandorID").value = id;
  document.getElementById("editmandorDivisi").value = divisi;
  document.getElementById("editmandorNama").value = nama;
  document.getElementById("editmandorBirth").value =
    tanggal_lahir.split("T")[0];
  document.getElementById("editmandorNumber").value = no_hp;
}

async function updateMandor() {
  const response = await fetch("/api/mandor", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("editmandorID").value,
      divisi: document.getElementById("editmandorDivisi").value,
      nama: document.getElementById("editmandorNama").value,
      tanggal_lahir: document.getElementById("editmandorBirth").value,
      no_hp: document.getElementById("editmandorNumber").value,
    }),
  });
  closeModalEditMandor();
  getMandor();
}

async function deleteMandor(mandor) {
  alert("Yakin Hapus?");
  const response = await fetch("/api/mandor", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: mandor,
    }),
  });
  await getMandor();
}

// CRUD Pemanen
function openModalPemanen() {
  document.getElementById("modalPemanen").style.display = "flex";
  document.getElementById("modalPemanen").style.alignItems = "center";
  document.getElementById("modalPemanen").style.justifyContent = "center";
  getMandorPemanen();
}

function closeModalPemanen() {
  document.getElementById("modalPemanen").style.display = "none";
}

function openModalEditPemanen() {
  document.getElementById("modalEditPemanen").style.display = "flex";
  document.getElementById("modalEditPemanen").style.alignItems = "center";
  document.getElementById("modalEditPemanen").style.justifyContent = "center";
}

function closeModalEditPemanen() {
  document.getElementById("modalEditPemanen").style.display = "none";
}

async function getMandorPemanen() {
  const response = await fetch("/api/mandor", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("pemanenMandor").innerHTML =
    `<option value="">-- Pilih Mandor --</option>`;

  result.forEach((mandor) => {
    document.getElementById("pemanenMandor").innerHTML +=
      `<option value="${mandor.id_mandor}">${mandor.nama}</option>
`;
  });
}

async function getEditPemanenMandor() {
  const response = await fetch("/api/mandor", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("editpemanenMandor").innerHTML =
    `<option value="">-- Pilih Mandor --</option>`;

  result.forEach((mandor) => {
    document.getElementById("editpemanenMandor").innerHTML +=
      `<option value="${mandor.id_mandor}">${mandor.nama}</option>
`;
  });
}

async function simpanPemanen() {
  await fetch("/api/pemanen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("pemanenID").value,
      nama: document.getElementById("pemanenNama").value,
      mandor: document.getElementById("pemanenMandor").value,
      birth: document.getElementById("pemanenBirth").value,
      phone: document.getElementById("pemanenNumber").value,
    }),
  });
  await getPemanen();
  closeModalPemanen();
}

async function getPemanen() {
  const response = await fetch("/api/pemanen", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("tbody-pemanen").innerHTML = "";

  result.forEach((pemanen) => {
    document.getElementById("tbody-pemanen").innerHTML += `
          <tr>
            <td>${pemanen.id_pemanen}</td>
            <td>${pemanen.nama}</td>
            <td>${pemanen.nama_mandor}</td>
            <td>${pemanen.nama_divisi}</td>
            <td>${pemanen.tanggal_lahir.split("T")[0]}</td>
            <td>${pemanen.no_hp}</td>

            <td><button class="btn-update" onclick="editPemanen('${pemanen.id_pemanen}','${pemanen.nama}','${pemanen.id_mandor}','${pemanen.tanggal_lahir}','${pemanen.no_hp}')">Edit</button> <button class="btn-delete" onclick="deletePemanen('${pemanen.id_pemanen}')">Hapus</button></td>
          </tr>
          `;
  });
}

async function editPemanen(id, nama, mandor, tanggal_lahir, no_hp) {
  await getEditPemanenMandor();
  openModalEditPemanen();
  document.getElementById("editpemanenID").value = id;
  document.getElementById("editpemanenMandor").value = mandor;
  document.getElementById("editpemanenNama").value = nama;
  document.getElementById("editpemanenBirth").value =
    tanggal_lahir.split("T")[0];
  document.getElementById("editpemanenNumber").value = no_hp;
}

async function updatePemanen() {
  const response = await fetch("/api/pemanen", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("editpemanenID").value,
      mandor: document.getElementById("editpemanenMandor").value,
      nama: document.getElementById("editpemanenNama").value,
      tanggal_lahir: document.getElementById("editpemanenBirth").value,
      no_hp: document.getElementById("editpemanenNumber").value,
    }),
  });
  closeModalEditPemanen();
  getPemanen();
}

async function deletePemanen(pemanen) {
  alert("Yakin Hapus?");
  const response = await fetch("/api/pemanen", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: pemanen,
    }),
  });
  await getPemanen();
}

// CRUD PETAK
async function openModalPetak() {
  await getDivisiPetak();
  document.getElementById("modalPetak").style.display = "flex";
  document.getElementById("modalPetak").style.alignItems = "center";
  document.getElementById("modalPetak").style.justifyContent = "center";
}

function closeModalPetak() {
  document.getElementById("modalPetak").style.display = "none";
}

function openModalEditPetak() {
  document.getElementById("modalEditPetak").style.display = "flex";
}

function closeModalEditPetak() {
  document.getElementById("modalEditPetak").style.display = "none";
}

async function getDivisiPetak() {
  const response = await fetch("/api/divisi", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("petakDivisiID").innerHTML =
    `<option value="">-- Pilih Divisi --</option>`;

  result.forEach((divisi) => {
    document.getElementById("petakDivisiID").innerHTML +=
      `<option value="${divisi.id_divisi}">${divisi.nama_divisi}</option>
`;
  });
}

async function getDivisiFilter() {
  const response = await fetch("/api/divisi", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("filterDivisi").innerHTML =
    `<option value="">-- Pilih Divisi --</option>`;

  result.forEach((divisi) => {
    document.getElementById("filterDivisi").innerHTML +=
      `<option value="${divisi.id_divisi}">${divisi.id_divisi} - ${divisi.nama_divisi}</option>
`;
  });
}

function simpanPetak() {
  fetch("/api/petak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "send",
      id: document.getElementById("petakDivisiID").value,
      kodePetak: `${document.getElementById("petakDivisiID").value}-${document.getElementById("petakNama").value}`,
      petak: document.getElementById("petakNama").value,
    }),
  });
  closeModalPetak();
  getPetak();
}

async function getPetak() {
  const response = await fetch("/api/petak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "list",
      divisi: document.getElementById("filterDivisi").value,
    }),
  });

  const result = await response.json();

  document.getElementById("tbody-petak").innerHTML = "";

  result.forEach((petak) => {
    document.getElementById("tbody-petak").innerHTML += `
          <tr>
            <td>${petak.id_petak}</td>
            <td>${petak.id_divisi}</td>
            <td>${petak.kode_petak}</td>
            <td><button class="btn-update" onclick="editPetak('${petak.id_petak}','${petak.kode_petak}')">Edit</button> <button class="btn-delete" onclick="deletePetak('${petak.id_petak}')">Hapus</button></td>
          </tr>
          `;
  });
}

async function editPetak(id, petak) {
  openModalEditPetak();
  document.getElementById("editpetakID").value = id;
  document.getElementById("editpetakNama").value = petak;
}

async function updatePetak() {
  const response = await fetch("/api/petak", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("editpetakID").value,
      petak: document.getElementById("editpetakNama").value,
    }),
  });
  closeModalEditPetak();
  getPetak();
}

async function deletePetak(petak) {
  alert("Yakin Hapus?");
  const response = await fetch("/api/petak", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: petak,
    }),
  });

  getPetak();
}

//CRUD ANCAK
async function openModalAncak() {
  await getDivisiAncakFilter();
  document.getElementById("modalAncak").style.display = "flex";
  document.getElementById("modalAncak").style.alignItems = "center";
  document.getElementById("modalAncak").style.justifyContent = "center";
}

function closeModalAncak() {
  document.getElementById("modalAncak").style.display = "none";
}

function openModalEditAncak() {
  document.getElementById("modalEditAncak").style.display = "flex";
}

function closeModalEditAncak() {
  document.getElementById("modalEditAncak").style.display = "none";
}

async function getDivisiAncak() {
  const response = await fetch("/api/divisi", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("filterDivisiAncak").innerHTML =
    `<option value="">-- Pilih Divisi --</option>`;

  result.forEach((divisi) => {
    document.getElementById("filterDivisiAncak").innerHTML +=
      `<option value="${divisi.id_divisi}">${divisi.nama_divisi}</option>
`;
  });
}

async function getPetakAncak() {
  const response = await fetch("/api/petak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "list",
      divisi: document.getElementById("filterDivisiAncak").value,
    }),
  });

  const result = await response.json();

  document.getElementById("filterPetakAncak").innerHTML =
    `<option value="">-- Pilih Petak --</option>`;

  result.forEach((petak) => {
    document.getElementById("filterPetakAncak").innerHTML +=
      `<option value="${petak.id_petak}">${petak.id_petak}</option>
`;
  });
}

async function getAncak() {
  const response = await fetch("/api/ancak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "list",
      petak: document.getElementById("filterPetakAncak").value,
    }),
  });

  const result = await response.json();

  document.getElementById("tbody-ancak").innerHTML = "";

  result.forEach((ancak) => {
    document.getElementById("tbody-ancak").innerHTML += `
          <tr>
            <td>${ancak.id_ancak}</td>
            <td>${ancak.id_petak}</td>
            <td>${ancak.kode_ancak}</td>

            <td><button class="btn-update" onclick="editAncak('${ancak.id_ancak}','${ancak.kode_ancak}')">Edit</button> <button class="btn-delete" onclick="deleteAncak('${ancak.id_ancak}')">Hapus</button></td>
          </tr>
          `;
  });
}

async function getDivisiAncakFilter() {
  const response = await fetch("/api/divisi", {
    method: "GET",
  });

  const result = await response.json();

  document.getElementById("ancakDivisiID").innerHTML =
    `<option value="">-- Pilih Divisi --</option>`;

  result.forEach((divisi) => {
    document.getElementById("ancakDivisiID").innerHTML +=
      `<option value="${divisi.id_divisi}">${divisi.nama_divisi}</option>
`;
  });
}

async function getPetakAncakFilter() {
  const response = await fetch("/api/petak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "list",
      divisi: document.getElementById("ancakDivisiID").value,
    }),
  });

  const result = await response.json();

  document.getElementById("ancakPetakID").innerHTML =
    `<option value="">-- Pilih Petak --</option>`;

  result.forEach((petak) => {
    document.getElementById("ancakPetakID").innerHTML +=
      `<option value="${petak.id_petak}">${petak.id_petak}</option>
`;
  });
}

function simpanAncak() {
  fetch("/api/ancak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "send",
      idAncak: `${document.getElementById("ancakPetakID").value}-${document.getElementById("ancakNama").value}`,
      idPetak: document.getElementById("ancakPetakID").value,
      kodePetak: document.getElementById("ancakNama").value,
    }),
  });
  closeModalAncak();
  getAncak();
}

async function editAncak(id, ancak) {
  openModalEditAncak();
  document.getElementById("editAncakID").value = id;
  document.getElementById("editAncakNama").value = ancak;
}

async function updateAncak() {
  const response = await fetch("/api/ancak", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: document.getElementById("editAncakID").value,
      ancak: document.getElementById("editAncakNama").value,
    }),
  });
  closeModalEditAncak();
  getAncak();
}

async function deleteAncak(ancak) {
  alert("Yakin Hapus?");
  const response = await fetch("/api/ancak", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: ancak,
    }),
  });

  getAncak();
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();

  document.getElementById("dashboardMonth").value = today
    .toISOString()
    .slice(0, 7);

  document.getElementById("dashboardDate").value = today
    .toISOString()
    .slice(0, 10);

  loadDivisions();
  getDashboardSummary();
});

// =========================
// DASHBOARD ADMIN
// =========================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dashboardMonth").value = new Date()
    .toISOString()
    .slice(0, 7);

  loadDivisions();
  getDashboardSummary();
});

// =========================
// FILTER BULAN
// =========================

function toggleDateFilter() {
  const mode = document.getElementById("dashboardMode").value;

  document.getElementById("dashboardMonth").style.display =
    mode === "month" ? "block" : "none";

  document.getElementById("dashboardDate").style.display =
    mode === "day" ? "block" : "none";
}
// =========================
// LOAD DIVISI
// =========================

async function loadDivisions() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/admin_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "divisions",
    }),
  });

  const result = await response.json();

  const select = document.getElementById("dashboardDivision");

  select.innerHTML = `<option value="">Semua Divisi</option>`;

  result.forEach((divisi) => {
    select.innerHTML += `
      <option value="${divisi.id_divisi}">
        ${divisi.id_divisi}
      </option>
    `;
  });
}

// =========================
// DASHBOARD SUMMARY
// =========================

async function getDashboardSummary() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/admin_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "dashboard_summary",
      mode: document.getElementById("dashboardMode").value,
      bulan: document.getElementById("dashboardMonth").value,
      tanggal: document.getElementById("dashboardDate").value,
      divisi: document.getElementById("dashboardDivision").value,
    }),
  });

  const result = await response.json();

  document.getElementById("totalMandor").textContent = Number(
    result.total_mandor,
  ).toLocaleString("id-ID");

  document.getElementById("totalPemanen").textContent = Number(
    result.total_pemanen,
  ).toLocaleString("id-ID");

  document.getElementById("totalBuah").textContent =
    `${Number(result.total_buah).toLocaleString("id-ID")} tandan`;

  document.getElementById("totalBrondol").textContent =
    `${Number(result.total_brondol).toLocaleString("id-ID")} ember`;
}

function togglePerformanceFilter() {
  const mode = document.getElementById("performanceMode").value;

  document.getElementById("performanceMonth").style.display =
    mode === "month" ? "block" : "none";

  document.getElementById("performanceDate").style.display =
    mode === "day" ? "block" : "none";
}

async function loadWorkers() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/admin_page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      refer: "workers",
    }),
  });

  const data = await res.json();

  const select = document.getElementById("performanceWorker");

  select.innerHTML = `<option value="">Semua Pemanen</option>`;

  data.forEach((w) => {
    select.innerHTML += `
      <option value="${w.id_pemanen}">
        ${w.nama}
      </option>`;
  });
}

async function getPerformance() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/admin_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "performance",
      mode: document.getElementById("performanceMode").value,
      bulan: document.getElementById("performanceMonth").value,
      tanggal: document.getElementById("performanceDate").value,
      pemanen: document.getElementById("performanceWorker").value,
      divisi: document.getElementById("dashboardDivision").value,
    }),
  });

  const data = await res.json();

  const body = document.getElementById("performanceBody");

  body.innerHTML = "";

  data.forEach((item, index) => {
    body.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.nama}</td>
        <td>${item.nama_mandor}</td>
        <td>${item.nama_divisi}</td>
        <td>${Number(item.total_buah).toLocaleString("id-ID")} tandan</td>
        <td>${Number(item.total_brondol).toLocaleString("id-ID")} ember</td>
        <td>${item.hari_kerja}</td>
      </tr>
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date();

  document.getElementById("performanceMonth").value = today
    .toISOString()
    .slice(0, 7);

  document.getElementById("performanceDate").value = today
    .toISOString()
    .slice(0, 10);

  loadWorkers();
  getPerformance();
});

function logout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
}

auth();
