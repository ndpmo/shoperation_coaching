const STORAGE_KEY = 'coachingFormRecords.v3';
const DEFAULT_SHEET_ID = '1qtmuwLlmNoJPJy5zBiQN-5kf0n_9ztA-_XwTbzdKzRk';
const DEFAULT_GID = '0';

const form = document.getElementById('coachingForm');
const recordIdInput = document.getElementById('recordId');
const searchInput = document.getElementById('searchInput');
const centerFilter = document.getElementById('centerFilter');
const groupedRecords = document.getElementById('groupedRecords');
const centerSummary = document.getElementById('centerSummary');
const sourceStatus = document.getElementById('sourceStatus');
const sheetUrlInput = document.getElementById('sheetUrlInput');
const formTitle = document.getElementById('formTitle');
const formPanel = document.getElementById('formPanel');
const createSessionBtn = document.getElementById('createSessionBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

let sheetRecords = [];
let allRecords = [];

const fields = [
  'center','staffName','positionLevel','joinDate','coachingDate','coachingTime','directManager','directReport','brand',
  'activeClients','averageSpending','csatAverage','companySalesTarget','selfSalesTarget',
  'keyContent','changePlan','expectedGoal','method1','method2','method3',
  'nextMeeting','staffAnchor','myRating','cultureJourneyRating'
];

const headerAliases = {
  center: ['樓層', '中心', 'Floor', 'Center', 'centre', 'Centre'],
  staffName: ['治療師', '同事名', '姓名', '員工姓名', 'Therapist', 'Staff name', 'Name'],
  positionLevel: ['職級', '級別', 'Position', 'Level'],
  joinDate: ['入職日期', 'Join date'],
  coachingDate: ['輔導日期', '日期', 'Coaching date'],
  coachingTime: ['輔導時間', 'Coaching time', 'Coaching Time', 'Time'],
  directManager: ['直屬上司', '上司', 'Direct manager', 'Direct company'],
  directReport: ['直線下屬', '下屬', 'Direct report'],
  brand: ['品牌', 'Brand'],
  activeClients: ['活躍客戶', 'Active clients'],
  averageSpending: ['平均消費', 'Average spending'],
  csatAverage: ['顧客滿意度平均', 'CSAT', 'csat'],
  companySalesTarget: ['每月銷售目標（公司定）', '公司定銷售目標'],
  selfSalesTarget: ['每月銷售目標（自己定）', '自己定銷售目標'],
  keyContent: ['重點內容', 'Key content'],
  changePlan: ['今日輔導後的轉變計劃', '轉變計劃', 'Change plan'],
  expectedGoal: ['今日轉變後期望達到什麼目標', '期望目標', 'Expected goal'],
  method1: ['方法一', '1'],
  method2: ['方法二', '2'],
  method3: ['方法三', '3'],
  nextMeeting: ['下次見面時間預約', '下次見面時間'],
  staffAnchor: ['同事 Anchor？', '同事Anchor', 'Anchor'],
  myRating: ['我的聲譽分', '聲譽分'],
  cultureJourneyRating: ['我的文化旅遊評分', '文化旅遊評分']
};

function getLocalRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveLocalRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getCsvUrl() {
  const input = sheetUrlInput.value.trim();
  const idMatch = input.match(/\/spreadsheets\/d\/([^/]+)/);
  const gidMatch = input.match(/[?&#]gid=(\d+)/);
  const id = idMatch ? idMatch[1] : DEFAULT_SHEET_ID;
  const gid = gidMatch ? gidMatch[1] : DEFAULT_GID;
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some(value => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some(value => value.trim() !== '')) rows.push(row);
  return rows;
}

function findColumn(headers, aliases, fallbackIndex) {
  const clean = value => String(value || '').trim().toLowerCase();
  const normalizedHeaders = headers.map(clean);
  for (const alias of aliases) {
    const index = normalizedHeaders.indexOf(clean(alias));
    if (index !== -1) return index;
  }
  return fallbackIndex;
}

function rowsToRecords(rows) {
  if (!rows.length) return [];
  const headers = rows[0];
  const columnMap = {};
  Object.entries(headerAliases).forEach(([field, aliases]) => {
    columnMap[field] = findColumn(headers, aliases, field === 'center' ? 0 : -1);
  });

  return rows.slice(1).map((row, index) => {
    const record = { id: `sheet-${index}`, source: '資料表' };
    fields.forEach(field => {
      const col = columnMap[field];
      record[field] = col >= 0 ? String(row[col] || '').trim() : '';
    });
    if (!record.center) record.center = String(row[0] || '未分類').trim() || '未分類';
    return record;
  }).filter(record => Object.values(record).some(value => String(value || '').trim() !== ''));
}

async function loadSheetRecords() {
  sourceStatus.textContent = '正在載入資料表...';
  try {
    const response = await fetch(getCsvUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();

    if (text.includes('<!DOCTYPE html') || text.includes('<html')) {
      throw new Error('資料表不是公開 CSV');
    }

    sheetRecords = rowsToRecords(parseCsv(text));
    sourceStatus.textContent = `已載入資料表紀錄：${sheetRecords.length} 筆`;
  } catch (error) {
    sheetRecords = [];
    sourceStatus.textContent = '未能讀取資料表。請確認資料表已發布成公開 CSV，或使用已授權的資料接口。';
  }
  refreshData();
}

function refreshData() {
  allRecords = [...sheetRecords, ...getLocalRecords().map(record => ({ ...record, source: '本機' }))];
  updateCenterFilter();
  renderDashboard();
}

function updateCenterFilter() {
  const current = centerFilter.value;
  const centers = [...new Set(allRecords.map(r => r.center || '未分類樓層'))].sort();
  centerFilter.innerHTML = '<option value="">全部樓層</option>' + centers.map(center => `<option value="${escapeHtml(center)}">${escapeHtml(center)}</option>`).join('');
  centerFilter.value = centers.includes(current) ? current : '';
}

function getFilteredRecords() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedCenter = centerFilter.value;
  return allRecords.filter(record => {
    const matchesCenter = !selectedCenter || (record.center || '未分類') === selectedCenter;
    const matchesQuery = !query || Object.values(record).join(' ').toLowerCase().includes(query);
    return matchesCenter && matchesQuery;
  });
}

function renderDashboard() {
  const records = getFilteredRecords();
  const grouped = groupByCenter(records);
  renderSummary(grouped);
  renderGroups(grouped);
}

function groupByCenter(records) {
  return records.reduce((acc, record) => {
    const center = record.center || '未分類樓層';
    if (!acc[center]) acc[center] = [];
    acc[center].push(record);
    return acc;
  }, {});
}

function renderSummary(grouped) {
  const entries = Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  if (!entries.length) {
    centerSummary.innerHTML = '<p class="hint">暫時沒有紀錄。</p>';
    return;
  }
  centerSummary.innerHTML = entries.map(([center, records]) => `
    <article class="summary-card">
      <strong>${records.length}</strong>
      <span>${escapeHtml(center)}</span>
    </article>
  `).join('');
}

function renderGroups(grouped) {
  const entries = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) {
    groupedRecords.innerHTML = '<p class="hint">暫時沒有紀錄。</p>';
    return;
  }

  groupedRecords.innerHTML = entries.map(([floor, records]) => {
    const therapistGroups = records.reduce((acc, record) => {
      const therapist = record.staffName || '未填治療師';
      if (!acc[therapist]) acc[therapist] = [];
      acc[therapist].push(record);
      return acc;
    }, {});

    return `
      <section class="center-group">
        <div class="center-group-header">
          <h3>樓層：${escapeHtml(floor)}</h3>
          <span class="badge">${records.length} 筆</span>
        </div>

        <div class="therapist-list">
          ${Object.entries(therapistGroups).sort((a, b) => a[0].localeCompare(b[0])).map(([therapist, therapistRecords]) => `
            <article class="therapist-card">
              <div class="therapist-header">
                <h4>治療師：${escapeHtml(therapist)}</h4>
                <span class="badge">${therapistRecords.length} 次輔導</span>
              </div>

              <div class="session-list">
                ${therapistRecords.map(record => {
                  const time = record.coachingTime || record.coachingDate || record.nextMeeting || '未填輔導時間';
                  return `
                    <div class="session-row">
                      <div>
                        <strong>輔導時間：${escapeHtml(formatDateTime(time))}</strong>
                        <p>${escapeHtml(record.keyContent || record.changePlan || record.expectedGoal || '未填輔導內容')}</p>
                      </div>
                      <div class="record-actions">
                        ${record.source === '本機' ? `
                          <button class="secondary" onclick="editRecord('${record.id}')">編輯</button>
                          <button class="danger" onclick="deleteRecord('${record.id}')">刪除</button>
                        ` : '<span class="hint">資料表</span>'}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function showFormPanel() {
  formPanel.classList.remove('hidden');
  formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideFormPanel() {
  formPanel.classList.add('hidden');
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-HK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function readForm() {
  const data = {};
  fields.forEach(field => data[field] = (document.getElementById(field)?.value || '').trim());
  data.id = recordIdInput.value || crypto.randomUUID();
  data.updatedAt = new Date().toISOString();
  return data;
}

function fillForm(record) {
  fields.forEach(field => {
    const element = document.getElementById(field);
    if (element) element.value = record[field] || '';
  });
  recordIdInput.value = record.id;
  formTitle.textContent = '編輯輔導紀錄';
  cancelEditBtn.classList.remove('hidden');
  showFormPanel();
}

function clearForm() {
  form.reset();
  recordIdInput.value = '';
  formTitle.textContent = '新增輔導紀錄';
  cancelEditBtn.classList.add('hidden');
  hideFormPanel();
}

function editRecord(id) {
  const record = getLocalRecords().find(item => item.id === id);
  if (record) fillForm(record);
}

function deleteRecord(id) {
  if (!confirm('確定要刪除此紀錄？')) return;
  saveLocalRecords(getLocalRecords().filter(item => item.id !== id));
  refreshData();
}

function exportFile(type) {
  const records = getFilteredRecords();
  const filename = `coaching-records-by-floor.${type}`;
  let content;
  let mime;

  if (type === 'json') {
    content = JSON.stringify(records, null, 2);
    mime = 'application/json;charset=utf-8;';
  } else {
    const headers = ['樓層','治療師','職級','入職日期','輔導日期','輔導時間','直屬上司','直線下屬','品牌','活躍客戶','平均消費','顧客滿意度平均','每月銷售目標（公司定）','每月銷售目標（自己定）','重點內容','轉變計劃','期望目標','方法一','方法二','方法三','下次見面時間','同事 Anchor','我的聲譽分','我的文化旅遊評分','來源'];
    const keys = [...fields, 'source'];
    content = [headers, ...records.map(record => keys.map(key => record[key] || ''))]
      .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    mime = 'text/csv;charset=utf-8;';
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = readForm();
  const records = getLocalRecords();
  const index = records.findIndex(record => record.id === data.id);
  if (index >= 0) records[index] = data;
  else records.unshift(data);
  saveLocalRecords(records);
  clearForm();
  refreshData();
});

createSessionBtn.addEventListener('click', () => {
  clearForm();
  showFormPanel();
});
document.getElementById('resetBtn').addEventListener('click', clearForm);
cancelEditBtn.addEventListener('click', clearForm);
document.getElementById('reloadSheetBtn').addEventListener('click', loadSheetRecords);
document.getElementById('printBtn').addEventListener('click', () => window.print());
document.getElementById('exportCsvBtn').addEventListener('click', () => exportFile('csv'));
document.getElementById('exportJsonBtn').addEventListener('click', () => exportFile('json'));
searchInput.addEventListener('input', renderDashboard);
centerFilter.addEventListener('change', renderDashboard);
sheetUrlInput.addEventListener('change', loadSheetRecords);

loadSheetRecords();
