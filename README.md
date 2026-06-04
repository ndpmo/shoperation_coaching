# shoperation_coaching
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>輔導紀錄表</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="app-header">
    <div>
      <p class="eyebrow">輔導紀錄表</p>
      <h1>輔導紀錄及輸入系統</h1>
      <p class="subtitle">輸入輔導資料、儲存紀錄、搜尋、編輯、匯出及列印。</p>
    </div>
    <div class="header-actions">
      <button id="printBtn" class="secondary">列印</button>
      <button id="exportCsvBtn" class="secondary">匯出 CSV</button>
      <button id="exportJsonBtn" class="secondary">匯出 JSON</button>
    </div>
  </header>

  <main class="layout">
    <section class="card form-card">
      <div class="card-title-row">
        <h2 id="formTitle">新增輔導紀錄</h2>
        <button id="resetBtn" type="button" class="ghost">清除表格</button>
      </div>

      <form id="coachingForm">
        <input type="hidden" id="recordId" />

        <fieldset>
          <legend>Staff Details</legend>
          <div class="grid two">
            <label>同事名
              <input id="staffName" name="staffName" required placeholder="例：陳大文" />
            </label>
            <label>職級
              <input id="positionLevel" name="positionLevel" placeholder="例：高級銷售" />
            </label>
            <label>入職日期
              <input id="joinDate" name="joinDate" type="date" />
            </label>
            <label>輔導日期
              <input id="coachingDate" name="coachingDate" type="date" />
            </label>
            <label>直屬公司
              <input id="directCompany" name="directCompany" />
            </label>
            <label>直線下屬
              <input id="directReport" name="directReport" />
            </label>
            <label>品牌
              <input id="brand" name="brand" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Performance Metrics</legend>
          <div class="grid three">
            <label>活躍客戶
              <input id="activeClients" name="activeClients" type="number" min="0" step="1" />
            </label>
            <label>平均消費
              <input id="averageSpending" name="averageSpending" type="number" min="0" step="0.01" />
            </label>
            <label>CSAT 平均
              <input id="csatAverage" name="csatAverage" type="number" min="0" max="100" step="0.01" />
            </label>
          </div>
          <div class="grid two">
            <label>每月銷售目標（公司定）
              <input id="companySalesTarget" name="companySalesTarget" type="number" min="0" step="0.01" />
            </label>
            <label>每月銷售目標（自己定）
              <input id="selfSalesTarget" name="selfSalesTarget" type="number" min="0" step="0.01" />
            </label>
          </div>
        </fieldset>

        <fieldset class="coaching-content">
          <legend>今日輔導內容</legend>

          <div class="content-grid">

            <label class="field-block">
              <span>重點內容</span>
              <textarea id="keyContent" name="keyContent" rows="4"></textarea>
            </label>

            <label class="field-block full-width">
              <span>輔導後的轉變計劃</span>
              <textarea id="changePlan" name="changePlan" rows="4"></textarea>
            </label>

            <label class="field-block full-width">
              <span>期望達到什麼目標</span>
              <textarea id="expectedGoal" name="expectedGoal" rows="3"></textarea>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>三個具體方法</legend>
          <p class="hint">想達到以上共識的目標，請填寫三個具體方法。</p>
          <label>1
            <textarea id="method1" name="method1" rows="2"></textarea>
          </label>
          <label>2
            <textarea id="method2" name="method2" rows="2"></textarea>
          </label>
          <label>3
            <textarea id="method3" name="method3" rows="2"></textarea>
          </label>
        </fieldset>

        <fieldset>
          <legend>跟進及評分</legend>
          <div class="grid two">
            <label>下次見面時間預約
              <input id="nextMeeting" name="nextMeeting" type="datetime-local" />
            </label>
            <label>同事 Anchor？
              <input id="staffAnchor" name="staffAnchor" />
            </label>
            <label>我的評分
              <select id="myRating" name="myRating">
                <option value="">Select</option>
                <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                <option>6</option><option>7</option><option>8</option><option>9</option><option>10</option>
              </select>
            </label>
            <label>
              <select id="cultureJourneyRating" name="cultureJourneyRating">
                <option value="">Select</option>
                <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                <option>6</option><option>7</option><option>8</option><option>9</option><option>10</option>
              </select>
            </label>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="primary">儲存紀錄</button>
          <button id="cancelEditBtn" type="button" class="secondary hidden">取消編輯</button>
        </div>
      </form>
    </section>

    <aside class="card records-card">
      <div class="card-title-row">
        <h2>已儲存紀錄</h2>
        <span id="recordCount" class="pill">0</span>
      </div>
      <label class="search-label">Search records
        <input id="searchInput" placeholder="Search by name, brand, company..." />
      </label>
      <div id="recordsList" class="records-list"></div>
    </aside>
  </main>

  <template id="recordTemplate">
    <article class="record-item">
      <div>
        <h3></h3>
        <p></p>
      </div>
      <div class="record-actions">
        <button class="ghost edit-record">Edit</button>
        <button class="danger delete-record">Delete</button>
      </div>
    </article>
  </template>

  <script src="app.js"></script>
</body>
</html>
