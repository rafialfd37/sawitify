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

  if (result.role !== "pemanen") {
    localStorage.removeItem("token");
    window.location.href = `/`;
  }
}

function setToday() {
  const today = document.getElementById("today");

  const date = new Date();

  today.textContent = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function getPemanen() {
  const token = localStorage.getItem("token");

  const nameElement = document.getElementById("pemanen-name");

  try {
    const response = await fetch("/api/pemanen_page", {
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

    console.log("PEMANEN NAME:", result);

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil nama pemanen");
    }

    nameElement.textContent = result.name || "Pemanen";
  } catch (error) {
    console.error("GET PEMANEN ERROR:", error);

    nameElement.textContent = "Pemanen";
  }
}

async function getAssignment() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/pemanen_page", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      token: token,

      refer: "assignment",
    }),
  });

  const result = await response.json();

  document.getElementById("loading").style.display = "none";

  if (!result.success) {
    alert(result.message || "Gagal mengambil penugasan");

    return;
  }

  if (result.data.length === 0) {
    document.getElementById("empty").style.display = "block";

    return;
  }

  renderAssignment(result.data);
}

async function getAssignmentHistory() {
  const token = localStorage.getItem("token");

  const response = await fetch("/api/pemanen_page", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      token: token,
      refer: "assignment-history",
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    return;
  }

  renderHistory(result.data);
}

