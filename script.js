// -------------------------- 配置项（关键！替换为你的 Worker 域名） --------------------------
const API_BASE_URL = "https://你的Worker域名"; // 例如：https://telegram-config-api.yourname.workers.dev
// ---------------------------------------------------------------------------------------------

// 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', () => {
  // 加载关键词列表
  loadAllKeywords();
  // 加载默认回复话术
  loadDefaultReply();
  // 绑定按钮点击事件
  bindAllEvents();
});

// 1. 加载所有关键词
async function loadAllKeywords() {
  const tableBody = document.querySelector('#keywordsTable tbody');
  try {
    // 调用 Worker API 获取关键词
    const response = await fetch(`${API_BASE_URL}/api/keywords`, { method: 'GET' });
    const keywords = await response.json();

    // 清空表格（移除加载中状态）
    tableBody.innerHTML = '';

    // 无数据时显示提示
    if (keywords.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #666; padding: 30px 0;">
            暂无关键词，点击上方"添加关键词"按钮创建
          </td>
        </tr>
      `;
      return;
    }

    // 渲染关键词列表
    keywords.forEach(keyword => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${keyword.id}</td>
        <td>${keyword.keyword}</td>
        <td>
          <button class="status-btn ${keyword.is_active ? 'status-active' : 'status-inactive'}" 
                  data-id="${keyword.id}" 
                  data-active="${keyword.is_active}">
            ${keyword.is_active ? '已启用' : '已禁用'}
          </button>
        </td>
        <td>
          <button class="btn danger-btn delete-btn" data-id="${keyword.id}" data-keyword="${keyword.keyword}">
            <i class="fas fa-trash"></i> 删除
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // 绑定表格内按钮事件（状态切换、删除）
    bindTableButtons();
  } catch (error) {
    // 加载失败提示
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #ea4335; padding: 30px 0;">
          加载关键词失败：${error.message}
        </td>
      </tr>
    `;
    console.error('加载关键词错误：', error);
  }
}

// 2. 加载默认回复话术
async function loadDefaultReply() {
  const textarea = document.querySelector('#replyContentTextarea');
  try {
    // 调用 Worker API 获取默认回复
    const response = await fetch(`${API_BASE_URL}/api/reply`, { method: 'GET' });
    const replyData = await response.json();

    // 填充到文本框，并存储回复ID（用于后续更新）
    textarea.value = replyData.reply_content;
    textarea.dataset.replyId = replyData.id; // 把ID存在文本框的data属性中
  } catch (error) {
    // 加载失败提示
    textarea.value = `加载回复话术失败：${error.message}\n请检查API连接是否正常`;
    textarea.disabled = true;
    console.error('加载回复话术错误：', error);
  }
}

// 3. 绑定所有页面按钮事件
function bindAllEvents() {
  // 绑定"添加关键词"按钮
  document.querySelector('#addKeywordBtn').addEventListener('click', addNewKeyword);
  
  // 绑定"保存回复话术"按钮
  document.querySelector('#saveReplyBtn').addEventListener('click', saveReplyContent);
}

// 4. 绑定表格内按钮事件（状态切换、删除）
function bindTableButtons() {
  // 状态切换按钮
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const keywordId = e.target.dataset.id;
      const isActive = e.target.dataset.active === 'true';
      const newStatus = !isActive;

      try {
        // 调用 Worker API 修改状态
        await fetch(`${API_BASE_URL}/api/keywords/${keywordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: newStatus })
        });

        // 重新加载列表，刷新状态
        loadAllKeywords();
      } catch (error) {
        alert(`修改状态失败：${error.message}`);
        console.error('修改关键词状态错误：', error);
      }
    });
  });

  // 删除按钮
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const keywordId = e.target.dataset.id;
      const keyword = e.target.dataset.keyword;

      // 二次确认删除
      if (!confirm(`确定要删除关键词「${keyword}」吗？删除后不可恢复`)) {
        return;
      }

      try {
        // 调用 Worker API 删除关键词
        await fetch(`${API_BASE_URL}/api/keywords/${keywordId}`, { method: 'DELETE' });

        // 重新加载列表，移除删除项
        loadAllKeywords();
      } catch (error) {
        alert(`删除失败：${error.message}`);
        console.error('删除关键词错误：', error);
      }
    });
  });
}

// 5. 添加新关键词
async function addNewKeyword() {
  const input = document.querySelector('#newKeywordInput');
  const keyword = input.value.trim();

  // 验证输入
  if (!keyword) {
    alert('请输入关键词内容');
    input.focus();
    return;
  }

  if (keyword.length > 20) {
    alert('关键词长度不能超过20个字符');
    input.focus();
    return;
  }

  try {
    // 调用 Worker API 添加关键词
    await fetch(`${API_BASE_URL}/api/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, is_active: true }) // 默认启用
    });

    // 清空输入框，重新加载列表
    input.value = '';
    loadAllKeywords();
  } catch (error) {
    alert(`添加失败：${error.message}`);
    console.error('添加关键词错误：', error);
  }
}

// 6. 保存回复话术
async function saveReplyContent() {
  const textarea = document.querySelector('#replyContentTextarea');
  const statusText = document.querySelector('#replySaveStatus');
  const replyContent = textarea.value.trim();
  const replyId = textarea.dataset.replyId;

  // 验证输入
  if (!replyContent) {
    alert('回复话术不能为空');
    textarea.focus();
    return;
  }

  try {
    // 显示"保存中"状态
    statusText.textContent = '保存中...';
    statusText.className = 'status-text';

    // 调用 Worker API 更新回复话术
    await fetch(`${API_BASE_URL}/api/reply`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: replyId, reply_content: replyContent })
    });

    // 显示保存成功
    statusText.textContent = '✅ 保存成功！';
    statusText.className = 'status-text status-success';

    // 3秒后清除成功提示
    setTimeout(() => {
      statusText.textContent = '';
    }, 3000);
  } catch (error) {
    // 显示保存失败
    statusText.textContent = `❌ 保存失败：${error.message}`;
    statusText.className = 'status-text status-error';
    console.error('保存回复话术错误：', error);
  }
}
