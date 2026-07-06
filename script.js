const firebaseConfig = {
apiKey: "AIzaSyBziXuFLpPPOoBoL1rz-1xLd3PUhTxBaO0",
authDomain: "gaichu-shedule.firebaseapp.com",
databaseURL: "https://gaichu-shedule-default-rtdb.firebaseio.com",
projectId: "gaichu-shedule",
storageBucket: "gaichu-shedule.firebasestorage.app",
messagingSenderId: "93773507733",
appId: "1:93773507733:web:2fce361b242929a15b3f9c"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

const defaultContractors = ["業者A", "業者B"];

let contractors = [];
let schedules = {};
let editingId = null;

function getContractors() {
return db.ref("settings/contractors").once("value").then(function(snap){
contractors = snap.val() || defaultContractors;
if (!snap.val()) { db.ref("settings/contractors").set(defaultContractors); }
});
}

function getSchedules() {
return db.ref("schedules").once("value").then(function(snap){
schedules = snap.val() || {};
});
}

function statusColor(status) {
if (status === "完了") return "#2e9d45";
if (status === "依頼済") return "#1976d2";
return "#999";
}

function todayStr() {
const d = new Date();
const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return y + "-" + m + "-" + day;
}

function renderHome() {
const list = document.getElementById("list");
if (!list) return;
list.innerHTML = "";

const today = todayStr();

contractors.forEach(function(name) {
const entries = Object.keys(schedules)
.map(function(id){ return Object.assign({ id: id }, schedules[id]); })
.filter(function(e){ return e.contractor === name; })
.filter(function(e){ return !e.date || e.date >= today; })
.sort(function(a, b){ return (a.date || "").localeCompare(b.date || ""); });

const section = document.createElement("div");
section.className = "contractorBox";

const title = document.createElement("div");
title.className = "contractorTitle";
title.textContent = "🏢 " + name + "（" + entries.length + "件）";
section.appendChild(title);

if (entries.length === 0) {
const empty = document.createElement("div");
empty.className = "emptyNote";
empty.textContent = "予定はまだありません";
section.appendChild(empty);
} else {
entries.forEach(function(e) {
const card = document.createElement("div");
card.className = "entryCard";
card.innerHTML =
"<div class='entryDate'>" + (e.date || "日付未定") + "</div>" +
"<div class='entryContent'>" + e.content + "</div>" +
(e.note ? "<div class='entryNote'>📝 " + e.note + "</div>" : "") +
"<div class='entryStatus' style='background:" + statusColor(e.status) + "'>" + e.status + "</div>";
card.onclick = function(){ openEditModal(e); };
section.appendChild(card);
});
}

list.appendChild(section);
});
}

function fillContractorSelect() {
const select = document.getElementById("mContractor");
select.innerHTML = "";
contractors.forEach(function(name){
const op = document.createElement("option");
op.value = name; op.textContent = name;
select.appendChild(op);
});
}

function openAddModal() {
editingId = null;
document.getElementById("modalTitle").textContent = "予定の追加";
fillContractorSelect();
document.getElementById("mDate").value = "";
document.getElementById("mContent").value = "";
document.getElementById("mStatus").value = "未依頼";
document.getElementById("mNote").value = "";
document.getElementById("mDeleteBtn").style.display = "none";
document.getElementById("modalOverlay").style.display = "flex";
}

function openEditModal(e) {
editingId = e.id;
document.getElementById("modalTitle").textContent = "予定の編集";
fillContractorSelect();
document.getElementById("mContractor").value = e.contractor;
document.getElementById("mDate").value = e.date || "";
document.getElementById("mContent").value = e.content || "";
document.getElementById("mStatus").value = e.status || "未依頼";
document.getElementById("mNote").value = e.note || "";
document.getElementById("mDeleteBtn").style.display = "block";
document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
document.getElementById("modalOverlay").style.display = "none";
}

function saveEntry() {
const data = {
contractor: document.getElementById("mContractor").value,
date: document.getElementById("mDate").value,
content: document.getElementById("mContent").value.trim(),
status: document.getElementById("mStatus").value,
note: document.getElementById("mNote").value.trim()
};

if (!data.content) { alert("作業内容を入力してください"); return; }

const ref = editingId ? db.ref("schedules/" + editingId) : db.ref("schedules").push();
ref.set(data).then(function(){
closeModal();
return getSchedules();
}).then(renderHome);
}

function deleteEntry() {
if (!editingId) return;
if (!confirm("この予定を削除しますか？")) return;
db.ref("schedules/" + editingId).remove().then(function(){
closeModal();
return getSchedules();
}).then(renderHome);
}

document.addEventListener("DOMContentLoaded", function(){
const addBtn = document.getElementById("addBtn");
if (addBtn) addBtn.onclick = openAddModal;

const saveBtn = document.getElementById("mSaveBtn");
if (saveBtn) saveBtn.onclick = saveEntry;

const cancelBtn = document.getElementById("mCancelBtn");
if (cancelBtn) cancelBtn.onclick = closeModal;

const deleteBtn = document.getElementById("mDeleteBtn");
if (deleteBtn) deleteBtn.onclick = deleteEntry;

const dateClearBtn = document.getElementById("mDateClear");
if (dateClearBtn) dateClearBtn.onclick = function(){
document.getElementById("mDate").value = "";
};

Promise.all([getContractors(), getSchedules()]).then(renderHome);
});