function renderHistory(data) {
  const container = document.getElementById("assignment-history");

  container.innerHTML = data
    .map((item) => {
      const date = new Date(item.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return `
      <div
        class="assignment-card history-card"
        onclick="openHistoryDetail('${item.tanggal}')"
      >

        <div class="assignment-header">

          <div>
            <div class="history-date">
              ${date}
            </div>

            <div class="history-ancak-count">
              ${item.jumlah_ancak} ancak
            </div>
          </div>

          <span>
            →
          </span>

        </div>


        <div class="history-summary">

          <div class="history-summary-box">

            <span>
              Total Buah
            </span>

            <strong>
              ${Number(item.total_buah).toLocaleString("id-ID")} tandan
            </strong>

          </div>


          <div class="history-summary-box">

            <span>
              Total Brondol
            </span>

            <strong>
              ${Number(item.total_brondol).toLocaleString("id-ID")} ember
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

function renderAssignment(data) {
  const container = document.getElementById("assignment-list");

  container.innerHTML = data
    .map((item) => {
      let statusClass = "pending";
      let statusText = "Belum";

      if (item.status === "Berlangsung") {
        statusClass = "progress";
        statusText = "Berlangsung";
      }

      if (item.status === "Selesai") {
        statusClass = "done";
        statusText = "Selesai";
      }

      const previewPhotosHTML =
        item.foto && item.foto.length
          ? item.foto
              .map(
                (foto) => `
                  <img
                    src="${foto.url}"
                    onclick="window.open('${foto.url}','_blank')"
                  >
                `,
              )
              .join("")
          : "";

      return `
        <div class="assignment-card" data-id="${item.id_detail}">

          <div class="assignment-header">

            <span class="ancak-name">
              ${item.kode_ancak}
            </span>

            <span class="status ${statusClass}">
              ${statusText}
            </span>

          </div>

          <div class="result-grid">

            <div class="result-box">

              <label>Jumlah Buah (tandan)</label>

              <input
                type="number"
                min="0"
                value="${item.jumlah_buah || 0}"
                id="buah-${item.id_detail}"
              />

            </div>

            <div class="result-box">

              <label>Jumlah Brondol (ember)</label>

              <input
                type="number"
                min="0"
                value="${item.jumlah_brondol || 0}"
                id="brondol-${item.id_detail}"
              />

            </div>

          </div>

          <div class="photo-upload">

            <label>Foto Bukti Panen</label>

            <input
              type="file"
              id="harvestPhotos-${item.id_detail}"
              accept="image/*"
              multiple
              onchange="previewPhotos(${item.id_detail})"
            />

            <div
              id="photoPreview-${item.id_detail}"
              class="photo-preview"
            >
              ${previewPhotosHTML}
            </div>

          </div>

          <button
            class="btn-save"
            onclick="saveResult(${item.id_detail})"
          >
            ${item.status === "Selesai" ? "✏️ Simpan Perubahan" : "💾 Simpan Hasil"}
          </button>

        </div>
      `;
    })
    .join("");
}

async function saveResult(id_detail) {
  const token = localStorage.getItem("token");

  const buah = document.getElementById(`buah-${id_detail}`).value;

  const brondol = document.getElementById(`brondol-${id_detail}`).value;

  const photoInput = document.getElementById(`harvestPhotos-${id_detail}`);

  if (buah === "" || brondol === "") {
    alert("Jumlah buah dan brondol harus diisi.");
    return;
  }

  let photoUrls = [];

  try {
    if (photoInput.files.length > 0) {
      photoUrls = await uploadPhotos(photoInput.files);
    }
  } catch (err) {
    alert(err.message);

    return;
  }

  const response = await fetch("/api/pemanen_page", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      token,

      refer: "save-result",

      id_detail,

      jumlah_buah: Number(buah),

      jumlah_brondol: Number(brondol),

      photos: photoUrls,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    alert(result.message || "Gagal menyimpan.");

    return;
  }

  alert("Hasil panen berhasil disimpan.");

  getAssignment();

  getAssignmentHistory();

  getAnalytics();
}

async function openHistoryDetail(tanggal) {
  console.log("DETAIL TANGGAL:", tanggal);

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Token tidak ditemukan");
    return;
  }

  const modal = document.getElementById("historyModal");
  const content = document.getElementById("historyDetailContent");
  const dateElement = document.getElementById("historyDetailDate");

  dateElement.textContent = new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  content.innerHTML = `
    <div class="loading">
      Memuat detail...
    </div>
  `;

  openModal("historyModal");

  try {
    const response = await fetch("/api/pemanen_page", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        token: token,
        refer: "assignment-detail",
        tanggal: tanggal,
      }),
    });

    console.log("STATUS:", response.status);

    const result = await response.json();

    console.log("DETAIL RESULT:", result);

    if (!response.ok) {
      content.innerHTML = `
        <div class="empty">
          <h3>Gagal memuat detail</h3>
          <p>${result.message || "Terjadi kesalahan."}</p>
        </div>
      `;

      return;
    }

    if (!result.success) {
      content.innerHTML = `
        <div class="empty">
          <h3>Gagal memuat detail</h3>
          <p>${result.message || "Data tidak ditemukan."}</p>
        </div>
      `;

      return;
    }

    renderHistoryDetail(result.data);
  } catch (error) {
    console.error("DETAIL ERROR:", error);

    content.innerHTML = `
      <div class="empty">
        <h3>Terjadi kesalahan</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function renderHistoryDetail(data) {
  const container = document.getElementById("historyDetailContent");

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📋</div>
        <h3>Belum ada hasil panen</h3>
        <p>Tidak ada data.</p>
      </div>
    `;
    return;
  }

  let totalBuah = 0;
  let totalBrondol = 0;

  container.innerHTML = data
    .map((item) => {
      const buah = Number(item.jumlah_buah || 0);
      const brondol = Number(item.jumlah_brondol || 0);

      totalBuah += buah;
      totalBrondol += brondol;

      const photos =
        item.foto && item.foto.length
          ? `
            <div class="history-photo-grid">
              ${item.foto
                .map(
                  (foto) => `
                    <img
                      src="${foto.url}"
                      alt="Bukti Panen"
                      onclick="window.open('${foto.url}','_blank')"
                    >
                  `,
                )
                .join("")}
            </div>
          `
          : `<div class="no-photo">Belum ada foto</div>`;

      return `
        <div class="history-ancak-card">

          <div class="history-ancak-header">
            <strong>Ancak ${item.kode_ancak}</strong>
          </div>

          <div class="result-grid">

            <div class="result-box">
              <label>Jumlah Buah</label>
              <input
                type="number"
                id="edit-buah-${item.id_detail}"
                value="${buah}"
                min="0"
              />
            </div>

            <div class="result-box">
              <label>Jumlah Brondol</label>
              <input
                type="number"
                id="edit-brondol-${item.id_detail}"
                value="${brondol}"
                min="0"
              />
            </div>

          </div>

          ${
            item.catatan
              ? `
              <div class="catatan-box">
                <span>Catatan</span>
                <p>${item.catatan}</p>
              </div>
            `
              : ""
          }

          <div class="history-photo-section">
            <label>Foto Bukti Panen</label>
            ${photos}
          </div>

          <button
            class="btn-save"
            style="margin-top:12px"
            onclick="updateHistoryResult(${item.id_detail})"
          >
            ✏️ Simpan Perubahan
          </button>

        </div>
      `;
    })
    .join("");

  container.innerHTML += `
    <div class="history-total">

      <div>
        <span>Total Buah</span>
        <strong>${totalBuah.toLocaleString("id-ID")} tandan</strong>
      </div>

      <div>
        <span>Total Brondol</span>
        <strong>${totalBrondol.toLocaleString("id-ID")} ember</strong>
      </div>

    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const monthInput = document.getElementById("analyticsMonth");

  monthInput.value = new Date().toISOString().slice(0, 7);

  getAnalytics();
});

async function getAnalytics() {
  const token = localStorage.getItem("token");
  const bulan = document.getElementById("analyticsMonth").value;

  const response = await fetch("/api/pemanen_page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      refer: "analytics",
      bulan,
    }),
  });

  const result = await response.json();

  document.getElementById("totalBuah").textContent =
    `${result.total_buah || 0} tandan`;

  document.getElementById("totalBrondol").textContent =
    `${result.total_brondol || 0} ember`;

  document.getElementById("hariKerja").textContent =
    `${result.hari_kerja || 0} hari`;
}

