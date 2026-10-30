(function () {
  'use strict';

  const STORAGE_KEY = 'NDS_IT_KB_HUB_HANDOVER_V4';
  const THEME_KEY = 'IT_KB_HUB_THEME_V1';
  const RBAC_ROLE_KEY = 'IT_KB_HUB_ROLE_V1';
  const GH_CONFIG_KEY = 'IT_KB_HUB_GH_CONFIG_V1';
  const GH_TOKEN_SESSION_KEY = 'IT_KB_HUB_GH_PAT_SESSION';
  const USERS_STORAGE_KEY = 'NDS_IT_KB_USERS_V1';
  const CURRENT_USER_KEY = 'NDS_IT_KB_ACTIVE_USER_V1';

  // Clean old cached versions
  try {
    localStorage.removeItem('NDS_IT_KB_HUB_HANDOVER_V1');
    localStorage.removeItem('NDS_IT_KB_HUB_HANDOVER_V2');
    localStorage.removeItem('NDS_IT_KB_HUB_HANDOVER_V3');
  } catch (_) {}

  const DEFAULT_USERS = [
    {
      id: 'USR-001',
      fullName: 'Trương Duy Ngữ',
      email: 'ngu.truong@ndsvn.vn',
      dept: 'IT Infrastructure & Operations',
      role: 'Admin',
      github: 'bontruong',
      status: 'Active',
      createdAt: '2026-10-26'
    },
    {
      id: 'USR-002',
      fullName: 'Phan Hoài Minh',
      email: 'minh.phan@ndsvn.vn',
      dept: 'Người Bàn Giao IT',
      role: 'Editor',
      github: '',
      status: 'Active',
      createdAt: '2026-10-20'
    },
    {
      id: 'USR-003',
      fullName: 'Kỹ Sư Vận Hành Hệ Thống',
      email: 'ops.engineer@ndsvn.vn',
      dept: 'DevOps & System On-call',
      role: 'Editor',
      github: '',
      status: 'Active',
      createdAt: '2026-10-27'
    },
    {
      id: 'USR-004',
      fullName: 'Nhân Sự Nội Bộ NDS',
      email: 'staff.nds@ndsvn.vn',
      dept: 'NDS General Staff',
      role: 'Viewer',
      github: '',
      status: 'Active',
      createdAt: '2026-10-28'
    }
  ];

  const SYSTEM_CATEGORIES = [
    { id: 'ALL', name: 'Tất cả hạng mục bàn giao (47)', icon: '📁' },
    { id: 'Helpdesk', name: '1. Helpdesk & Biểu mẫu', icon: '💻' },
    { id: 'Hệ thống ứng dụng nội bộ', name: '2. Ứng dụng nội bộ', icon: '📱' },
    { id: 'Hệ thống hạ tầng', name: '3. Hạ tầng & Server QTSC', icon: '🖥️' },
    { id: 'Hệ thống Cloud', name: '4. Hệ thống Cloud', icon: '☁️' },
    { id: 'Microsoft services', name: '5. Microsoft Services', icon: '🏢' },
    { id: 'Hỗ trợ hạ tầng cho hệ thống ứng dụng khách hàng', name: '6. Ứng dụng khách hàng', icon: '🛒' },
    { id: 'Các việc còn lại & phát sinh', name: '7. Tên miền, App & 20 HĐ', icon: '🌐' }
  ];

  const DEFAULT_ARTICLES = [
    {
      id: 'KB-NDS-01',
      title: 'Hỗ trợ người dùng nội bộ (40+ users) & Quản lý Biểu mẫu bàn giao MMTB',
      docType: 'SOP',
      system: 'Helpdesk',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-02',
      title: 'Nền tảng Giao tiếp Doanh nghiệp Gapowork',
      docType: 'SOP',
      system: 'Hệ thống ứng dụng nội bộ',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-03',
      title: 'Vận hành & Phân quyền Hệ thống Atlassian Jira',
      docType: 'Runbook',
      system: 'Hệ thống ứng dụng nội bộ',
      severity: 'P1 - Critical',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-04',
      title: 'Cơ sở Tri thức Atlassian Confluence Wiki',
      docType: 'SOP',
      system: 'Hệ thống ứng dụng nội bộ',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-05',
      title: 'Hệ thống Mã nguồn Doanh nghiệp Atlassian Bitbucket',
      docType: 'Runbook',
      system: 'Hệ thống ứng dụng nội bộ',
      severity: 'P1 - Critical',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-06',
      title: 'Phần mềm Quản trị Misa (HRM & Finance) & Server Misa (10.86.81.12)',
      docType: 'SOP',
      system: 'Hệ thống ứng dụng nội bộ',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-07',
      title: 'Quản trị Website Doanh nghiệp (ndsvn.vn) & Getfly CRM',
      docType: 'SOP',
      system: 'Hệ thống ứng dụng nội bộ',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-08',
      title: 'Quản lý Máy in Văn phòng (10.86.6.200) & Máy chấm công (10.86.5.200)',
      docType: 'SOP',
      system: 'Hệ thống hạ tầng',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-09',
      title: 'Hạ tầng Mạng VP (Router, Switch, Wifi Meraki, Camera, Firewall Fortigate)',
      docType: 'Architecture',
      system: 'Hệ thống hạ tầng',
      severity: 'P1 - Critical',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-10',
      title: 'Cụm Máy chủ Ảo hóa VMware vCenter / ESXi tại Data Center QTSC',
      docType: 'Architecture',
      system: 'Hệ thống hạ tầng',
      severity: 'P1 - Critical',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-11',
      title: 'Hệ sinh thái Đám mây AWS Cloud & Google Cloud Platform (GCP)',
      docType: 'Architecture',
      system: 'Hệ thống Cloud',
      severity: 'P1 - Critical',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-12',
      title: 'Dịch vụ Microsoft 365, Exchange Online & SharePoint Intranet',
      docType: 'SOP',
      system: 'Microsoft services',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-13',
      title: 'Hạ tầng Vận hành Ứng dụng Khách hàng (CMS, API, Payment Gateway)',
      docType: 'Architecture',
      system: 'Hỗ trợ hạ tầng cho hệ thống ứng dụng khách hàng',
      severity: 'P1 - Critical',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-14',
      title: 'Quản lý Danh mục Tên miền (DNS), SSL & Ứng dụng Di động NDS',
      docType: 'SOP',
      system: 'Các việc còn lại & phát sinh',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    },
    {
      id: 'KB-NDS-15',
      title: 'Quản lý 20 Hợp đồng Dịch vụ IT, Bản quyền Phần mềm & Nhà cung cấp',
      docType: 'SOP',
      system: 'Các việc còn lại & phát sinh',
      severity: 'P2 - High',
      status: 'Chờ bàn giao',
      owner: '',
      updatedAt: '',
      reviewDate: '',
      summary: '',
      steps: '',
      commands: '',
      rollback: '',
      checklist: [],
      tags: [],
      attachments: []
    }
  ];

  const ARTICLE_TEMPLATES = {
    Runbook: {
      docType: 'Runbook',
      severity: 'P1 - Critical',
      status: 'Draft',
      titlePrefix: '[RUNBOOK] Xử lý sự cố ',
      summary: 'Mô tả triệu chứng cảnh báo (Alert Name), phạm vi ảnh hưởng (SLA/SLO impact) và điều kiện kích hoạt Runbook này.',
      steps: '1. Kiểm tra nhanh trạng thái dịch vụ (Triage & Health Check).\n2. Cô lập thành phần lỗi (Isolate faulty node/pod/instance).\n3. Thực thi lệnh giảm thiểu tác động (Mitigation).\n4. Kiểm tra chỉ số phục hồi trên Monitoring Dashboard.',
      commands: '# 1. Kiểm tra trạng thái dịch vụ\n\n# 2. Lệnh khắc phục khẩn cấp\n',
      rollback: 'Nếu sau 5 phút thực thi mà tỷ lệ lỗi không giảm, chạy lệnh rollback sau để đưa hệ thống về trạng thái trước đó:',
      checklist: 'Tỷ lệ lỗi HTTP 5xx giảm về < 0.1%\nLatency P95 trở về ngưỡng bình thường\nĐã thông báo trạng thái phục hồi trên kênh #incident-war-room'
    },
    Troubleshooting: {
      docType: 'Troubleshooting',
      severity: 'P2 - High',
      status: 'Draft',
      titlePrefix: '[TROUBLESHOOTING] Khắc phục lỗi ',
      summary: 'Dán chính xác thông báo lỗi (Error Message / Exception Code) và hiện tượng người dùng/hệ thống gặp phải.',
      steps: '1. Nguyên nhân gốc rễ (Root Cause): Giải thích ngắn gọn tại sao lỗi xuất hiện.\n2. Cách kiểm tra xác nhận nguyên nhân (Diagnostic Steps).\n3. Các bước sửa lỗi triệt để (Resolution Steps).',
      commands: '# Lệnh kiểm tra log và xác minh lỗi\n',
      rollback: 'Khôi phục file cấu hình (.bak) nếu thay đổi không mang lại kết quả.',
      checklist: 'Đã tái hiện và xác nhận lỗi không còn xuất hiện\nKhông phát sinh cảnh báo mới trong Event Log / Syslog'
    },
    SOP: {
      docType: 'SOP',
      severity: 'P3 - Normal',
      status: 'Verified',
      titlePrefix: '[SOP] Quy trình chuẩn ',
      summary: 'Mục đích quy trình, đối tượng áp dụng và các điều kiện tiên quyết (Prerequisites / Quyền hạn cần có).',
      steps: '1. Chuẩn bị & Kiểm tra điều kiện tiên quyết (Pre-flight check).\n2. Thực hiện từng bước theo thứ tự chuẩn.\n3. Kiểm tra nghiệm thu và ghi nhật ký (Audit log).',
      commands: '# Lệnh thực thi tiêu chuẩn\n',
      rollback: 'Các bước hoàn tác nếu phát hiện sai sót trong quá trình cấu hình.',
      checklist: 'Đã có mã phiếu phê duyệt (Ticket ID)\nĐã tạo bản sao lưu (Backup + SHA256) trước khi thay đổi\nĐã kiểm tra nghiệm thu sau khi hoàn tất'
    }
  };

  let articles = [];
  let selectedCategory = 'ALL';
  let activeReaderArticleId = null;
  let serverApiAvailable = false;

  // RBAC & GitHub State
  let currentRole = localStorage.getItem(RBAC_ROLE_KEY) || 'Admin'; // 'Admin' | 'Editor' | 'Viewer'
  let githubUsername = null;
  let githubFileSha = null;
  let githubConfig = {
    repo: 'bontruong/it-knowledge-hub',
    branch: 'main',
    filePath: 'data/kb-seed.json',
    strictGate: false
  };

  // Safe HTML Escaping Utility (XSS Protection)
  function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // UTF-8 Safe Base64 Encode/Decode for GitHub Contents API
  function encodeBase64Utf8(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function decodeBase64Utf8(b64) {
    const clean = String(b64).replace(/\s/g, '');
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  }

  // Tier 1 Security Guardrail: Detect Accidental Secret / Key Leakage in KB Content
  function detectPlaintextSecrets(payloadText) {
    const patterns = [
      { name: 'Private Key (PEM/SSH)', regex: /-----BEGIN\s+(?:RSA|OPENSSH|EC|DSA|PRIVATE)\s+KEY-----/i },
      { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/ },
      { name: 'GitHub Personal Access Token', regex: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
      { name: 'Hardcoded Password Assignment', regex: /(?:password|passwd|pwd|client_secret|api_key)\s*[:=]\s*['"][^'"\s]{6,}['"]/i }
    ];
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].regex.test(payloadText)) {
        return patterns[i].name;
      }
    }
    return null;
  }

  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 3400);
  }

  // User Management State & Helpers
  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }

  function saveUsers(userList) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(userList));
  }

  function getActiveUser() {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u.email) return u;
      }
    } catch (_) {}
    const users = loadUsers();
    return users[0] || DEFAULT_USERS[0];
  }

  function setActiveUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    currentRole = user.role;
    localStorage.setItem(RBAC_ROLE_KEY, currentRole);
    applyRbacUiPolicy();
  }

  function renderUserDirectoryTable() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    const users = loadUsers();
    const activeUser = getActiveUser();

    tbody.innerHTML = '';
    users.forEach(function (u) {
      const tr = document.createElement('tr');
      const isCurrent = activeUser && activeUser.email.toLowerCase() === u.email.toLowerCase();

      let roleBadgeClass = 'role-viewer';
      let roleIcon = '👁️';
      if (u.role === 'Admin') { roleBadgeClass = 'role-admin'; roleIcon = '👑'; }
      else if (u.role === 'Editor') { roleBadgeClass = 'role-editor'; roleIcon = '✏️'; }

      const statusBadge = u.status === 'Active'
        ? '<span class="badge-status-active">Hoạt động</span>'
        : '<span class="badge-status-locked">Đã khóa</span>';

      const actionsHtml = isCurrent
        ? '<span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">✓ Đang dùng</span>'
        : `<button type="button" class="btn btn-sm btn-primary" data-act="switch" data-email="${escapeHtml(u.email)}">🔄 Chọn</button>` +
          (canDeleteOrImport()
            ? ` <button type="button" class="btn btn-sm" data-act="toggle-lock" data-email="${escapeHtml(u.email)}">${u.status === 'Active' ? '🔒 Khóa' : '🔓 Mở'}</button>` +
              ` <button type="button" class="btn btn-sm" data-act="delete" data-email="${escapeHtml(u.email)}" style="color:var(--sev-p1-text);" title="Xóa tài khoản">🗑️</button>`
            : '');

      tr.innerHTML = `
        <td><strong>${escapeHtml(u.fullName)}</strong>${isCurrent ? ' <span style="color:var(--accent-primary); font-size:0.75rem;">(Hiện hành)</span>' : ''}</td>
        <td><code>${escapeHtml(u.email)}</code></td>
        <td>${escapeHtml(u.dept || 'NDS')}</td>
        <td><span class="role-pill ${roleBadgeClass}">${roleIcon} ${escapeHtml(u.role)}</span></td>
        <td>${u.github ? `<a href="https://github.com/${encodeURIComponent(u.github)}" target="_blank" rel="noopener">@${escapeHtml(u.github)}</a>` : '<span style="color:var(--text-muted);">-</span>'}</td>
        <td>${statusBadge}</td>
        <td><div class="user-actions-cell">${actionsHtml}</div></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('button[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const act = btn.getAttribute('data-act');
        const email = btn.getAttribute('data-email');
        const allUsers = loadUsers();
        const target = allUsers.find(function (x) { return x.email.toLowerCase() === email.toLowerCase(); });
        if (!target) return;

        if (act === 'switch') {
          if (target.status !== 'Active') {
            showToast('⚠️ Tài khoản này đang bị khóa, không thể đăng nhập!');
            return;
          }
          setActiveUser(target);
          renderUserDirectoryTable();
          showToast(`✅ Đã chuyển sang tài khoản: ${target.fullName} (${target.role})`);
        } else if (act === 'toggle-lock') {
          target.status = target.status === 'Active' ? 'Locked' : 'Active';
          saveUsers(allUsers);
          renderUserDirectoryTable();
          showToast(`🔒 Đã ${target.status === 'Active' ? 'mở khóa' : 'khóa'} tài khoản ${target.fullName}`);
        } else if (act === 'delete') {
          if (!confirm(`Bạn có chắc muốn xóa tài khoản ${target.fullName}?`)) return;
          const filtered = allUsers.filter(function (x) { return x.email.toLowerCase() !== email.toLowerCase(); });
          saveUsers(filtered);
          renderUserDirectoryTable();
          showToast(`🗑️ Đã xóa tài khoản ${target.fullName}`);
        }
      });
    });
  }

  function openUserModal() {
    const modal = document.getElementById('userModal');
    if (!modal) return;
    renderUserDirectoryTable();
    const createSec = document.getElementById('createUserSection');
    if (createSec) {
      createSec.style.display = canDeleteOrImport() ? 'block' : 'none';
    }
    modal.classList.add('open');
    modal.classList.add('active');
  }

  function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
      modal.classList.remove('open');
      modal.classList.remove('active');
    }
  }

  function handleCreateUserSubmit(e) {
    e.preventDefault();
    if (!canDeleteOrImport()) {
      showToast('🛑 Từ chối truy cập: Chỉ Admin mới có quyền tạo User mới!');
      return;
    }
    const fullName = document.getElementById('usrFullName').value.trim();
    const email = document.getElementById('usrEmail').value.trim();
    const dept = document.getElementById('usrDept').value.trim();
    const role = document.getElementById('usrRole').value;
    const passcode = document.getElementById('usrPasscode').value;
    const github = document.getElementById('usrGitHub').value.trim();

    if (!fullName || !email) {
      showToast('⚠️ Vui lòng điền đầy đủ Họ tên và Email/Username!');
      return;
    }

    const allUsers = loadUsers();
    if (allUsers.some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
      showToast('⚠️ Email/Username này đã tồn tại trong hệ thống!');
      return;
    }

    const newUser = {
      id: 'USR-' + String(allUsers.length + 1).padStart(3, '0'),
      fullName: fullName,
      email: email,
      dept: dept || 'NDS',
      role: role,
      github: github,
      status: 'Active',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    allUsers.push(newUser);
    saveUsers(allUsers);
    renderUserDirectoryTable();
    document.getElementById('createUserForm').reset();
    showToast(`✅ Đã tạo tài khoản thành công cho: ${fullName} (${role})`);
  }

  // RBAC Permission Helpers
  function canCreateOrEdit() {
    return currentRole === 'Admin' || currentRole === 'Editor';
  }

  function canDeleteOrImport() {
    return currentRole === 'Admin';
  }

  function applyRbacUiPolicy() {
    const badge = document.getElementById('currentRoleBadge');
    const btnNew = document.getElementById('btnNewArticle');
    const lblImport = document.getElementById('lblImportJson');
    const btnExport = document.getElementById('btnExportJson');
    const btnGh = document.getElementById('btnGitHubAuth');
    const btnUserMgr = document.getElementById('btnUserManager');
    const btnEdit = document.getElementById('btnEditCurrent');
    const btnDelete = document.getElementById('btnDeleteCurrent');
    const btnUpload = document.getElementById('btnUploadDoc');
    const dropzone = document.getElementById('readerDropzone');
    const selRole = document.getElementById('selRoleOverride');
    const activeUser = getActiveUser();

    if (selRole) selRole.value = currentRole;

    const isAdmin = currentRole === 'Admin';
    const isEditor = currentRole === 'Editor';
    const isViewer = currentRole === 'Viewer';

    if (badge) {
      badge.className = 'role-pill';
      badge.style.cursor = 'pointer';
      const displayName = activeUser ? activeUser.fullName : 'Trương Duy Ngữ';
      const userSuffix = (isAdmin && githubUsername) ? ' (@' + githubUsername + ')' : '';
      if (isAdmin) {
        badge.classList.add('role-admin');
        badge.textContent = '👑 ' + displayName + ' (Admin)' + userSuffix;
        badge.title = 'Tài khoản Quản trị cấp cao (Admin) - Bấm để mở Quản lý / Chuyển tài khoản';
      } else if (isEditor) {
        badge.classList.add('role-editor');
        badge.textContent = '✏️ ' + displayName + ' (Editor)';
        badge.title = 'Tài khoản Kỹ sư Website (Editor: Thao tác Web, khóa GitHub & Import/Export) - Bấm để chuyển tài khoản';
      } else {
        badge.classList.add('role-viewer');
        badge.textContent = '👁️ ' + displayName + ' (Viewer)';
        badge.title = 'Tài khoản Tra cứu (Viewer: Chỉ đọc) - Bấm để chuyển tài khoản';
      }
    }

    // 1. Thao tác trên Website: Admin và Editor đều được phép (Tạo/Sửa bài viết & Upload tài liệu)
    if (btnNew) btnNew.style.display = (isAdmin || isEditor) ? 'inline-flex' : 'none';
    if (btnEdit) btnEdit.style.display = (isAdmin || isEditor) ? 'inline-flex' : 'none';
    if (btnUpload) btnUpload.style.display = (isAdmin || isEditor) ? 'inline-flex' : 'none';
    if (dropzone) dropzone.style.display = (isAdmin || isEditor) ? 'block' : 'none';

    // 2. Quyền can thiệp Hệ thống / GitHub / Dữ liệu file: CHỈ DÀNH CHO ADMIN
    // - Editor KHÔNG được can thiệp vào GitHub (Ẩn nút GitHub Sync)
    if (btnGh) btnGh.style.display = isAdmin ? 'inline-flex' : 'none';
    // - Editor KHÔNG thấy mục Xuất JSON
    if (btnExport) btnExport.style.display = isAdmin ? 'inline-flex' : 'none';
    // - Editor KHÔNG thấy mục Nhập JSON
    if (lblImport) lblImport.style.display = isAdmin ? 'inline-flex' : 'none';
    // - Editor KHÔNG được quản lý user (Ẩn nút Quản lý User trên topbar)
    if (btnUserMgr) btnUserMgr.style.display = isAdmin ? 'inline-flex' : 'none';
    // - Editor KHÔNG được khởi tạo trắng / reset toàn bộ bài viết
    const btnReset = document.getElementById('btnResetArticles');
    if (btnReset) btnReset.style.display = isAdmin ? 'inline-flex' : 'none';
    // - Editor KHÔNG được xóa bài viết
    if (btnDelete) btnDelete.style.display = isAdmin ? 'inline-flex' : 'none';

    // Strict Private Auth Gate enforcement
    const token = sessionStorage.getItem(GH_TOKEN_SESSION_KEY);
    const gateBanner = document.getElementById('authGateBanner');
    const workspace = document.getElementById('protectedWorkspace');
    if (githubConfig.strictGate && !token && isViewer) {
      if (gateBanner) gateBanner.classList.add('active');
      if (workspace) workspace.style.display = 'none';
    } else {
      if (gateBanner) gateBanner.classList.remove('active');
      if (workspace) workspace.style.display = 'block';
    }
  }

  // Load saved GitHub Config
  function loadGitHubConfig() {
    try {
      const saved = localStorage.getItem(GH_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        githubConfig.repo = parsed.repo || '';
        githubConfig.branch = parsed.branch || 'main';
        githubConfig.filePath = parsed.filePath || 'data/kb-seed.json';
        githubConfig.strictGate = Boolean(parsed.strictGate);
      }
    } catch (_) {
      // Ignore
    }
    document.getElementById('ghRepo').value = githubConfig.repo;
    document.getElementById('ghBranch').value = githubConfig.branch;
    document.getElementById('ghFilePath').value = githubConfig.filePath;
    document.getElementById('ghStrictGate').value = githubConfig.strictGate ? 'true' : 'false';
  }

  // Verify GitHub Token & Repository Permissions via GitHub REST API v3
  async function connectAndSyncFromGitHub(token, repo, branch, filePath, strictGate) {
    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'X-GitHub-Api-Version': '2022-11-28'
    };

    // 1. Verify User Identity
    const userRes = await fetch('https://api.github.com/user', { headers: headers });
    if (!userRes.ok) {
      throw new Error('GitHub Token không hợp lệ hoặc đã hết hạn (HTTP ' + userRes.status + ')');
    }
    const userData = await userRes.json();
    githubUsername = userData.login;

    // 2. Check Repository Permissions (Admin / Editor / Viewer)
    const repoRes = await fetch('https://api.github.com/repos/' + repo, { headers: headers });
    if (!repoRes.ok) {
      throw new Error('Không tìm thấy hoặc không có quyền truy cập Repo "' + repo + '" (HTTP ' + repoRes.status + ')');
    }
    const repoData = await repoRes.json();
    const perms = repoData.permissions || {};

    if (perms.admin || perms.maintain) {
      currentRole = 'Admin';
    } else if (perms.push) {
      currentRole = 'Editor';
    } else if (perms.pull) {
      currentRole = 'Viewer';
    } else {
      throw new Error('Tài khoản @' + githubUsername + ' không có quyền đọc (pull) trên Repo ' + repo);
    }

    localStorage.setItem(RBAC_ROLE_KEY, currentRole);

    // 3. Pull KB Articles JSON file from Repository
    const contentsUrl =
      'https://api.github.com/repos/' +
      repo +
      '/contents/' +
      filePath.replace(/^\/+/, '') +
      '?ref=' +
      encodeURIComponent(branch);

    const fileRes = await fetch(contentsUrl, { headers: headers, cache: 'no-store' });
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      githubFileSha = fileData.sha;
      const decodedJson = decodeBase64Utf8(fileData.content);
      const parsedArticles = JSON.parse(decodedJson);
      if (Array.isArray(parsedArticles)) {
        articles = parsedArticles;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      }
    }

    // Save config & session token
    githubConfig = { repo: repo, branch: branch, filePath: filePath, strictGate: strictGate };
    localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(githubConfig));
    sessionStorage.setItem(GH_TOKEN_SESSION_KEY, token);

    const indicator = document.getElementById('syncStatusIndicator');
    if (indicator) {
      indicator.textContent = '☁️ Đã kết nối GitHub Repo: ' + repo + ' (' + currentRole + ')';
    }
    const connLabel = document.getElementById('ghConnectedUserLabel');
    if (connLabel) {
      connLabel.textContent = '✅ Đã xác thực GitHub: @' + githubUsername + ' → Vai trò: ' + currentRole;
    }

    applyRbacUiPolicy();
    renderAll();
  }

  // Push / Commit updated articles directly to GitHub Repository
  async function pushArticlesToGitHub(commitReason) {
    const token = sessionStorage.getItem(GH_TOKEN_SESSION_KEY);
    if (!token || !githubConfig.repo) return false;

    if (!canCreateOrEdit()) {
      showToast('🛑 Quyền Viewer không được phép Commit lên GitHub!');
      return false;
    }

    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const cleanPath = githubConfig.filePath.replace(/^\/+/, '');
    const contentsUrl = 'https://api.github.com/repos/' + githubConfig.repo + '/contents/' + cleanPath;

    // Fetch latest SHA if not cached
    if (!githubFileSha) {
      const getRes = await fetch(contentsUrl + '?ref=' + encodeURIComponent(githubConfig.branch), {
        headers: headers,
        cache: 'no-store'
      });
      if (getRes.ok) {
        const meta = await getRes.json();
        githubFileSha = meta.sha;
      }
    }

    const jsonString = JSON.stringify(articles, null, 2);
    const bodyPayload = {
      message: commitReason || 'kb(sync): update IT Knowledge Base articles via Web Portal',
      content: encodeBase64Utf8(jsonString),
      branch: githubConfig.branch
    };
    if (githubFileSha) {
      bodyPayload.sha = githubFileSha;
    }

    const putRes = await fetch(contentsUrl, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(bodyPayload)
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(function () { return {}; });
      throw new Error(errData.message || 'HTTP ' + putRes.status);
    }

    const putData = await putRes.json();
    if (putData && putData.content && putData.content.sha) {
      githubFileSha = putData.content.sha;
    }
    return true;
  }

  // Load articles from GitHub / Local Server API / LocalStorage / Seed JSON
  async function loadArticles() {
    loadGitHubConfig();
    applyRbacUiPolicy();

    // 1. If session has active GitHub Token & Repo, sync from GitHub API
    const sessionToken = sessionStorage.getItem(GH_TOKEN_SESSION_KEY);
    if (sessionToken && githubConfig.repo) {
      try {
        await connectAndSyncFromGitHub(
          sessionToken,
          githubConfig.repo,
          githubConfig.branch,
          githubConfig.filePath,
          githubConfig.strictGate
        );
        return;
      } catch (_) {
        // Fallback below
      }
    }

    // 2. If running on Start-KBServer.ps1 local server, try /api/articles
    if (window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/articles', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            articles = data;
            serverApiAvailable = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
            const indicator = document.getElementById('syncStatusIndicator');
            if (indicator) {
              indicator.textContent = '🟢 Đồng bộ trực tiếp với ổ đĩa (data/kb-articles.json)';
            }
            renderAll();
            return;
          }
        }
      } catch (_) {
        // Fallback to static seed JSON on GitHub Pages
      }

      // 3. Try static './data/kb-seed.json' (when hosted on GitHub Pages)
      try {
        const seedRes = await fetch('./data/kb-seed.json', { cache: 'no-store' });
        if (seedRes.ok) {
          const seedData = await seedRes.json();
          if (Array.isArray(seedData) && seedData.length > 0) {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
              articles = seedData;
              localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
              renderAll();
              return;
            }
          }
        }
      } catch (_) {
        // Ignore
      }
    }

    // 4. Try LocalStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          articles = parsed;
          renderAll();
          return;
        }
      }
    } catch (_) {
      // Ignore storage error
    }

    // 5. Fallback to built-in DEFAULT_ARTICLES
    articles = JSON.parse(JSON.stringify(DEFAULT_ARTICLES));
    saveArticles('kb(init): initialize seed articles');
    renderAll();
  }

  async function saveArticles(commitMessage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch (_) {
      // Ignore quota errors
    }

    if (serverApiAvailable) {
      try {
        await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articles)
        });
      } catch (_) {
        // Keep localStorage copy
      }
    }

    const token = sessionStorage.getItem(GH_TOKEN_SESSION_KEY);
    if (token && githubConfig.repo && canCreateOrEdit()) {
      try {
        await pushArticlesToGitHub(commitMessage);
        showToast('☁️ Đã tự động Commit thay đổi lên GitHub Repo!');
      } catch (err) {
        showToast('⚠️ Lưu cục bộ thành công nhưng lỗi Commit GitHub: ' + err.message);
      }
    }
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'Verified':
        return 'badge-verified';
      case 'Needs Review':
        return 'badge-review';
      case 'Deprecated':
        return 'badge-deprecated';
      default:
        return 'badge-draft';
    }
  }

  function getSeverityBadgeClass(severity) {
    if (String(severity).startsWith('P1')) return 'badge-p1';
    if (String(severity).startsWith('P2')) return 'badge-p2';
    return 'badge-p3';
  }

  function isReviewOverdue(reviewDateStr) {
    if (!reviewDateStr) return false;
    const today = new Date().toISOString().slice(0, 10);
    return reviewDateStr < today;
  }

  function renderStats() {
    const total = articles.length;
    const p1Count = articles.filter(function (a) {
      return String(a.severity).startsWith('P1');
    }).length;
    const verifiedCount = articles.filter(function (a) {
      return a.status === 'Verified' && !isReviewOverdue(a.reviewDate);
    }).length;
    const reviewCount = articles.filter(function (a) {
      return a.status === 'Needs Review' || isReviewOverdue(a.reviewDate);
    }).length;

    document.getElementById('statTotal').textContent = String(total);
    document.getElementById('statP1').textContent = String(p1Count);
    document.getElementById('statVerified').textContent = String(verifiedCount);
    document.getElementById('statReview').textContent = String(reviewCount);
  }

  function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';

    SYSTEM_CATEGORIES.forEach(function (cat) {
      const count =
        cat.id === 'ALL'
          ? articles.length
          : articles.filter(function (a) {
              return a.system === cat.id;
            }).length;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'category-tile' + (selectedCategory === cat.id ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', selectedCategory === cat.id ? 'true' : 'false');

      btn.innerHTML =
        '<span class="category-icon" aria-hidden="true">' +
        escapeHtml(cat.icon) +
        '</span>' +
        '<div>' +
        '<span class="category-name">' +
        escapeHtml(cat.name) +
        '</span>' +
        '<span class="category-count">' +
        escapeHtml(count) +
        ' tài liệu</span>' +
        '</div>';

      btn.addEventListener('click', function () {
        selectedCategory = cat.id;
        renderCategories();
        renderArticlesFeed();
      });

      grid.appendChild(btn);
    });
  }

  function getFilteredArticles() {
    const query = (document.getElementById('searchInput').value || '').trim().toLowerCase();
    const docType = document.getElementById('filterDocType').value;
    const severity = document.getElementById('filterSeverity').value;
    const status = document.getElementById('filterStatus').value;
    const sortOrder = document.getElementById('sortOrder').value;

    const filtered = articles.filter(function (art) {
      if (selectedCategory !== 'ALL' && art.system !== selectedCategory) return false;
      if (docType !== 'ALL' && art.docType !== docType) return false;
      if (severity !== 'ALL' && art.severity !== severity) return false;

      const effectiveStatus = isReviewOverdue(art.reviewDate) ? 'Needs Review' : art.status;
      if (status !== 'ALL' && effectiveStatus !== status && art.status !== status) return false;

      if (query) {
        const haystack = [
          art.id,
          art.title,
          art.summary,
          art.steps,
          art.commands,
          art.system,
          art.owner,
          (art.tags || []).join(' ')
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    filtered.sort(function (a, b) {
      if (sortOrder === 'severity') {
        const rank = { 'P1 - Critical': 1, 'P2 - High': 2, 'P3 - Normal': 3 };
        const diff = (rank[a.severity] || 9) - (rank[b.severity] || 9);
        if (diff !== 0) return diff;
        return String(b.updatedAt).localeCompare(String(a.updatedAt));
      }
      if (sortOrder === 'updated') {
        return String(b.updatedAt).localeCompare(String(a.updatedAt));
      }
      return String(a.title).localeCompare(String(b.title), 'vi');
    });

    return filtered;
  }

  function renderArticlesFeed() {
    const container = document.getElementById('articlesContainer');
    const countLabel = document.getElementById('resultCountLabel');
    const list = getFilteredArticles();

    countLabel.textContent = 'Hiển thị ' + list.length + ' / ' + articles.length + ' bài viết';
    container.innerHTML = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML =
        '<p style="font-size:1.05rem; font-weight:600; margin-bottom:6px;">Không tìm thấy tài liệu phù hợp</p>' +
        '<p style="font-size:0.86rem;">Hãy thử xóa từ khóa tìm kiếm, đổi bộ lọc hoặc bấm "➕ Tạo bài viết KB" để bổ sung tài liệu mới.</p>';
      container.appendChild(empty);
      return;
    }

    list.forEach(function (art) {
      const overdue = isReviewOverdue(art.reviewDate);
      const effectiveStatus = overdue ? 'Needs Review (Quá hạn)' : art.status;
      const statusClass = overdue ? 'badge-review' : getStatusBadgeClass(art.status);
      const sevClass = getSeverityBadgeClass(art.severity);
      const isP1 = String(art.severity).startsWith('P1');

      const card = document.createElement('article');
      card.className = 'article-card' + (isP1 ? ' p1-border' : '');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', art.title);

      const tagsHtml = (art.tags || [])
        .map(function (t) {
          return '<span class="tag">#' + escapeHtml(t) + '</span>';
        })
        .join('');

      card.innerHTML =
        '<div class="card-badges">' +
        '<span class="badge badge-doctype">' +
        escapeHtml(art.id) +
        ' • ' +
        escapeHtml(art.docType) +
        '</span>' +
        '<span class="badge ' +
        sevClass +
        '">' +
        escapeHtml(art.severity) +
        '</span>' +
        '<span class="badge ' +
        statusClass +
        '">' +
        escapeHtml(effectiveStatus) +
        '</span>' +
        '<span class="badge badge-doctype">🗂️ ' +
        escapeHtml(art.system) +
        '</span>' +
        '</div>' +
        '<h3 class="article-title">' +
        escapeHtml(art.title) +
        '</h3>' +
        '<p class="article-summary">' +
        escapeHtml(art.summary || 'Chưa có ghi chú bàn giao — Bấm để người bàn giao cập nhật trực tiếp.') +
        '</p>' +
        '<div class="article-meta">' +
        '<div class="tag-list">' +
        tagsHtml +
        '</div>' +
        '<div>👤 ' +
        escapeHtml(art.owner || 'Chờ bàn giao') +
        ' &nbsp;|&nbsp; 📅 Ngày: ' +
        escapeHtml(art.reviewDate || 'Chưa ghi nhận') +
        '</div>' +
        '</div>';

      card.addEventListener('click', function () {
        openReaderModal(art.id);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openReaderModal(art.id);
        }
      });

      container.appendChild(card);
    });
  }

  function renderP1Sidebar() {
    const listEl = document.getElementById('p1QuickList');
    listEl.innerHTML = '';

    const p1Articles = articles.filter(function (a) {
      return String(a.severity).startsWith('P1');
    });

    if (p1Articles.length === 0) {
      listEl.innerHTML = '<li style="font-size:0.84rem; color:var(--text-muted);">Chưa có Runbook mức P1.</li>';
      return;
    }

    p1Articles.forEach(function (art) {
      const li = document.createElement('li');
      li.className = 'p1-item';
      li.tabIndex = 0;
      li.innerHTML =
        '<span class="p1-item-title">' +
        escapeHtml(art.title) +
        '</span>' +
        '<span class="p1-item-sub">' +
        escapeHtml(art.id) +
        ' • ' +
        escapeHtml(art.system) +
        '</span>';

      li.addEventListener('click', function () {
        openReaderModal(art.id);
      });
      listEl.appendChild(li);
    });
  }

  // Document Upload & Attachment Management
  function getFileIcon(fileName) {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (['doc', 'docx'].includes(ext)) return '📘';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📗';
    if (['ppt', 'pptx'].includes(ext)) return '📙';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return '🖼️';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    if (['txt', 'md', 'json', 'ps1', 'sh', 'py'].includes(ext)) return '📄';
    return '📎';
  }

  function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function downloadAttachment(dataUrl, fileName) {
    if (!dataUrl) {
      showToast('⚠️ Không tìm thấy nội dung file để tải về!');
      return;
    }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName || 'tai-lieu-ban-giao';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥 Đã tải xuống: ' + fileName);
  }

  function renderAttachmentsForReader(art) {
    const countEl = document.getElementById('readerAttachmentCount');
    const listEl = document.getElementById('readerAttachmentsList');
    if (!countEl || !listEl) return;

    if (!Array.isArray(art.attachments)) {
      art.attachments = [];
    }

    countEl.textContent = art.attachments.length;
    listEl.innerHTML = '';

    if (art.attachments.length === 0) {
      listEl.innerHTML =
        '<div style="grid-column: 1 / -1; font-size:0.82rem; color:var(--text-muted); font-style:italic; padding:8px 0;">' +
        'Chưa có tài liệu nào được tải lên cho hạng mục này. Hãy bấm "Tải lên tài liệu" hoặc kéo thả file để lưu trữ.' +
        '</div>';
      return;
    }

    art.attachments.forEach(function (att, idx) {
      const card = document.createElement('div');
      card.className = 'attachment-card';
      const icon = getFileIcon(att.name);
      const sizeStr = formatFileSize(att.size);
      const dateStr = att.uploadedAt || 'Mới tải';

      card.innerHTML =
        '<div class="attachment-icon">' + icon + '</div>' +
        '<div class="attachment-info">' +
        '  <div class="attachment-name" title="' + escapeHtml(att.name) + '">' + escapeHtml(att.name) + '</div>' +
        '  <div class="attachment-meta"><span>' + sizeStr + '</span><span>•</span><span>' + escapeHtml(dateStr) + '</span></div>' +
        '</div>' +
        '<div class="attachment-actions">' +
        '  <button type="button" class="btn btn-sm btn-primary" data-act="download" title="Tải về máy">📥 Tải về</button>' +
        (canCreateOrEdit() ? '  <button type="button" class="btn btn-sm btn-danger" data-act="delete" title="Xóa tài liệu">🗑️</button>' : '') +
        '</div>';

      card.querySelector('button[data-act="download"]').addEventListener('click', function () {
        downloadAttachment(att.dataUrl, att.name);
      });

      if (canCreateOrEdit()) {
        const delBtn = card.querySelector('button[data-act="delete"]');
        if (delBtn) {
          delBtn.addEventListener('click', function () {
            if (!confirm('Bạn có chắc muốn xóa tài liệu "' + att.name + '"?')) return;
            art.attachments.splice(idx, 1);
            saveArticles('kb(attachments): delete file ' + att.name + ' from ' + art.id);
            renderAttachmentsForReader(art);
            showToast('🗑️ Đã xóa tài liệu: ' + att.name);
          });
        }
      }

      listEl.appendChild(card);
    });
  }

  function processFilesUpload(art, files) {
    if (!files || files.length === 0) return;
    if (!canCreateOrEdit()) {
      showToast('🛑 Từ chối quyền: Bạn không có quyền tải lên tài liệu!');
      return;
    }

    if (!Array.isArray(art.attachments)) {
      art.attachments = [];
    }

    let loadedCount = 0;
    const totalFiles = files.length;
    showToast('⏳ Đang xử lý tải lên ' + totalFiles + ' tài liệu...');

    Array.from(files).forEach(function (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        art.attachments.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: e.target.result,
          uploadedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        });
        loadedCount++;
        if (loadedCount === totalFiles) {
          saveArticles('kb(attachments): uploaded ' + totalFiles + ' files to ' + art.id);
          renderAttachmentsForReader(art);
          showToast('✅ Đã tải lên và lưu trữ thành công ' + totalFiles + ' tài liệu!');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Repository Center Modal (7 Handover Groups Tree)
  function openRepoCenterModal() {
    const modal = document.getElementById('repoModal');
    if (!modal) return;
    renderRepoGroupsTree();
    modal.classList.add('open');
    modal.classList.add('active');
  }

  function closeRepoCenterModal() {
    const modal = document.getElementById('repoModal');
    if (modal) {
      modal.classList.remove('open');
      modal.classList.remove('active');
    }
  }

  function renderRepoGroupsTree() {
    const container = document.getElementById('repoGroupsContainer');
    if (!container) return;
    container.innerHTML = '';

    const groups = SYSTEM_CATEGORIES.filter(function (c) { return c.id !== 'ALL'; });
    groups.forEach(function (grp) {
      const groupArticles = articles.filter(function (a) { return a.system === grp.id; });
      let totalFiles = 0;
      groupArticles.forEach(function (a) {
        if (Array.isArray(a.attachments)) totalFiles += a.attachments.length;
      });

      const card = document.createElement('div');
      card.className = 'repo-folder-card';

      let itemsHtml = '';
      groupArticles.forEach(function (a) {
        const fileCount = Array.isArray(a.attachments) ? a.attachments.length : 0;
        itemsHtml +=
          '<li style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px dashed var(--border-color); font-size:0.84rem;">' +
          '  <span>' + escapeHtml(a.id) + ' • <strong>' + escapeHtml(a.title) + '</strong></span>' +
          '  <div style="display:flex; align-items:center; gap:8px;">' +
          '    <span style="font-size:0.75rem; color:var(--text-muted);">' + fileCount + ' file</span>' +
          '    <button type="button" class="btn btn-sm" data-open-art="' + escapeHtml(a.id) + '">📂 Mở &amp; Tải file</button>' +
          '  </div>' +
          '</li>';
      });

      card.innerHTML =
        '<div class="repo-folder-header">' +
        '  <div class="repo-folder-title">' + grp.icon + ' ' + escapeHtml(grp.name) + ' (' + groupArticles.length + ' hạng mục)</div>' +
        '  <span class="repo-folder-badge">📁 ' + totalFiles + ' tài liệu đã lưu</span>' +
        '</div>' +
        '<ul style="list-style:none; padding:0; margin:8px 0 0 0;">' +
        itemsHtml +
        '</ul>';

      card.querySelectorAll('button[data-open-art]').forEach(function (b) {
        b.addEventListener('click', function () {
          const artId = b.getAttribute('data-open-art');
          closeRepoCenterModal();
          openReaderModal(artId);
        });
      });

      container.appendChild(card);
    });
  }

  function openReaderModal(articleId) {
    const art = articles.find(function (a) {
      return a.id === articleId;
    });
    if (!art) return;

    activeReaderArticleId = art.id;
    applyRbacUiPolicy();

    const overdue = isReviewOverdue(art.reviewDate);
    const statusClass = overdue ? 'badge-review' : getStatusBadgeClass(art.status);
    const sevClass = getSeverityBadgeClass(art.severity);

    document.getElementById('readerBadges').innerHTML =
      '<span class="badge badge-doctype">' +
      escapeHtml(art.id) +
      ' • ' +
      escapeHtml(art.docType) +
      '</span>' +
      '<span class="badge ' +
      sevClass +
      '">' +
      escapeHtml(art.severity) +
      '</span>' +
      '<span class="badge ' +
      statusClass +
      '">' +
      escapeHtml(overdue ? 'Needs Review (Quá hạn)' : art.status) +
      '</span>' +
      '<span class="badge badge-doctype">🗂️ ' +
      escapeHtml(art.system) +
      '</span>';

    document.getElementById('readerTitle').textContent = art.title;
    document.getElementById('readerMeta').textContent =
      'Phụ trách (SME): ' +
      art.owner +
      '  |  Cập nhật: ' +
      art.updatedAt +
      '  |  Hạn rà soát tiếp theo: ' +
      art.reviewDate;

    const body = document.getElementById('readerBody');
    body.innerHTML = '';

    // 1. Summary Section
    const secSummary = document.createElement('div');
    secSummary.className = 'reader-section';
    secSummary.innerHTML =
      '<h3>1. Mục đích / Ghi chú bàn giao</h3>' +
      '<div class="reader-text">' +
      (art.summary && art.summary.trim()
        ? escapeHtml(art.summary)
        : '<p style="color:var(--text-muted); font-style:italic; margin:0;">(Chưa có nội dung — Người bàn giao bấm "✏️ Chỉnh sửa bài viết" để ghi chép trực tiếp vào đây)</p>') +
      '</div>';
    body.appendChild(secSummary);

    // 2. Diagnostic & Execution Steps
    const secSteps = document.createElement('div');
    secSteps.className = 'reader-section';
    secSteps.innerHTML =
      '<h3>2. Nội dung chi tiết &amp; Hướng dẫn vận hành</h3>' +
      '<div class="reader-text">' +
      (art.steps && art.steps.trim()
        ? escapeHtml(art.steps)
        : '<p style="color:var(--text-muted); font-style:italic; margin:0;">(Chưa có nội dung chi tiết — Người bàn giao bấm "✏️ Chỉnh sửa bài viết" để ghi chép các bước thao tác vào đây)</p>') +
      '</div>';
    body.appendChild(secSteps);

    // 3. CLI Commands with 1-Click Copy
    if (art.commands && art.commands.trim()) {
      const secCmd = document.createElement('div');
      secCmd.className = 'reader-section';
      secCmd.innerHTML =
        '<h3>3. Lệnh CLI / Script Thực thi (Copy 1 chạm)</h3>' +
        '<div class="code-block-wrapper">' +
        '<button type="button" class="copy-code-btn" id="btnCopyCli">📋 Copy CLI</button>' +
        '<pre class="code-block">' +
        escapeHtml(art.commands) +
        '</pre>' +
        '</div>';
      body.appendChild(secCmd);

      secCmd.querySelector('#btnCopyCli').addEventListener('click', function () {
        navigator.clipboard.writeText(art.commands).then(function () {
          showToast('✅ Đã sao chép lệnh CLI vào Clipboard!');
        });
      });
    }

    // 4. Rollback Plan
    if (art.rollback && art.rollback.trim()) {
      const secRollback = document.createElement('div');
      secRollback.className = 'reader-section';
      secRollback.innerHTML =
        '<h3>4. Kịch bản Khôi phục &amp; Rollback An toàn</h3>' +
        '<div class="reader-text">' +
        escapeHtml(art.rollback) +
        '</div>';
      body.appendChild(secRollback);
    }

    // 5. Interactive Verification Checklist
    if (Array.isArray(art.checklist) && art.checklist.length > 0) {
      const secCheck = document.createElement('div');
      secCheck.className = 'reader-section';
      const itemsHtml = art.checklist
        .map(function (item, idx) {
          return (
            '<li class="checklist-item">' +
            '<input type="checkbox" id="chk_' +
            idx +
            '" />' +
            '<label for="chk_' +
            idx +
            '">' +
            escapeHtml(item) +
            '</label>' +
            '</li>'
          );
        })
        .join('');
      secCheck.innerHTML =
        '<h3>5. Checklist Nghiệm thu Sau Thực Thi (Post-Execution Verification)</h3>' +
        '<ul class="checklist-box">' +
        itemsHtml +
        '</ul>';
      body.appendChild(secCheck);
    }

    renderAttachmentsForReader(art);
    document.getElementById('readerModal').classList.add('open');
  }

  function closeReaderModal() {
    document.getElementById('readerModal').classList.remove('open');
    activeReaderArticleId = null;
  }

  function openEditorModal(articleToEdit) {
    if (!canCreateOrEdit()) {
      showToast('🛑 Từ chối truy cập (RBAC): Vai trò Viewer chỉ có quyền đọc!');
      return;
    }

    const alertBox = document.getElementById('securityAlertBox');
    alertBox.classList.remove('visible');
    alertBox.textContent = '';

    if (articleToEdit) {
      document.getElementById('editorHeading').textContent = 'Chỉnh sửa Bài Viết: ' + articleToEdit.id;
      document.getElementById('editArticleId').value = articleToEdit.id;
      document.getElementById('inpTitle').value = articleToEdit.title;
      document.getElementById('inpDocType').value = articleToEdit.docType;
      document.getElementById('inpSystem').value = articleToEdit.system;
      document.getElementById('inpSeverity').value = articleToEdit.severity;
      document.getElementById('inpStatus').value = articleToEdit.status;
      document.getElementById('inpOwner').value = articleToEdit.owner;
      document.getElementById('inpReviewDate').value = articleToEdit.reviewDate || '2027-04-29';
      document.getElementById('inpSummary').value = articleToEdit.summary;
      document.getElementById('inpSteps').value = articleToEdit.steps;
      document.getElementById('inpCommands').value = articleToEdit.commands || '';
      document.getElementById('inpRollback').value = articleToEdit.rollback || '';
      document.getElementById('inpChecklist').value = (articleToEdit.checklist || []).join('\n');
      document.getElementById('inpTags').value = (articleToEdit.tags || []).join(', ');
    } else {
      document.getElementById('editorHeading').textContent = 'Tạo Bài Viết Kỹ Thuật Mới';
      document.getElementById('articleForm').reset();
      document.getElementById('editArticleId').value = '';
      if (githubUsername) {
        document.getElementById('inpOwner').value = '@' + githubUsername;
      }
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 180);
      document.getElementById('inpReviewDate').value = nextReview.toISOString().slice(0, 10);
    }

    document.getElementById('editorModal').classList.add('open');
  }

  function closeEditorModal() {
    document.getElementById('editorModal').classList.remove('open');
  }

  function openGitHubModal() {
    loadGitHubConfig();
    document.getElementById('githubModal').classList.add('open');
  }

  function closeGitHubModal() {
    document.getElementById('githubModal').classList.remove('open');
  }

  function applyTemplate(templateKey) {
    const tpl = ARTICLE_TEMPLATES[templateKey];
    if (!tpl) return;

    document.getElementById('inpDocType').value = tpl.docType;
    document.getElementById('inpSeverity').value = tpl.severity;
    document.getElementById('inpStatus').value = tpl.status;
    if (!document.getElementById('inpTitle').value.trim()) {
      document.getElementById('inpTitle').value = tpl.titlePrefix;
    }
    document.getElementById('inpSummary').value = tpl.summary;
    document.getElementById('inpSteps').value = tpl.steps;
    document.getElementById('inpCommands').value = tpl.commands;
    document.getElementById('inpRollback').value = tpl.rollback;
    document.getElementById('inpChecklist').value = tpl.checklist;
    showToast('⚡ Đã nạp khung mẫu ' + templateKey + '!');
  }

  function generateNextId() {
    let maxNum = 0;
    articles.forEach(function (a) {
      const m = String(a.id).match(/KB-IT-(\d+)/i);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const next = String(maxNum + 1).padStart(3, '0');
    return 'KB-IT-' + next;
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    if (!canCreateOrEdit()) {
      showToast('🛑 Từ chối truy cập (RBAC): Bạn không có quyền lưu bài viết!');
      return;
    }

    const editId = document.getElementById('editArticleId').value.trim();
    const title = document.getElementById('inpTitle').value.trim();
    const docType = document.getElementById('inpDocType').value;
    const system = document.getElementById('inpSystem').value;
    const severity = document.getElementById('inpSeverity').value;
    const status = document.getElementById('inpStatus').value;
    const owner = document.getElementById('inpOwner').value.trim();
    const reviewDate = document.getElementById('inpReviewDate').value;
    const summary = document.getElementById('inpSummary').value.trim();
    const steps = document.getElementById('inpSteps').value.trim();
    const commands = document.getElementById('inpCommands').value.trim();
    const rollback = document.getElementById('inpRollback').value.trim();
    const checklistRaw = document.getElementById('inpChecklist').value.trim();
    const tagsRaw = document.getElementById('inpTags').value.trim();

    // Tier 1 Security Check: Block plaintext secrets
    const combinedText = [title, summary, steps, commands, rollback].join('\n');
    const detectedSecret = detectPlaintextSecrets(combinedText);
    if (detectedSecret) {
      const alertBox = document.getElementById('securityAlertBox');
      alertBox.textContent =
        '🛑 CẢNH BÁO BẢO MẬT (Tier 1 Zero Secret Leakage): Phát hiện dữ liệu nhạy cảm dạng "' +
        detectedSecret +
        '" trong nội dung bài viết. Vui lòng thay thế bằng biến môi trường hoặc đường dẫn Vault trước khi lưu!';
      alertBox.classList.add('visible');
      return;
    }

    const checklist = checklistRaw
      ? checklistRaw
          .split(/\r?\n/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
      : [];

    const tags = tagsRaw
      ? tagsRaw
          .split(',')
          .map(function (s) {
            return s.trim().replace(/^#/, '');
          })
          .filter(Boolean)
      : [];

    const today = new Date().toISOString().slice(0, 10);
    let commitLog = '';

    if (editId) {
      const idx = articles.findIndex(function (a) {
        return a.id === editId;
      });
      if (idx !== -1) {
        articles[idx] = {
          id: editId,
          title: title,
          docType: docType,
          system: system,
          severity: severity,
          status: status,
          owner: owner,
          updatedAt: today,
          reviewDate: reviewDate,
          summary: summary,
          steps: steps,
          commands: commands,
          rollback: rollback,
          checklist: checklist,
          tags: tags
        };
      }
      commitLog = 'kb(update): ' + editId + ' - ' + title;
      showToast('✅ Đã cập nhật bài viết ' + editId + '!');
    } else {
      const newId = generateNextId();
      articles.unshift({
        id: newId,
        title: title,
        docType: docType,
        system: system,
        severity: severity,
        status: status,
        owner: owner,
        updatedAt: today,
        reviewDate: reviewDate,
        summary: summary,
        steps: steps,
        commands: commands,
        rollback: rollback,
        checklist: checklist,
        tags: tags
      });
      commitLog = 'kb(create): ' + newId + ' - ' + title;
      showToast('✅ Đã tạo bài viết mới ' + newId + '!');
    }

    saveArticles(commitLog);
    closeEditorModal();
    renderAll();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(articles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'it-knowledge-hub-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('⬇️ Đã xuất file JSON sao lưu thành công!');
  }

  function importJson(file) {
    if (!canDeleteOrImport()) {
      showToast('🛑 Chỉ vai trò Admin mới có quyền Nhập (Import) dữ liệu JSON!');
      return;
    }
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const parsed = JSON.parse(String(ev.target.result));
        if (!Array.isArray(parsed)) {
          throw new Error('File JSON phải là một mảng danh sách bài viết.');
        }
        articles = parsed;
        saveArticles('kb(import): bulk import ' + articles.length + ' articles');
        renderAll();
        showToast('⬆️ Đã nhập thành công ' + articles.length + ' bài viết từ JSON!');
      } catch (err) {
        showToast('❌ Lỗi định dạng file JSON: ' + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  function copyArticleAsMarkdown(articleId) {
    const art = articles.find(function (a) {
      return a.id === articleId;
    });
    if (!art) return;

    const md = [
      '# ' + art.title,
      '',
      '- **Mã tài liệu**: `' + art.id + '`',
      '- **Loại**: `' + art.docType + '` | **Hệ thống**: `' + art.system + '`',
      '- **Mức độ**: `' + art.severity + '` | **Trạng thái**: `' + art.status + '`',
      '- **Phụ trách (SME)**: ' + art.owner + ' | **Rà soát tiếp theo**: ' + art.reviewDate,
      '',
      '## 1. Triệu chứng / Mục đích',
      art.summary,
      '',
      '## 2. Các bước Chẩn đoán & Thực thi',
      art.steps,
      '',
      '## 3. Lệnh CLI / Script',
      '```bash',
      art.commands || '# N/A',
      '```',
      '',
      '## 4. Kịch bản Rollback',
      art.rollback || 'N/A',
      '',
      '## 5. Checklist Nghiệm thu',
      (art.checklist || []).map(function (c) { return '- [ ] ' + c; }).join('\n')
    ].join('\n');

    navigator.clipboard.writeText(md).then(function () {
      showToast('📋 Đã sao chép toàn bộ bài viết dạng Markdown!');
    });
  }

  function renderAll() {
    applyRbacUiPolicy();
    renderStats();
    renderCategories();
    renderArticlesFeed();
    renderP1Sidebar();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.getElementById('btnThemeToggle').addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      showToast(next === 'light' ? '☀️ Đã chuyển sang giao diện Sáng' : '🌙 Đã chuyển sang giao diện Tối');
    });
  }

  function bindEvents() {
    document.getElementById('searchInput').addEventListener('input', renderArticlesFeed);
    document.getElementById('filterDocType').addEventListener('change', renderArticlesFeed);
    document.getElementById('filterSeverity').addEventListener('change', renderArticlesFeed);
    document.getElementById('filterStatus').addEventListener('change', renderArticlesFeed);
    document.getElementById('sortOrder').addEventListener('change', renderArticlesFeed);

    document.getElementById('btnResetFilters').addEventListener('click', function () {
      selectedCategory = 'ALL';
      document.getElementById('searchInput').value = '';
      document.getElementById('filterDocType').value = 'ALL';
      document.getElementById('filterSeverity').value = 'ALL';
      document.getElementById('filterStatus').value = 'ALL';
      document.getElementById('sortOrder').value = 'severity';
      renderAll();
      showToast('🔄 Đã đặt lại toàn bộ bộ lọc');
    });

    document.getElementById('btnNewArticle').addEventListener('click', function () {
      openEditorModal(null);
    });

    // User Management Modal bindings
    const btnUserMgr = document.getElementById('btnUserManager');
    if (btnUserMgr) btnUserMgr.addEventListener('click', openUserModal);

    const btnGateUser = document.getElementById('btnGateUserLogin');
    if (btnGateUser) btnGateUser.addEventListener('click', openUserModal);

    const roleBadge = document.getElementById('currentRoleBadge');
    if (roleBadge) roleBadge.addEventListener('click', openUserModal);

    const btnCloseUser = document.getElementById('btnCloseUserModal');
    if (btnCloseUser) btnCloseUser.addEventListener('click', closeUserModal);

    const userForm = document.getElementById('createUserForm');
    if (userForm) userForm.addEventListener('submit', handleCreateUserSubmit);

    // Modal Backdrop click to close when clicking outside dialog
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
          backdrop.classList.remove('open');
          backdrop.classList.remove('active');
        }
      });
    });

    // Handover Document Repository Center bindings
    const btnRepo = document.getElementById('btnRepoCenter');
    if (btnRepo) btnRepo.addEventListener('click', openRepoCenterModal);

    const btnCloseRepo = document.getElementById('btnCloseRepoModal');
    if (btnCloseRepo) btnCloseRepo.addEventListener('click', closeRepoCenterModal);

    // Article Reader Document Upload bindings
    const btnUpload = document.getElementById('btnUploadDoc');
    const fileInp = document.getElementById('readerFileInput');
    const dropzone = document.getElementById('readerDropzone');

    if (btnUpload && fileInp) {
      btnUpload.addEventListener('click', function () {
        fileInp.click();
      });
    }

    if (fileInp) {
      fileInp.addEventListener('change', function (e) {
        if (!activeReaderArticleId) return;
        const art = articles.find(function (a) { return a.id === activeReaderArticleId; });
        if (art && e.target.files && e.target.files.length > 0) {
          processFilesUpload(art, e.target.files);
          fileInp.value = '';
        }
      });
    }

    if (dropzone) {
      dropzone.addEventListener('click', function () {
        if (fileInp) fileInp.click();
      });

      dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
        if (!activeReaderArticleId) return;
        const art = articles.find(function (a) { return a.id === activeReaderArticleId; });
        if (art && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processFilesUpload(art, e.dataTransfer.files);
        }
      });
    }

    document.getElementById('btnGitHubAuth').addEventListener('click', openGitHubModal);
    document.getElementById('btnGateLogin').addEventListener('click', openGitHubModal);
    document.getElementById('btnCloseGitHubModal').addEventListener('click', closeGitHubModal);

    document.getElementById('selRoleOverride').addEventListener('change', function (e) {
      currentRole = e.target.value;
      localStorage.setItem(RBAC_ROLE_KEY, currentRole);
      applyRbacUiPolicy();
      showToast('🔐 Đã chuyển vai trò RBAC sang: ' + currentRole);
    });

    document.getElementById('githubConfigForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      const repo = document.getElementById('ghRepo').value.trim();
      const branch = document.getElementById('ghBranch').value.trim() || 'main';
      const filePath = document.getElementById('ghFilePath').value.trim() || 'data/kb-seed.json';
      const strictGate = document.getElementById('ghStrictGate').value === 'true';
      const token = document.getElementById('ghToken').value.trim() || sessionStorage.getItem(GH_TOKEN_SESSION_KEY);

      if (!token) {
        showToast('⚠️ Vui lòng nhập GitHub Personal Access Token để xác thực!');
        return;
      }

      try {
        showToast('⏳ Đang xác thực quyền trên GitHub Repository...');
        await connectAndSyncFromGitHub(token, repo, branch, filePath, strictGate);
        closeGitHubModal();
        showToast('✅ Đã kết nối GitHub (@' + githubUsername + ' - Quyền: ' + currentRole + ')!');
      } catch (err) {
        showToast('❌ Lỗi kết nối GitHub: ' + err.message);
      }
    });

    document.getElementById('btnPushToGitHub').addEventListener('click', async function () {
      try {
        const ok = await pushArticlesToGitHub('kb(manual-sync): manual push from IT Knowledge Hub');
        if (ok) {
          showToast('☁️ Đã đẩy (Commit) toàn bộ bài viết lên GitHub thành công!');
        } else {
          showToast('⚠️ Hãy kết nối GitHub Token trước khi bấm Đẩy dữ liệu.');
        }
      } catch (err) {
        showToast('❌ Lỗi khi Commit lên GitHub: ' + err.message);
      }
    });

    document.getElementById('btnDisconnectGitHub').addEventListener('click', function () {
      sessionStorage.removeItem(GH_TOKEN_SESSION_KEY);
      githubUsername = null;
      githubFileSha = null;
      document.getElementById('ghToken').value = '';
      document.getElementById('ghConnectedUserLabel').textContent = 'Chế độ: Đã ngắt kết nối Token GitHub';
      applyRbacUiPolicy();
      showToast('🔒 Đã xóa Token khỏi phiên trình duyệt!');
    });

    document.getElementById('btnCloseReader').addEventListener('click', closeReaderModal);
    document.getElementById('btnCloseEditor').addEventListener('click', closeEditorModal);
    document.getElementById('btnCancelEditor').addEventListener('click', closeEditorModal);

    document.getElementById('btnEditCurrent').addEventListener('click', function () {
      const art = articles.find(function (a) {
        return a.id === activeReaderArticleId;
      });
      if (art) {
        closeReaderModal();
        openEditorModal(art);
      }
    });

    document.getElementById('btnCopyMarkdown').addEventListener('click', function () {
      if (activeReaderArticleId) {
        copyArticleAsMarkdown(activeReaderArticleId);
      }
    });

    document.getElementById('btnDeleteCurrent').addEventListener('click', function () {
      if (!canDeleteOrImport()) {
        showToast('🛑 Từ chối truy cập (RBAC): Chỉ Admin mới được xóa bài viết!');
        return;
      }
      if (!activeReaderArticleId) return;
      const targetId = activeReaderArticleId;
      articles = articles.filter(function (a) {
        return a.id !== targetId;
      });
      saveArticles('kb(delete): remove article ' + targetId);
      closeReaderModal();
      renderAll();
      showToast('🗑️ Đã xóa bài viết ' + targetId);
    });

    document.querySelectorAll('[data-template]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTemplate(btn.getAttribute('data-template'));
      });
    });

    document.getElementById('articleForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('btnExportJson').addEventListener('click', exportJson);

    const btnResetArticles = document.getElementById('btnResetArticles');
    if (btnResetArticles) {
      btnResetArticles.addEventListener('click', function () {
        if (!canDeleteOrImport()) {
          showToast('🛑 Từ chối truy cập: Chỉ Admin mới có quyền khởi tạo lại danh sách bàn giao!');
          return;
        }
        if (!confirm('Khởi tạo lại toàn bộ 15 hạng mục về trạng thái trắng để người bàn giao note trực tiếp?')) return;
        articles = JSON.parse(JSON.stringify(DEFAULT_ARTICLES));
        saveArticles('kb(reset): reset all articles to empty templates for direct handover notes');
        renderAll();
        showToast('🧹 Đã khởi tạo lại 15 hạng mục bàn giao trắng!');
      });
    }

    document.getElementById('inputImportJson').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) {
        importJson(e.target.files[0]);
        e.target.value = '';
      }
    });

    // Global Keyboard Shortcuts: Ctrl+K to search, Escape to close modals
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
      }
      if (e.key === 'Escape') {
        closeReaderModal();
        closeEditorModal();
        closeGitHubModal();
        closeUserModal();
        closeRepoCenterModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    bindEvents();
    loadArticles();
  });
})();
