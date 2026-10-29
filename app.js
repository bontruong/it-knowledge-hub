(function () {
  'use strict';

  const STORAGE_KEY = 'IT_KB_HUB_ARTICLES_V1';
  const THEME_KEY = 'IT_KB_HUB_THEME_V1';
  const RBAC_ROLE_KEY = 'IT_KB_HUB_ROLE_V1';
  const GH_CONFIG_KEY = 'IT_KB_HUB_GH_CONFIG_V1';
  const GH_TOKEN_SESSION_KEY = 'IT_KB_HUB_GH_PAT_SESSION';

  const SYSTEM_CATEGORIES = [
    { id: 'ALL', name: 'Tất cả hệ thống', icon: '🌐' },
    { id: 'Cloud & Infrastructure', name: 'Cloud & Infra', icon: '☁️' },
    { id: 'Network & Firewall', name: 'Network & Firewall', icon: '🛡️' },
    { id: 'Identity & Security (IAM)', name: 'Identity & IAM', icon: '🔐' },
    { id: 'Database & Storage', name: 'Database & Storage', icon: '🗄️' },
    { id: 'CI/CD & DevOps', name: 'CI/CD & DevOps', icon: '🚀' },
    { id: 'Endpoint & Helpdesk', name: 'Endpoint & Helpdesk', icon: '💻' }
  ];

  const DEFAULT_ARTICLES = [
    {
      id: 'KB-IT-001',
      title: '[RUNBOOK] Xử lý sự cố cạn kiệt Connection Pool trên PostgreSQL Production',
      docType: 'Runbook',
      system: 'Database & Storage',
      severity: 'P1 - Critical',
      status: 'Verified',
      owner: 'DBRE Team (dba-oncall)',
      updatedAt: '2026-10-29',
      reviewDate: '2027-04-29',
      summary: "Ứng dụng trả lỗi 'FATAL: remaining connection slots are reserved for non-replication superuser connections' (SQLSTATE 53300). Latency API tăng vọt và request bị timeout.",
      steps: "1. Kết nối vào cụm PostgreSQL Primary qua cổng quản trị dự phòng (Admin Port) hoặc PgBouncer console.\n2. Kiểm tra danh sách các tiến trình đang giữ kết nối ở trạng thái 'idle in transaction' quá 60 giây.\n3. Xác định microservice hoặc IP nguồn đang mở kết nối bất thường.\n4. Chạy lệnh ngắt các phiên bị treo quá hạn (không ngắt tiến trình replication/autovacuum).\n5. Nếu do spike lưu lượng hợp lệ, tăng tạm thời pool_size trên PgBouncer và scale-down số replica gây bão kết nối.",
      commands: "-- 1. Thống kê số lượng kết nối theo trạng thái và ứng dụng\nSELECT application_name, state, count(*)\nFROM pg_stat_activity\nGROUP BY application_name, state\nORDER BY count(*) DESC;\n\n-- 2. Ngắt các phiên 'idle in transaction' treo trên 5 phút\nSELECT pg_terminate_backend(pid)\nFROM pg_stat_activity\nWHERE state = 'idle in transaction'\n  AND usename <> 'postgres'\n  AND state_change < now() - interval '5 minutes';",
      rollback: 'Nếu việc ngắt kết nối làm một worker job bị lỗi lặp lại, hãy tạm dừng (pause) consumer queue tương ứng trên Kubernetes trước khi mở lại lưu lượng vào DB.',
      checklist: [
        'Số lượng active connections giảm xuống dưới 75% ngưỡng max_connections',
        "Không còn phiên 'idle in transaction' nào kéo dài quá 60 giây",
        'Tỷ lệ lỗi HTTP 5xx trên API Gateway về mức 0%',
        'Đã lưu log pg_stat_activity phục vụ báo cáo Postmortem'
      ],
      tags: ['postgresql', 'pgbouncer', 'connection-pool', 'p1-outage', 'sqlstate-53300']
    },
    {
      id: 'KB-IT-002',
      title: '[RUNBOOK] Ứng cứu Pod CrashLoopBackOff & OOMKilled trên Kubernetes Cluster',
      docType: 'Runbook',
      system: 'Cloud & Infrastructure',
      severity: 'P1 - Critical',
      status: 'Verified',
      owner: 'Platform Infra Team',
      updatedAt: '2026-10-28',
      reviewDate: '2027-03-15',
      summary: 'Pod dịch vụ cốt lõi khởi động lại liên tục với trạng thái CrashLoopBackOff hoặc Exit Code 137 (OOMKilled) làm suy giảm năng lực chịu tải.',
      steps: '1. Kiểm tra sự kiện (Events) và mã thoát (Exit Code) gần nhất của Pod.\n2. Nếu Exit Code = 137 (OOMKilled): Container vượt ngưỡng limits.memory. Kiểm tra biểu đồ bộ nhớ và tăng tạm thời memory limit hoặc rollback bản release vừa triển khai.\n3. Nếu Exit Code = 1 / 2: Đọc log của lần chạy trước (--previous) để tìm lỗi thiếu biến môi trường, ConfigMap hoặc lỗi kết nối phụ thuộc.\n4. Kiểm tra cấu hình livenessProbe (tránh đặt initialDelaySeconds quá ngắn khiến kubelet giết Pod khi đang khởi tạo).',
      commands: '# 1. Kiểm tra trạng thái Pod và lý do kết thúc lần trước\nkubectl describe pod <pod-name> -n <namespace>\n\n# 2. Xem log của container vừa bị crash trước đó\nkubectl logs <pod-name> -n <namespace> --previous --tail=100\n\n# 3. Rollback khẩn cấp Deployment về phiên bản ổn định liền trước\nkubectl rollout undo deployment/<deployment-name> -n <namespace>\nkubectl rollout status deployment/<deployment-name> -n <namespace>',
      rollback: "Sử dụng lệnh 'kubectl rollout undo' để quay về Revision ổn định trước đó trong vòng 60 giây nếu nguyên nhân đến từ bản build mới.",
      checklist: [
        'Tất cả các Pod trong Deployment đạt trạng thái Running (Ready 1/1)',
        'Số lần Restart không tăng thêm trong 15 phút theo dõi',
        'Đã kiểm tra chỉ số Memory Working Set so với ngưỡng limits.memory'
      ],
      tags: ['kubernetes', 'k8s', 'crashloopbackoff', 'oomkilled', 'exit-137']
    },
    {
      id: 'KB-IT-003',
      title: '[TROUBLESHOOTING] Xử lý lỗi mất phân giải DNS nội bộ & Split-Horizon VPN',
      docType: 'Troubleshooting',
      system: 'Network & Firewall',
      severity: 'P2 - High',
      status: 'Verified',
      owner: 'Network Engineering',
      updatedAt: '2026-10-25',
      reviewDate: '2027-02-20',
      summary: 'Người dùng kết nối VPN thành công nhưng không truy cập được các tên miền nội bộ (*.corp.internal) trong khi truy cập theo địa chỉ IP vẫn thông suốt.',
      steps: '1. Xác minh máy trạm đã nhận đúng DNS Server nội bộ từ VPN Concentrator hay đang bị đè bởi DNS công cộng (8.8.8.8 / 1.1.1.1) hoặc trình duyệt bật DoH (DNS over HTTPS).\n2. Dùng lệnh Resolve-DnsName chỉ định trực tiếp IP của Internal DNS Server để tách biệt lỗi do đường mạng (UDP/TCP 53) hay lỗi cấu hình NRPT (Name Resolution Policy Table).\n3. Xóa cache DNS cục bộ và kiểm tra bảng định tuyến (Route Table) tới dải mạng DNS nội bộ.',
      commands: '# 1. Kiểm tra cấu hình DNS trên từng card mạng và VPN adapter\nGet-DnsClientServerAddress | Format-Table InterfaceAlias, AddressFamily, ServerAddresses\n\n# 2. Kiểm tra phân giải tên miền nội bộ qua DNS Server nội bộ (VD: 10.10.1.53)\nResolve-DnsName -Name "git.corp.internal" -Server 10.10.1.53\n\n# 3. Kiểm tra chính sách NRPT và làm mới bộ đệm DNS\nGet-DnsClientNrptPolicy\nClear-DnsClientCache',
      rollback: 'Nếu lỗi do bản cập nhật VPN Profile mới, khôi phục profile XML cũ trong thư mục cấu hình VPN Client và ngắt kết nối lại.',
      checklist: [
        'Lệnh Resolve-DnsName trả về đúng IP Private của dịch vụ nội bộ',
        'Kết nối TCP 443 tới cổng dịch vụ nội bộ thành công',
        'Không làm gián đoạn đường truyền Internet thông thường (Split-Tunnel)'
      ],
      tags: ['dns', 'vpn', 'split-tunnel', 'nrpt', 'network']
    },
    {
      id: 'KB-IT-004',
      title: '[SOP] Quy trình cấp phát & thu hồi quyền truy cập Just-In-Time (JIT) trên Active Directory / Entra ID',
      docType: 'SOP',
      system: 'Identity & Security (IAM)',
      severity: 'P2 - High',
      status: 'Verified',
      owner: 'IAM & SecOps Team',
      updatedAt: '2026-10-24',
      reviewDate: '2027-04-24',
      summary: 'Quy trình chuẩn để cấp quyền quản trị tạm thời (Least Privilege) cho kỹ sư vận hành và thu hồi tự động khi hết thời hạn công việc.',
      steps: '1. Xác thực mã phiếu yêu cầu (Change/Incident Ticket ID) và người phê duyệt (Line Manager hoặc On-call Lead).\n2. Tuyệt đối KHÔNG thêm tài khoản cá nhân trực tiếp vào nhóm Domain Admins vĩnh viễn.\n3. Sử dụng tính năng Time-bound Group Membership (TTL) của Active Directory PAM hoặc Privileged Identity Management (PIM) với thời hạn tối đa 4 giờ.\n4. Ghi nhận log kiểm toán (Audit Log) kèm mã Ticket.',
      commands: '# Thêm thành viên vào nhóm bảo mật AD với thời hạn tự động thu hồi sau 240 phút (4 giờ)\n$ttl = New-TimeSpan -Minutes 240\nAdd-ADGroupMember -Identity "SG-Tier1-Server-Maintenance" -Members "engineer.account" -MemberTimeToLive $ttl\n\n# Kiểm tra thời gian hiệu lực còn lại của các thành viên trong nhóm\nGet-ADGroup "SG-Tier1-Server-Maintenance" -Property member -ShowMemberTimeToLive',
      rollback: "Để thu hồi quyền ngay lập tức trước thời hạn: chạy lệnh Remove-ADGroupMember -Identity 'SG-Tier1-Server-Maintenance' -Members 'engineer.account' -Confirm:$false",
      checklist: [
        'Tài khoản đã có thuộc tính TTL tự động hết hạn',
        'Kỹ sư xác nhận đăng nhập thành công qua Bastion Host',
        'Sự kiện thay đổi quyền (Event ID 4728 / 4732) đã được SIEM ghi nhận'
      ],
      tags: ['active-directory', 'iam', 'least-privilege', 'jit', 'security-sop']
    },
    {
      id: 'KB-IT-005',
      title: '[TROUBLESHOOTING] Xử lý lỗi đầy ổ đĩa & treo Runner trên hệ thống CI/CD Pipeline',
      docType: 'Troubleshooting',
      system: 'CI/CD & DevOps',
      severity: 'P2 - High',
      status: 'Needs Review',
      owner: 'DevOps Automation Team',
      updatedAt: '2026-09-10',
      reviewDate: '2026-10-20',
      summary: "Build job bị treo ở bước 'Preparing environment' hoặc báo lỗi 'no space left on device' do Docker build cache và dangling images tích tụ trên Self-hosted Runner.",
      steps: '1. Kiểm tra dung lượng phân vùng đĩa và inode trên máy chủ CI/CD Runner.\n2. Kiểm tra dung lượng chiếm dụng của Docker (Images, Containers, Local Volumes, Build Cache).\n3. Thực thi dọn dẹp các image/cache không còn sử dụng quá 72 giờ.\n4. Kiểm tra và kích hoạt lại systemd timer cho tác vụ dọn dẹp tự động hàng đêm.',
      commands: '# 1. Kiểm tra dung lượng ổ đĩa và chi tiết dung lượng Docker\ndf -h\ndocker system df\n\n# 2. Dọn dẹp an toàn các container đã dừng và build cache cũ hơn 72h\ndocker system prune -af --filter "until=72h"\ndocker builder prune -af --filter "until=72h"',
      rollback: 'Không xóa các Docker Volume đang gắn với dịch vụ lưu trữ bền vững (không thêm cờ --volumes khi chưa kiểm tra).',
      checklist: [
        'Dung lượng trống trên phân vùng /var/lib/docker đạt trên 30%',
        'Chạy thử nghiệm 1 Pipeline test thành công',
        'Đã bật cronjob/systemd-timer dọn cache định kỳ'
      ],
      tags: ['cicd', 'docker', 'runner', 'disk-full', 'devops']
    },
    {
      id: 'KB-IT-006',
      title: '[SOP] Quy trình chuẩn bị máy trạm & khắc phục lỗi BitLocker Recovery cho nhân sự (IT Helpdesk)',
      docType: 'SOP',
      system: 'Endpoint & Helpdesk',
      severity: 'P3 - Normal',
      status: 'Verified',
      owner: 'IT Service Desk',
      updatedAt: '2026-10-27',
      reviewDate: '2027-05-01',
      summary: 'Hướng dẫn kiểm tra trạng thái mã hóa ổ đĩa BitLocker, tạm dừng bảo vệ khi cập nhật BIOS/Firmware và tra cứu khóa khôi phục an toàn.',
      steps: '1. Trước khi cập nhật BIOS/UEFI hoặc thay đổi cấu hình phần cứng trên máy trạm Windows 11, bắt buộc tạm dừng (Suspend) BitLocker trong 1 lần khởi động lại để tránh bị hỏi Recovery Key.\n2. Nếu máy trạm đã rơi vào màn hình xanh BitLocker Recovery: Xác minh danh tính nhân sự qua cuộc gọi video/thẻ nhân viên trước khi tra cứu khóa 48 chữ số trên cổng quản trị Intune / AD.\n3. Sau khi vào lại Windows, kiểm tra trạng thái TPM 2.0 và kích hoạt lại các bộ bảo vệ (Protectors).',
      commands: '# 1. Kiểm tra trạng thái mã hóa BitLocker hiện tại\nGet-BitLockerVolume -MountPoint "C:" | Select-Object MountPoint, VolumeStatus, ProtectionStatus, KeyProtector\n\n# 2. Tạm dừng bảo vệ BitLocker trong 1 lần Reboot để cập nhật BIOS\nSuspend-BitLocker -MountPoint "C:" -RebootCount 1\n\n# 3. Bật lại bảo vệ BitLocker ngay lập tức\nResume-BitLocker -MountPoint "C:"',
      rollback: 'Nếu TPM báo lỗi sau khi nâng cấp BIOS, vào UEFI bật lại Security Chip / Intel PTT / AMD fTPM trước khi Resume-BitLocker.',
      checklist: [
        "ProtectionStatus hiển thị 'On' sau khi hoàn tất",
        'Recovery Key đã được đồng bộ (Escrow) lên Entra ID / Active Directory',
        'Đã đóng phiếu hỗ trợ người dùng'
      ],
      tags: ['bitlocker', 'windows-11', 'helpdesk', 'endpoint', 'tpm']
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
    const btnEdit = document.getElementById('btnEditCurrent');
    const btnDelete = document.getElementById('btnDeleteCurrent');
    const selRole = document.getElementById('selRoleOverride');

    if (selRole) selRole.value = currentRole;

    badge.className = 'role-pill';
    const userSuffix = githubUsername ? ' (@' + githubUsername + ')' : '';
    if (currentRole === 'Admin') {
      badge.classList.add('role-admin');
      badge.textContent = '👑 Quyền: Admin' + userSuffix;
    } else if (currentRole === 'Editor') {
      badge.classList.add('role-editor');
      badge.textContent = '✏️ Quyền: Editor' + userSuffix;
    } else {
      badge.classList.add('role-viewer');
      badge.textContent = '👁️ Quyền: Viewer' + userSuffix;
    }

    // Show/hide action buttons according to RBAC role
    if (btnNew) btnNew.style.display = canCreateOrEdit() ? 'inline-flex' : 'none';
    if (lblImport) lblImport.style.display = canDeleteOrImport() ? 'inline-flex' : 'none';
    if (btnEdit) btnEdit.style.display = canCreateOrEdit() ? 'inline-flex' : 'none';
    if (btnDelete) btnDelete.style.display = canDeleteOrImport() ? 'inline-flex' : 'none';

    // Strict Private Auth Gate enforcement
    const token = sessionStorage.getItem(GH_TOKEN_SESSION_KEY);
    const gateBanner = document.getElementById('authGateBanner');
    const workspace = document.getElementById('protectedWorkspace');
    if (githubConfig.strictGate && !token) {
      gateBanner.classList.add('active');
      workspace.style.display = 'none';
    } else {
      gateBanner.classList.remove('active');
      workspace.style.display = 'block';
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
          if (Array.isArray(seedData) && seedData.length > 0 && !localStorage.getItem(STORAGE_KEY)) {
            articles = seedData;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
            renderAll();
            return;
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
        escapeHtml(art.summary) +
        '</p>' +
        '<div class="article-meta">' +
        '<div class="tag-list">' +
        tagsHtml +
        '</div>' +
        '<div>👤 ' +
        escapeHtml(art.owner) +
        ' &nbsp;|&nbsp; 📅 Rà soát: ' +
        escapeHtml(art.reviewDate || 'N/A') +
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
      '<h3>1. Triệu chứng / Mục đích (Overview &amp; Symptoms)</h3>' +
      '<div class="reader-text">' +
      escapeHtml(art.summary) +
      '</div>';
    body.appendChild(secSummary);

    // 2. Diagnostic & Execution Steps
    const secSteps = document.createElement('div');
    secSteps.className = 'reader-section';
    secSteps.innerHTML =
      '<h3>2. Các bước Chẩn đoán &amp; Thực thi (Step-by-Step Procedure)</h3>' +
      '<div class="reader-text">' +
      escapeHtml(art.steps) +
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
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    bindEvents();
    loadArticles();
  });
})();