async function downloadReport() {
  const bulan = document.getElementById("reportMonth").value;

  if (!bulan) {
    alert("Pilih bulan terlebih dahulu.");
    return;
  }

  const response = await fetch("/api/report_pemanen", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: localStorage.getItem("token"),
      bulan,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    alert(err.error);
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_Panen_${bulan}.pdf`;
  a.click();

  URL.revokeObjectURL(url);
}

async function uploadPhotos(files) {
  const urls = [];

  for (const file of files) {
    const form = new FormData();

    form.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Upload gagal");
    }

    urls.push(result.url);
  }

  return urls;
}

function logout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    localStorage.removeItem("token");
    window.location.href = "/";
  }
}

function previewPhotos(id_detail) {
  const input = document.getElementById(`harvestPhotos-${id_detail}`);

  const preview = document.getElementById(`photoPreview-${id_detail}`);

  preview.innerHTML = "";

  [...input.files].forEach((file) => {
    const img = document.createElement("img");

    img.src = URL.createObjectURL(file);

    preview.appendChild(img);
  });
}

async function updateHistoryResult(id_detail) {
  const token = localStorage.getItem("token");

  const buah = Number(document.getElementById(`edit-buah-${id_detail}`).value);
  const brondol = Number(
    document.getElementById(`edit-brondol-${id_detail}`).value,
  );

  const response = await fetch("/api/pemanen_page", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      id_detail,
      jumlah_buah: buah,
      jumlah_brondol: brondol,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    alert(result.message || "Gagal memperbarui hasil.");
    return;
  }

  alert("Hasil panen berhasil diperbarui.");

  getAssignment();
  getAssignmentHistory();
}

auth();
getAssignment();
getAssignmentHistory();
getPemanen();
setToday();
getAnalytics();
