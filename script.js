```javascript
// ==================================================
// WEBSITE MASJID BAITURRAHMAN
// Kegiatan masjid + jadwal salat otomatis
// Lokasi: Tuah Madani, Pekanbaru, Riau
// Metode perhitungan: Kemenag Indonesia (20)
// ==================================================


// 1. TAHUN OTOMATIS DI FOOTER
function tampilkanTahun() {
    const elemenTahun = document.getElementById("tahun");

    if (elemenTahun) {
        elemenTahun.textContent = new Date().getFullYear();
    }
}


// 2. DATA KEGIATAN MASJID MENGGUNAKAN FOTO
const kegiatanMasjid = [
    {
        gambar: "tpq baiturrahman",
        judul: "Didikan Subuh",
        deskripsi:
            "Membina anak-anak agar mengenal ajaran Islam, " +
            "membiasakan ibadah, dan belajar agama sejak dini."
    },
    {
        gambar: "silaturrahmi DKM.jpg",
        judul: "Silaturahmi DKM",
        deskripsi:
            "Mempererat silaturahmi dan hubungan antar pengurus " +
            "serta jamaah Masjid Baiturrahman."
    },
    {
        gambar: "rapat kemaslahatan ummat.jpg",
        judul: "Kemaslahatan Umat",
        deskripsi:
            "Membahas kegiatan dan kepentingan umat untuk " +
            "mendukung kemakmuran masjid."
    }
];

function tampilkanKegiatan() {
    const daftar = document.getElementById("daftarKegiatan");

    if (!daftar) return;

    daftar.innerHTML = "";

    kegiatanMasjid.forEach(function (kegiatan) {
        const kartu = document.createElement("div");
        kartu.className = "kartu";

        const gambar = document.createElement("img");
        gambar.src = kegiatan.gambar;
        gambar.alt = kegiatan.judul;
        gambar.loading = "lazy";

        // Pesan jika gambar tidak ditemukan
        gambar.onerror = function () {
            this.alt = "Gambar tidak ditemukan: " + kegiatan.gambar;
            this.style.display = "none";
            console.error("Gambar tidak ditemukan:", kegiatan.gambar);
        };

        const judul = document.createElement("h3");
        judul.textContent = kegiatan.judul;

        const deskripsi = document.createElement("p");
        deskripsi.textContent = kegiatan.deskripsi;

        kartu.appendChild(gambar);
        kartu.appendChild(judul);
        kartu.appendChild(deskripsi);

        daftar.appendChild(kartu);
    });
}


// 3. JADWAL SALAT OTOMATIS
async function muatJadwalSalat() {
    const status = document.getElementById("statusJadwal");
    const tanggal = document.getElementById("tanggalJadwal");

    if (!status || !tanggal) {
        console.warn(
            "Elemen statusJadwal atau tanggalJadwal tidak ditemukan."
        );
        return;
    }

    status.textContent = "Sedang mengambil jadwal salat...";

    try {
        // Tanggal hari ini berdasarkan zona waktu WIB
        const bagianTanggal = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Jakarta",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).formatToParts(new Date());

        const bagian = {};

        bagianTanggal.forEach(function (item) {
            bagian[item.type] = item.value;
        });

        const tanggalAPI =
            bagian.day + "-" + bagian.month + "-" + bagian.year;

        // API jadwal salat AlAdhan
        const alamatAPI =
            "https://api.aladhan.com/v1/timingsByCity/" +
            tanggalAPI +
            "?city=Pekanbaru&country=Indonesia&method=20";

        const respons = await fetch(alamatAPI);

        if (!respons.ok) {
            throw new Error("HTTP " + respons.status);
        }

        const hasil = await respons.json();

        if (
            hasil.code !== 200 ||
            !hasil.data ||
            !hasil.data.timings
        ) {
            throw new Error("Data jadwal salat tidak tersedia.");
        }

        const waktu = hasil.data.timings;

        // Memasukkan waktu ke dalam HTML
        const daftarWaktu = {
            subuh: waktu.Fajr,
            zuhur: waktu.Dhuhr,
            asar: waktu.Asr,
            magrib: waktu.Maghrib,
            isya: waktu.Isha
        };

        Object.keys(daftarWaktu).forEach(function (id) {
            const elemen = document.getElementById(id);

            if (elemen) {
                elemen.textContent =
                    daftarWaktu[id].split(" ")[0];
            } else {
                console.warn("Elemen waktu tidak ditemukan:", id);
            }
        });

        // Menampilkan tanggal jadwal
        tanggal.textContent =
            "Jadwal salat tanggal " +
            new Intl.DateTimeFormat("id-ID", {
                timeZone: "Asia/Jakarta",
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }).format(new Date());

        status.textContent =
            "Jadwal salat berhasil diperbarui.";

    } catch (kesalahan) {
        console.error("Gagal mengambil jadwal salat:", kesalahan);

        status.textContent =
            "Jadwal belum dapat dimuat. Periksa koneksi internet.";
    }
}


// 4. FORMULIR KONTAK (JIKA ADA DI HTML)
function aktifkanFormKontak() {
    const form = document.getElementById("formKontak");

    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nama = document.getElementById("nama");
        const pesan = document.getElementById("pesan");
        const hasil = document.getElementById("hasilPesan");

        if (!nama || !pesan || !hasil) return;

        if (!nama.value.trim() || !pesan.value.trim()) {
            hasil.textContent =
                "Silakan isi nama dan pesan terlebih dahulu.";
            return;
        }

        hasil.textContent =
            "Terima kasih, " + nama.value.trim() +
            ". Pesan telah diproses di halaman ini.";

        console.log("Nama:", nama.value.trim());
        console.log("Pesan:", pesan.value.trim());

        form.reset();
    });
}


// 5. MEMUAT SEMUA FITUR
function jalankanWebsite() {
    tampilkanTahun();
    tampilkanKegiatan();
    aktifkanFormKontak();
    muatJadwalSalat();
}


// Jalankan setelah HTML selesai dimuat
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        jalankanWebsite
    );
} else {
    jalankanWebsite();
}


// 6. PERIKSA PERGANTIAN TANGGAL WIB SETIAP MENIT
function tanggalWIB() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

let tanggalTerakhir = tanggalWIB();

setInterval(function () {
    const hariIni = tanggalWIB();

    if (hariIni !== tanggalTerakhir) {
        tanggalTerakhir = hariIni;
        muatJadwalSalat();
    }
}, 60000);
```javascript
const daftarAyat = [
  {
    arab: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    arti: "Sesungguhnya beserta kesulitan ada kemudahan.",
    sumber: "QS. Asy-Syarh: 6"
  },
  {
    arab: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    arti: "Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu.",
    sumber: "QS. Al-Baqarah: 152"
  },
  {
    arab: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنْتُمْ",
    arti: "Dan Dia bersama kamu di mana saja kamu berada.",
    sumber: "QS. Al-Hadid: 4"
  },
  {
    arab: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    arti: "Sesungguhnya Allah beserta orang-orang yang sabar.",
    sumber: "QS. Al-Baqarah: 153"
  }
];

let indeksAyat = 0;

function gantiAyat() {
  indeksAyat = (indeksAyat + 1) % daftarAyat.length;

  document.getElementById("teksArabPilihan").textContent =
    daftarAyat[indeksAyat].arab;

  document.getElementById("artiAyatPilihan").textContent =
    daftarAyat[indeksAyat].arti;

  document.getElementById("sumberAyatPilihan").textContent =
    daftarAyat[indeksAyat].sumber;
}
```