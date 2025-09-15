// Digital Nomad Platform JavaScript

// Global state management
let currentUser = null;
let selectedUserType = null;
let currentStep = 1;
let selectedSkills = [];
let selectedLanguages = [];
let applications = [];
let savedTasks = [];

// Sample data from JSON
const platformData = {
  experts: [
    {
      id: 1,
      name: "陳文傑",
      title: "全端開發工程師",
      avatar: "👨‍💻",
      location: "峇里島, 印尼",
      timezone: "GMT+8",
      rating: 4.9,
      reviews: 127,
      responseTime: "1小時內",
      skills: ["React", "Node.js", "Python", "AWS"],
      languages: ["中文", "英文", "印尼文"],
      hourlyRate: "$45-65",
      completedProjects: 89,
      description: "5年全端開發經驗，專精於現代網頁應用開發。目前在峇里島享受數位遊牧生活，為全球客戶提供高品質的開發服務。",
      availability: "每週30小時",
      verified: true
    },
    {
      id: 2,
      name: "張美玲",
      title: "UI/UX 設計師",
      avatar: "👩‍🎨",
      location: "洛杉磯, 美國",
      timezone: "GMT+7",
      rating: 4.8,
      reviews: 94,
      responseTime: "2小時內",
      skills: ["Figma", "Adobe Creative Suite", "使用者研究", "原型設計"],
      languages: ["中文", "英文", "泰文"],
      hourlyRate: "$35-50",
      completedProjects: 76,
      description: "專業UI/UX設計師，致力於創造直觀易用的數位產品。在洛杉磯的共享工作空間工作，享受創意與科技的完美結合。",
      availability: "每週25小時",
      verified: true
    },
    {
      id: 3,
      name: "李建華",
      title: "數位行銷專家",
      avatar: "📱",
      location: "里斯本, 葡萄牙",
      timezone: "GMT+1",
      rating: 4.7,
      reviews: 156,
      responseTime: "30分鐘內",
      skills: ["Google Ads", "Facebook廣告", "SEO", "內容行銷"],
      languages: ["中文", "英文", "葡萄牙文"],
      hourlyRate: "$40-60",
      completedProjects: 134,
      description: "8年數位行銷經驗，專精於社群媒體和搜尋引擎行銷。在歐洲各地工作旅行，為亞洲企業開拓國際市場。",
      availability: "每週35小時",
      verified: true
    },
    {
      id: 4,
      name: "王雅婷",
      title: "內容創作 & 文案撰寫",
      avatar: "✍️",
      location: "墨西哥城, 墨西哥",
      timezone: "GMT-6",
      rating: 4.9,
      reviews: 89,
      responseTime: "1小時內",
      skills: ["內容策略", "文案撰寫", "部落格寫作", "社群經營"],
      languages: ["中文", "英文", "西班牙文"],
      hourlyRate: "$25-40",
      completedProjects: 98,
      description: "專業內容創作者，擅長品牌故事撰寫和社群內容策劃。在拉丁美洲體驗多元文化，為品牌創造有溫度的內容。",
      availability: "每週28小時",
      verified: true
    },
    {
      id: 5,
      name: "劉志明",
      title: "商業顧問",
      avatar: "💼",
      location: "杜拜, 阿聯",
      timezone: "GMT+4",
      rating: 5.0,
      reviews: 45,
      responseTime: "2小時內",
      skills: ["策略規劃", "市場分析", "營運優化", "財務規劃"],
      languages: ["中文", "英文", "阿拉伯文"],
      hourlyRate: "$80-120",
      completedProjects: 32,
      description: "15年企業顧問經驗，專精於中小企業策略規劃和國際市場進入。以杜拜為基地，服務中東和亞洲市場。",
      availability: "每週20小時",
      verified: true
    }
  ],

  tasks: [
    {
      id: 1,
      title: "電商網站全端開發",
      company: "創新科技有限公司",
      companyLogo: "🏢",
      budget: "$5000-8000",
      duration: "6-8週",
      category: "網頁開發",
      skills: ["React", "Node.js", "MongoDB", "支付整合"],
      description: "需要開發一個現代化的電商網站，包含商品管理、購物車、支付系統和後台管理功能。",
      applications: 12,
      posted: "2天前",
      deadline: "3天後",
      remote: true,
      timezone: "GMT+8",
      experienceLevel: "中級"
    },
    {
      id: 2,
      title: "品牌識別系統設計",
      company: "綠能創新公司",
      companyLogo: "🌱",
      budget: "$2500-4000",
      duration: "4週",
      category: "平面設計",
      skills: ["品牌設計", "Logo設計", "視覺識別", "包裝設計"],
      description: "為新創綠能公司設計完整的品牌識別系統，包含Logo、名片、包裝和網站視覺設計。",
      applications: 18,
      posted: "1天前",
      deadline: "5天後",
      remote: true,
      timezone: "任何時區",
      experienceLevel: "高級"
    },
    {
      id: 3,
      title: "數位行銷策略規劃",
      company: "時尚生活品牌",
      companyLogo: "👗",
      budget: "$3000-5000",
      duration: "持續3個月",
      category: "數位行銷",
      skills: ["社群行銷", "廣告投放", "KOL合作", "數據分析"],
      description: "為時尚品牌制定完整的數位行銷策略，包含社群經營、廣告投放和影響者合作計畫。",
      applications: 23,
      posted: "3天前",
      deadline: "1週後",
      remote: true,
      timezone: "GMT+8",
      experienceLevel: "中級"
    },
    {
      id: 4,
      title: "企業內訓課程開發",
      company: "人資管理顧問",
      companyLogo: "🎓",
      budget: "$4000-6000",
      duration: "8週",
      category: "教育訓練",
      skills: ["課程設計", "簡報製作", "線上教學", "評估系統"],
      description: "開發企業領導力培訓課程，包含線上學習平台、互動教材和學習成效評估系統。",
      applications: 8,
      posted: "1週前",
      deadline: "3天後",
      remote: true,
      timezone: "GMT+8",
      experienceLevel: "高級"
    },
    {
      id: 5,
      title: "手機App UI/UX改版",
      company: "健康科技新創",
      companyLogo: "📱",
      budget: "$3500-5500",
      duration: "6週",
      category: "UI/UX設計",
      skills: ["行動設計", "使用者研究", "Figma", "原型測試"],
      description: "重新設計健康管理App的使用者介面，提升使用體驗和用戶黏著度。需要進行使用者研究和A/B測試。",
      applications: 15,
      posted: "4天前",
      deadline: "1週後",
      remote: true,
      timezone: "GMT+8",
      experienceLevel: "中級"
    }
  ],

  destinations: [
    {
      name: "巴厘島, 印尼",
      nomadCount: 234,
      avgCost: "$800-1200/月",
      wifi: "優秀",
      coworking: 45,
      description: "數位遊牧天堂，低生活成本配合高品質網路"
    },
    {
      name: "清邁, 泰國",
      nomadCount: 189,
      avgCost: "$600-1000/月",
      wifi: "優秀", 
      coworking: 38,
      description: "傳統數位遊牧基地，完善的基礎設施"
    },
    {
      name: "里斯本, 葡萄牙",
      nomadCount: 156,
      avgCost: "$1200-1800/月",
      wifi: "優秀",
      coworking: 52,
      description: "歐洲數位遊牧熱點，溫和氣候和豐富文化"
    },
    {
      name: "墨西哥城, 墨西哥",
      nomadCount: 143,
      avgCost: "$700-1100/月",
      wifi: "良好",
      coworking: 29,
      description: "拉丁美洲的數位遊牧中心，文化豐富"
    }
  ],

  coworkingSpaces: [
    {
      name: "Hubud Bali",
      location: "烏布, 巴厘島",
      dayPass: "$12",
      monthlyPass: "$150",
      wifi: "100Mbps",
      amenities: ["會議室", "咖啡吧", "屋頂花園", "活動空間"]
    },
    {
      name: "CAMP Chiang Mai",
      location: "尼曼路, 清邁",
      dayPass: "$8",
      monthlyPass: "$120",
      wifi: "80Mbps",
      amenities: ["24小時開放", "影印設備", "休息區", "停車場"]
    },
    {
      name: "Second Home Lisboa",
      location: "梅爾卡多, 里斯本",
      dayPass: "$25",
      monthlyPass: "$280",
      wifi: "200Mbps",
      amenities: ["植物牆", "健身房", "餐廳", "活動廳"]
    }
  ],

  categories: [
    {name: "網頁開發", count: 145, icon: "💻"},
    {name: "平面設計", count: 128, icon: "🎨"},
    {name: "數位行銷", count: 167, icon: "📱"},
    {name: "內容創作", count: 98, icon: "✍️"},
    {name: "商業顧問", count: 76, icon: "💼"},
    {name: "UI/UX設計", count: 112, icon: "🖌️"},
    {name: "資料分析", count: 89, icon: "📊"},
    {name: "影片製作", count: 67, icon: "🎬"}
  ],

  statistics: {
    totalExperts: 300,
    activeProjects: 100,
    completedTasks: 500,
    averageEarnings: "$2340/月",
    nomadDestinations: 89
  }
};

// Task posting functionality
let taskSkills = [];

function openPostTaskModal() {
    document.getElementById('postTaskModal').classList.remove('hidden');
    taskSkills = []; // Reset skills
    updateTaskSkillsDisplay();
}

function addTaskSkill() {
    const skillInput = document.getElementById('taskSkillInput');
    const skill = skillInput.value.trim();
    
    if (skill && !taskSkills.includes(skill)) {
        taskSkills.push(skill);
        skillInput.value = '';
        updateTaskSkillsDisplay();
    }
}

function removeTaskSkill(skill) {
    taskSkills = taskSkills.filter(s => s !== skill);
    updateTaskSkillsDisplay();
}

function updateTaskSkillsDisplay() {
    const skillsContainer = document.getElementById('taskSkillsTags');
    skillsContainer.innerHTML = '';
    
    taskSkills.forEach(skill => {
        const skillTag = document.createElement('span');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `${skill} <span onclick="removeTaskSkill('${skill}')" style="cursor: pointer; margin-left: 4px;">&times;</span>`;
        skillsContainer.appendChild(skillTag);
    });
}

// Handle task skill input
document.addEventListener('DOMContentLoaded', function() {
    const taskSkillInput = document.getElementById('taskSkillInput');
    if (taskSkillInput) {
        taskSkillInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTaskSkill();
            }
        });
    }
    
    // Handle task form submission
    const postTaskForm = document.getElementById('postTaskForm');
    if (postTaskForm) {
        postTaskForm.addEventListener('submit', handleTaskSubmission);
    }
});

async function handleTaskSubmission(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
        showNotification('請先登入', 'error');
        return;
    }
    
    const formData = {
        title: document.getElementById('taskTitle').value,
        category: document.getElementById('taskCategory').value,
        description: document.getElementById('taskDescription').value,
        budget_min: parseInt(document.getElementById('budgetMin').value),
        budget_max: parseInt(document.getElementById('budgetMax').value),
        duration: document.getElementById('taskDuration').value,
        experience_level: document.getElementById('experienceLevel').value,
        deadline: document.getElementById('taskDeadline').value,
        timezone: document.getElementById('taskTimezone').value,
        skills: taskSkills,
        client_id: currentUser.id,
        status: 'open'
    };
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification('任務發布成功！', 'success');
            closeModal('postTaskModal');
            
            // Reset form
            document.getElementById('postTaskForm').reset();
            taskSkills = [];
            updateTaskSkillsDisplay();
            
            // Refresh the marketplace to show the new task
            setTimeout(() => {
                loadAndPopulateTasks();
            }, 1000);
        } else {
            const error = await response.json();
            showNotification('發布失敗：' + (error.message || '請稍後再試'), 'error');
        }
    } catch (error) {
        console.error('Error posting task:', error);
        showNotification('發布失敗：網絡錯誤', 'error');
    }
}

// Generate a simple UUID-like ID for demo purposes
function generateSimpleUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Load and display my tasks
async function loadMyTasks() {
  if (!currentUser) {
    console.log('No current user, cannot load tasks');
    return;
  }
  
  console.log('Loading tasks for user:', currentUser.id);
  
  try {
    const response = await fetch(`/api/my-tasks?client_id=${currentUser.id}`);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const tasks = await response.json();
      console.log('Loaded tasks:', tasks);
      displayMyTasks(tasks);
      updateTaskStats(tasks);
    } else {
      const errorText = await response.text();
      console.error('Failed to load tasks:', response.status, errorText);
      showNotification('載入任務失敗', 'error');
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    showNotification('載入任務時發生錯誤', 'error');
  }
}

function displayMyTasks(tasks) {
  const container = document.getElementById('myTasksList');
  if (!container) return;
  
  if (tasks.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-20);">尚未發布任何任務</p>';
    return;
  }
  
  container.innerHTML = tasks.map(task => `
    <div class="task-card" style="padding: var(--space-16); background: var(--color-bg-1); border-radius: var(--radius-base); border: 1px solid var(--color-border);">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-12);">
        <h4 style="margin: 0; color: var(--color-text-primary);">${task.title}</h4>
        <span class="task-status" style="padding: var(--space-4) var(--space-8); border-radius: var(--radius-sm); font-size: var(--font-size-sm); background: ${getStatusColor(task.status)}; color: white;">
          ${getStatusText(task.status)}
        </span>
      </div>
      
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-12); line-height: 1.5;">
        ${task.description.length > 150 ? task.description.substring(0, 150) + '...' : task.description}
      </p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-12); margin-bottom: var(--space-16);">
        <div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">預算</div>
          <div style="font-weight: var(--font-weight-medium);">$${task.budget_min} - $${task.budget_max}</div>
        </div>
        <div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">類別</div>
          <div style="font-weight: var(--font-weight-medium);">${task.category_name || '未分類'}</div>
        </div>
        <div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">申請數</div>
          <div style="font-weight: var(--font-weight-medium); color: var(--color-primary);">${task.application_count || 0}</div>
        </div>
        <div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">發布時間</div>
          <div style="font-weight: var(--font-weight-medium);">${new Date(task.created_at).toLocaleDateString('zh-TW')}</div>
        </div>
      </div>
      
      <div style="display: flex; gap: var(--space-8);">
        <button class="btn btn--primary btn--sm" onclick="viewTaskApplications('${task.id}')">
          查看申請 (${task.application_count || 0})
        </button>
        <button class="btn btn--outline btn--sm" onclick="editTask('${task.id}')">
          編輯任務
        </button>
      </div>
    </div>
  `).join('');
}

function updateTaskStats(tasks) {
  const totalTasks = tasks.length;
  const totalApplications = tasks.reduce((sum, task) => sum + (task.application_count || 0), 0);
  const activeProjects = tasks.filter(task => task.status === 'in_progress').length;
  
  const totalTasksEl = document.getElementById('totalTasks');
  const totalApplicationsEl = document.getElementById('totalApplications');
  const activeProjectsEl = document.getElementById('activeProjects');
  
  if (totalTasksEl) totalTasksEl.textContent = totalTasks;
  if (totalApplicationsEl) totalApplicationsEl.textContent = totalApplications;
  if (activeProjectsEl) activeProjectsEl.textContent = activeProjects;
}

function getStatusColor(status) {
  switch (status) {
    case 'open': return 'var(--color-success)';
    case 'in_progress': return 'var(--color-warning)';
    case 'completed': return 'var(--color-info)';
    case 'cancelled': return 'var(--color-error)';
    default: return 'var(--color-text-secondary)';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'open': return '開放中';
    case 'in_progress': return '進行中';
    case 'completed': return '已完成';
    case 'cancelled': return '已取消';
    default: return '未知';
  }
}

function showMyTasks() {
  console.log('showMyTasks called');
  loadMyTasks();
  
  // Also refresh the portal to show updated task list
  if (currentUser && currentUser.type === 'client') {
    populateClientPortal(document.getElementById('portalContent'));
  }
}

async function viewTaskApplications(taskId) {
  console.log('View applications for task:', taskId);
  
  try {
    // Fetch applications for this task
    const response = await fetch(`/api/task-applications?task_id=${taskId}`);
    
    if (response.ok) {
      const applications = await response.json();
      console.log('Loaded applications:', applications);
      displayTaskApplications(taskId, applications);
    } else {
      console.error('Failed to load applications');
      showNotification('載入申請失敗', 'error');
    }
  } catch (error) {
    console.error('Error loading applications:', error);
    showNotification('載入申請時發生錯誤', 'error');
  }
}

function displayTaskApplications(taskId, applications) {
  const modal = document.getElementById('taskApplicationsModal');
  const title = document.getElementById('taskApplicationsModalTitle');
  const content = document.getElementById('taskApplicationsContent');
  
  // Store task ID for later use
  modal.dataset.taskId = taskId;
  
  // Find the task to get its title
  const task = platformData.tasks.find(t => t.id === taskId);
  const taskTitle = task ? task.title : '任務';
  
  title.textContent = `${taskTitle} - 申請者 (${applications.length})`;
  
  if (applications.length === 0) {
    content.innerHTML = `
      <div style="text-align: center; padding: var(--space-40); color: var(--color-text-secondary);">
        <div style="font-size: 3rem; margin-bottom: var(--space-16);">📝</div>
        <h4>尚無申請者</h4>
        <p>此任務目前還沒有收到任何申請</p>
      </div>
    `;
  } else {
    content.innerHTML = applications.map(app => `
      <div class="application-card" style="padding: var(--space-20); background: var(--color-bg-1); border-radius: var(--radius-base); border: 1px solid var(--color-border); margin-bottom: var(--space-16);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-16);">
          <div style="display: flex; align-items: center; gap: var(--space-12);">
            <div style="width: 48px; height: 48px; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">
              ${app.expert_name ? app.expert_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h4 style="margin: 0; color: var(--color-text-primary);">${app.expert_name || '未知申請者'}</h4>
              <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                ${app.expert_email || ''}
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="application-status" style="padding: var(--space-4) var(--space-8); border-radius: var(--radius-sm); font-size: var(--font-size-sm); background: ${getApplicationStatusColor(app.status)}; color: white; margin-bottom: var(--space-8);">
              ${getApplicationStatusText(app.status)}
            </div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
              ${new Date(app.created_at).toLocaleDateString('zh-TW')}
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-16); margin-bottom: var(--space-16);">
          <div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">提案金額</div>
            <div style="font-weight: var(--font-weight-medium); color: var(--color-success);">$${app.bid_amount}</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">交付時間</div>
            <div style="font-weight: var(--font-weight-medium);">${app.delivery_time} 天</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">評分</div>
            <div style="font-weight: var(--font-weight-medium);">${app.rating || '新用戶'}</div>
          </div>
          <div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">完成項目</div>
            <div style="font-weight: var(--font-weight-medium);">${app.completed_projects || 0}</div>
          </div>
        </div>
        
        <div style="margin-bottom: var(--space-16);">
          <h5 style="margin-bottom: var(--space-8);">提案內容</h5>
          <p style="color: var(--color-text-secondary); line-height: 1.6; background: var(--color-bg-2); padding: var(--space-12); border-radius: var(--radius-sm);">
            ${app.proposal_text || '無提案內容'}
          </p>
        </div>
        
        ${app.portfolio_link ? `
        <div style="margin-bottom: var(--space-16);">
          <h5 style="margin-bottom: var(--space-8);">作品集</h5>
          <a href="${app.portfolio_link}" target="_blank" style="color: var(--color-primary); text-decoration: none;">
            ${app.portfolio_link}
          </a>
        </div>
        ` : ''}
        
        ${app.expert_skills && app.expert_skills.length > 0 ? `
        <div style="margin-bottom: var(--space-16);">
          <h5 style="margin-bottom: var(--space-8);">專業技能</h5>
          <div class="expert-skills">
            ${app.expert_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        
        <div style="display: flex; gap: var(--space-8); justify-content: flex-end; flex-wrap: wrap;">
          <button class="btn btn--outline btn--sm" onclick="rejectApplication('${app.id}')">
            拒絕
          </button>
          <button class="btn btn--outline btn--sm" onclick="scheduleInterview('${app.id}', '${app.expert_name}')">
            安排面試
          </button>
          <button class="btn btn--primary btn--sm" onclick="acceptApplication('${app.id}')">
            接受申請
          </button>
        </div>
      </div>
    `).join('');
  }
  
  modal.classList.remove('hidden');
}

function getApplicationStatusColor(status) {
  switch (status) {
    case 'pending': return 'var(--color-warning)';
    case 'interview_scheduled': return 'var(--color-info)';
    case 'interview_completed': return 'var(--color-primary)';
    case 'accepted': return 'var(--color-success)';
    case 'rejected': return 'var(--color-error)';
    case 'withdrawn': return 'var(--color-text-secondary)';
    default: return 'var(--color-text-secondary)';
  }
}

function getApplicationStatusText(status) {
  switch (status) {
    case 'pending': return '待審核';
    case 'interview_scheduled': return '已安排面試';
    case 'interview_completed': return '面試完成';
    case 'accepted': return '已接受';
    case 'rejected': return '已拒絕';
    case 'withdrawn': return '已撤回';
    default: return '未知';
  }
}

function scheduleInterview(applicationId, applicantName) {
  console.log('Schedule interview for application:', applicationId);
  
  // Store the application ID for the form submission
  document.getElementById('interviewModal').dataset.applicationId = applicationId;
  document.getElementById('interviewApplicantName').value = applicantName;
  
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('interviewDate').value = tomorrow.toISOString().split('T')[0];
  
  // Set default time to 2 PM
  document.getElementById('interviewTime').value = '14:00';
  
  closeModal('taskApplicationsModal');
  openModal('interview');
}

async function acceptApplication(applicationId) {
  console.log('Accept application:', applicationId);
  
  try {
    const response = await fetch(`/api/task-applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'accepted'
      })
    });
    
    if (response.ok) {
      showNotification('申請已接受！', 'success');
      // Refresh the applications view
      const taskId = document.getElementById('taskApplicationsModal').dataset.taskId;
      if (taskId) {
        viewTaskApplications(taskId);
      }
    } else {
      const error = await response.json();
      showNotification('操作失敗：' + (error.error || '請稍後再試'), 'error');
    }
  } catch (error) {
    console.error('Error accepting application:', error);
    showNotification('操作失敗：網絡錯誤', 'error');
  }
}

async function rejectApplication(applicationId) {
  console.log('Reject application:', applicationId);
  
  if (!confirm('確定要拒絕此申請嗎？此操作無法撤銷。')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/task-applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'rejected'
      })
    });
    
    if (response.ok) {
      showNotification('申請已拒絕', 'info');
      // Refresh the applications view
      const taskId = document.getElementById('taskApplicationsModal').dataset.taskId;
      if (taskId) {
        viewTaskApplications(taskId);
      }
    } else {
      const error = await response.json();
      showNotification('操作失敗：' + (error.error || '請稍後再試'), 'error');
    }
  } catch (error) {
    console.error('Error rejecting application:', error);
    showNotification('操作失敗：網絡錯誤', 'error');
  }
}

async function handleInterviewScheduling() {
  const applicationId = document.getElementById('interviewModal').dataset.applicationId;
  const date = document.getElementById('interviewDate').value;
  const time = document.getElementById('interviewTime').value;
  const type = document.getElementById('interviewType').value;
  const location = document.getElementById('interviewLocation').value;
  const notes = document.getElementById('interviewNotes').value;
  
  if (!date || !time || !type) {
    showNotification('請填寫所有必填欄位', 'error');
    return;
  }
  
  try {
    // For now, we'll store the interview data locally and update the application status
    // In a real app, this would be stored in the database
    const interviewData = {
      applicationId: applicationId,
      date: date,
      time: time,
      type: type,
      location: location,
      notes: notes,
      scheduledAt: new Date().toISOString()
    };
    
    // Store interview data locally
    let interviews = JSON.parse(localStorage.getItem('scheduledInterviews') || '[]');
    interviews.push(interviewData);
    localStorage.setItem('scheduledInterviews', JSON.stringify(interviews));
    
    // Update application status to "interview_scheduled"
    const response = await fetch(`/api/task-applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'interview_scheduled',
        interview_date: date,
        interview_time: time,
        interview_type: type,
        interview_location: location,
        interview_notes: notes
      })
    });
    
    if (response.ok) {
      showNotification('面試已安排！', 'success');
      closeModal('interviewModal');
      
      // Clear form
      document.getElementById('interviewForm').reset();
      
      // Refresh the applications view
      const taskId = document.getElementById('taskApplicationsModal').dataset.taskId;
      if (taskId) {
        viewTaskApplications(taskId);
      }
    } else {
      const error = await response.json();
      showNotification('安排面試失敗：' + (error.error || '請稍後再試'), 'error');
    }
  } catch (error) {
    console.error('Error scheduling interview:', error);
    showNotification('安排面試失敗：網絡錯誤', 'error');
  }
}

function editTask(taskId) {
  // This will open the task editing modal
  console.log('Edit task:', taskId);
  // TODO: Implement task editing
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
  // Check if user is logged in
  try {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      updateAuthState();
    }

    const savedApplications = localStorage.getItem('applications');
    if (savedApplications) {
      applications = JSON.parse(savedApplications);
    }

    const savedTasksList = localStorage.getItem('savedTasks');
    if (savedTasksList) {
      savedTasks = JSON.parse(savedTasksList);
    }
  } catch (e) {
    console.log('Error loading saved data:', e);
  }

  // Populate initial data
  populateCategories();
  populateDestinations();
  populateExperts();
  loadAndPopulateTasks(); // Load real tasks from API
  populateCoworkingSpaces();
  animateCounters();
  
  // Set up event listeners
  setupEventListeners();
  setupFormHandlers();
  setupSkillsInput();
  setupLanguagesInput();
}

// Event Listeners Setup
function setupEventListeners() {
  // Logo click
  const logo = document.querySelector('.logo h2');
  if (logo) {
    logo.addEventListener('click', () => showSection('home'));
  }

  // Remove all onclick attributes and replace with proper event listeners
  document.querySelectorAll('[onclick]').forEach(element => {
    element.removeAttribute('onclick');
  });

  // Navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#') {
      const text = link.textContent.trim();
      link.addEventListener('click', function(e) {
        e.preventDefault();
        switch(text) {
          case '首頁':
            showSection('home');
            break;
          case '專家':
            showSection('experts');
            break;
          case '任務':
            showSection('tasks');
            break;
        }
      });
    }
  });

  // Hero buttons
  document.querySelectorAll('.hero-buttons .btn').forEach(btn => {
    const text = btn.textContent.trim();
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (text === '成為專家') {
        openModal('register', 'expert');
      } else if (text === '發布任務') {
        openModal('register', 'client');
      }
    });
  });

  // Auth buttons will be handled by updateAuthState()
  
  // Search functionality
  const expertSearchBtn = document.querySelector('#experts .search-bar .btn');
  if (expertSearchBtn) {
    expertSearchBtn.addEventListener('click', searchExperts);
  }

  const taskSearchBtn = document.querySelector('#tasks .search-bar .btn');
  if (taskSearchBtn) {
    taskSearchBtn.addEventListener('click', searchTasks);
  }

  // Filter changes
  ['skillFilter', 'locationFilter', 'rateFilter'].forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', searchExperts);
    }
  });

  ['taskCategoryFilter', 'budgetFilter'].forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', searchTasks);
    }
  });

  // Search on Enter key
  const expertSearch = document.getElementById('expertSearch');
  if (expertSearch) {
    expertSearch.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchExperts();
      }
    });
  }

  const taskSearch = document.getElementById('taskSearch');
  if (taskSearch) {
    taskSearch.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchTasks();
      }
    });
  }

  // Modal backdrop and close buttons
  document.querySelectorAll('.modal-backdrop, .modal-close').forEach(element => {
    element.addEventListener('click', function(e) {
      const modal = e.target.closest('.modal');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
}

// Form handlers setup
function setupFormHandlers() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleLogin();
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleRegister();
    });
  }

  // Application form
  const applicationForm = document.getElementById('applicationForm');
  if (applicationForm) {
    applicationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleTaskApplication();
    });
  }

  // Interview form
  const interviewForm = document.getElementById('interviewForm');
  if (interviewForm) {
    interviewForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleInterviewScheduling();
    });
  }

  // Type selection buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.innerHTML.includes('專家') ? 'expert' : 'client';
      selectUserType(type);
    });
  });

  // Step navigation buttons
  setTimeout(() => {
    const nextBtn = document.querySelector('button[type="button"]:not(.type-btn):not(.btn--outline)');
    if (nextBtn && nextBtn.textContent.includes('下一步')) {
      nextBtn.addEventListener('click', nextStep);
    }

    const prevBtn = document.querySelector('.btn--outline');
    if (prevBtn && prevBtn.textContent.includes('上一步')) {
      prevBtn.addEventListener('click', prevStep);
    }
  }, 500);
}

// Navigation functions
function showSection(sectionName) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  if (sectionName === 'portal') {
    if (!currentUser) {
      openModal('login');
      showSection('home');
      return;
    }
    populatePortal();
  }
}

// Modal functions
function openModal(modalName, userType = null) {
  const modal = document.getElementById(modalName + 'Modal');
  if (modal) {
    modal.classList.remove('hidden');
    
    if (modalName === 'register' && userType) {
      selectedUserType = userType;
      document.getElementById('userTypeSelection').classList.add('hidden');
      document.getElementById('registerForm').classList.remove('hidden');
      updateFormFields();
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    
    if (modalId === 'registerModal') {
      resetRegisterForm();
    }
  }
}

// User type selection
function selectUserType(type) {
  selectedUserType = type;
  document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('selected'));
  event.target.closest('.type-btn').classList.add('selected');
  
  setTimeout(() => {
    document.getElementById('userTypeSelection').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    updateFormFields();
    
    // Re-setup step navigation buttons after form is shown
    setTimeout(() => {
      const nextBtn = document.querySelector('#step1 button[type="button"]');
      if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
      }
    }, 100);
  }, 300);
}

function updateFormFields() {
  const expertFields = document.getElementById('expertFields');
  const clientFields = document.getElementById('clientFields');
  const step2Title = document.getElementById('step2Title');
  
  if (selectedUserType === 'expert') {
    expertFields.classList.remove('hidden');
    clientFields.classList.add('hidden');
    step2Title.textContent = '專家資料';
  } else {
    expertFields.classList.add('hidden');
    clientFields.classList.remove('hidden');
    step2Title.textContent = '企業資料';
  }
}

// Form step navigation
function nextStep() {
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (!name || !email || !password) {
    showNotification('請填寫所有必填欄位', 'error');
    return;
  }
  
  currentStep++;
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
  
  // Setup prev button listener
  setTimeout(() => {
    const prevBtn = document.querySelector('#step2 .btn--outline');
    if (prevBtn) {
      prevBtn.addEventListener('click', prevStep);
    }
  }, 100);
}

function prevStep() {
  currentStep--;
  document.getElementById('step1').classList.remove('hidden');
  document.getElementById('step2').classList.add('hidden');
}

// Skills input handling
function setupSkillsInput() {
  const skillInput = document.getElementById('skillInput');
  if (skillInput) {
    skillInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const skill = this.value.trim();
        if (skill) {
          addSkill(skill);
          this.value = '';
        }
      }
    });
  }
}

function setupLanguagesInput() {
  const languageInput = document.getElementById('languageInput');
  if (languageInput) {
    languageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const language = this.value.trim();
        if (language) {
          addLanguage(language);
          this.value = '';
        }
      }
    });
  }
}

function addSkill(skillName) {
  if (skillName && !selectedSkills.includes(skillName)) {
    selectedSkills.push(skillName);
    updateSkillsTags();
  }
}

function removeSkill(skillName) {
  selectedSkills = selectedSkills.filter(skill => skill !== skillName);
  updateSkillsTags();
}

function updateSkillsTags() {
  const tagsContainer = document.getElementById('skillsTags');
  if (!tagsContainer) return;
  
  tagsContainer.innerHTML = '';
  
  selectedSkills.forEach(skill => {
    const tag = document.createElement('div');
    tag.className = 'skill-tag-input';
    tag.innerHTML = `
      ${skill}
      <button type="button" class="skill-tag-remove">&times;</button>
    `;
    
    const removeBtn = tag.querySelector('.skill-tag-remove');
    removeBtn.addEventListener('click', () => removeSkill(skill));
    
    tagsContainer.appendChild(tag);
  });
}

function addLanguage(languageName) {
  if (languageName && !selectedLanguages.includes(languageName)) {
    selectedLanguages.push(languageName);
    updateLanguagesTags();
  }
}

function removeLanguage(languageName) {
  selectedLanguages = selectedLanguages.filter(lang => lang !== languageName);
  updateLanguagesTags();
}

function updateLanguagesTags() {
  const tagsContainer = document.getElementById('languagesTags');
  if (!tagsContainer) return;
  
  tagsContainer.innerHTML = '';
  
  selectedLanguages.forEach(language => {
    const tag = document.createElement('div');
    tag.className = 'language-tag-input';
    tag.innerHTML = `
      ${language}
      <button type="button" class="language-tag-remove">&times;</button>
    `;
    
    const removeBtn = tag.querySelector('.language-tag-remove');
    removeBtn.addEventListener('click', () => removeLanguage(language));
    
    tagsContainer.appendChild(tag);
  });
}

// Authentication
async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (email && password) {
    try {
      // First, try to find existing user
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      let user;
      
      if (response.ok) {
        const users = await response.json();
        if (users.length > 0) {
          user = users[0];
          console.log('Found existing user:', user);
        }
      }
      
      // If user doesn't exist, suggest registration
      if (!user) {
        showNotification('此帳號尚未註冊，請先註冊或檢查電子郵件地址', 'error');
        // Optionally switch to register modal
        setTimeout(() => {
          closeModal('loginModal');
          openModal('register');
        }, 2000);
        return;
      }
      
      // Set up current user with additional demo data
      currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.user_type,
        verified: user.verified || false,
        skills: [],
        languages: [],
        applications: [],
        profileComplete: 60,
        location: "台北, 台灣",
        hourlyRate: "$40-60",
        completedProjects: Math.floor(Math.random() * 50) + 10
      };
      
      try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } catch (e) {
        console.log('Could not save to localStorage:', e);
      }
      
      updateAuthState();
      closeModal('loginModal');
      showNotification('登入成功！', 'success');
      showSection('portal');
      
    } catch (error) {
      console.error('Login error:', error);
      showNotification('登入失敗：' + error.message, 'error');
    }
  }
}

async function handleRegister() {
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone').value;
  const bio = document.getElementById('bio').value;
  
  if (!name || !email || !password) {
    showNotification('請填寫所有必填欄位', 'error');
    return;
  }
  
  try {
    // First, check if user already exists
    const checkResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) {
        showNotification('此電子郵件地址已經註冊，請直接登入', 'error');
        // Switch to login modal
        setTimeout(() => {
          closeModal('registerModal');
          openModal('login');
          // Pre-fill the email field
          document.getElementById('loginEmail').value = email;
        }, 2000);
        return;
      }
    }
    
    // Create user in database
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password_hash: 'demo_hash', // In a real app, this would be properly hashed
        name: name,
        user_type: selectedUserType,
        phone: phone,
        bio: bio
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      const dbUser = result.user;
      
      // Set up current user with additional demo data
      const newUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone,
        type: dbUser.user_type,
        verified: dbUser.verified,
        bio: dbUser.bio,
        skills: [...selectedSkills],
        languages: [...selectedLanguages],
        profileComplete: calculateProfileCompletion(),
        applications: [],
        savedTasks: []
      };
      
      if (selectedUserType === 'expert') {
        newUser.hourlyRate = document.getElementById('hourlyRate').value;
        newUser.location = document.getElementById('currentLocation').value;
        newUser.completedProjects = 0;
        newUser.rating = 0;
        newUser.reviews = 0;
        newUser.responseTime = "新用戶";
        newUser.availability = "可接案";
      } else {
        newUser.companySize = document.getElementById('companySize').value;
        newUser.industry = document.getElementById('industry').value;
        newUser.postedTasks = [];
      }
      
      currentUser = newUser;
      try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } catch (e) {
        console.log('Could not save to localStorage:', e);
      }
      
      updateAuthState();
      closeModal('registerModal');
      showNotification('註冊成功！歡迎加入數牧人。', 'success');
      showSection('portal');
      
    } else {
      const error = await response.json();
      showNotification('註冊失敗：' + (error.error || '請稍後再試'), 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showNotification('註冊失敗：網絡錯誤', 'error');
  }
}

function resetRegisterForm() {
  currentStep = 1;
  selectedUserType = null;
  selectedSkills = [];
  selectedLanguages = [];
  document.getElementById('userTypeSelection').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('step1').classList.remove('hidden');
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('skillsTags').innerHTML = '';
  document.getElementById('languagesTags').innerHTML = '';
  document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('selected'));
}

function calculateProfileCompletion() {
  let completion = 20;
  if (selectedSkills.length > 0) completion += 20;
  if (selectedLanguages.length > 0) completion += 15;
  if (document.getElementById('bio').value) completion += 15;
  if (selectedUserType === 'expert') {
    if (document.getElementById('hourlyRate').value) completion += 15;
    if (document.getElementById('currentLocation').value) completion += 15;
  } else {
    if (document.getElementById('companySize').value) completion += 15;
    if (document.getElementById('industry').value) completion += 15;
  }
  return completion;
}

function updateAuthState() {
  const authButtons = document.querySelector('.auth-buttons');
  if (!authButtons) return;
  
  if (currentUser) {
    authButtons.innerHTML = `
      <span style="color: var(--color-text-secondary);">歡迎, ${currentUser.name}</span>
      <button class="btn btn--outline btn--sm" id="portalBtn">管理中心</button>
      <button class="btn btn--outline btn--sm" id="logoutBtn">登出</button>
    `;
    
    // Add event listeners
    document.getElementById('portalBtn').addEventListener('click', () => showSection('portal'));
    document.getElementById('logoutBtn').addEventListener('click', logout);
  } else {
    authButtons.innerHTML = `
      <button class="btn btn--outline btn--sm" id="loginBtn">登入</button>
      <button class="btn btn--primary btn--sm" id="registerBtn">加入平台</button>
    `;
    
    // Add event listeners
    document.getElementById('loginBtn').addEventListener('click', () => openModal('login'));
    document.getElementById('registerBtn').addEventListener('click', () => openModal('register'));
  }
}

function logout() {
  currentUser = null;
  try {
    localStorage.removeItem('currentUser');
  } catch (e) {
    console.log('Could not remove from localStorage:', e);
  }
  updateAuthState();
  showSection('home');
  showNotification('已登出', 'info');
}

// Data population functions
function populateCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  platformData.categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-icon">${category.icon}</div>
      <div class="category-name">${category.name}</div>
      <div class="category-count">${category.count} 個專家</div>
    `;
    
    card.addEventListener('click', () => {
      showSection('experts');
      // Optional: Filter by category
      setTimeout(() => {
        const categoryFilter = document.getElementById('skillFilter');
        if (categoryFilter) {
          // Map category names to filter values
          if (category.name === '網頁開發') categoryFilter.value = 'React';
          else if (category.name === 'UI/UX設計') categoryFilter.value = 'UI/UX設計';
          else if (category.name === '數位行銷') categoryFilter.value = '數位行銷';
          else if (category.name === '內容創作') categoryFilter.value = '內容創作';
          searchExperts();
        }
      }, 100);
    });
    
    grid.appendChild(card);
  });
}

function populateDestinations() {
  const grid = document.getElementById('destinationsGrid');
  const list = document.getElementById('destinationsList');
  
  platformData.destinations.forEach(destination => {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.innerHTML = `
      <div class="destination-header">
        <div class="destination-name">${destination.name}</div>
        <div class="destination-stats">
          <div class="destination-stat"><strong>${destination.nomadCount}</strong> 遊牧者</div>
          <div class="destination-stat"><strong>${destination.coworking}</strong> 共享空間</div>
        </div>
      </div>
      <div class="destination-body">
        <div class="destination-features">
          <div class="destination-feature">💰 ${destination.avgCost}</div>
          <div class="destination-feature">📶 ${destination.wifi}</div>
        </div>
        <p>${destination.description}</p>
      </div>
    `;
    
    // Add to both homepage and destinations page
    if (grid) grid.appendChild(card.cloneNode(true));
    if (list) list.appendChild(card);
  });
}

function populateExperts(experts = platformData.experts) {
  const grid = document.getElementById('expertsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  experts.forEach(expert => {
    const card = document.createElement('div');
    card.className = 'expert-card';
    card.innerHTML = `
      <div class="expert-header">
        <div class="expert-avatar">${expert.avatar}</div>
        <div class="expert-info">
          <div class="expert-name">${expert.name}</div>
          <div class="expert-title">${expert.title}</div>
        </div>
        <div class="expert-rating">
          <span class="rating-stars">⭐</span>
          <span>${expert.rating} (${expert.reviews})</span>
        </div>
      </div>
      <div class="expert-location">📍 ${expert.location}</div>
      <div class="expert-details">
        <div class="expert-detail"><strong>回應時間:</strong> ${expert.responseTime}</div>
        <div class="expert-detail"><strong>完成項目:</strong> ${expert.completedProjects}</div>
      </div>
      <div class="expert-skills">
        ${expert.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        ${expert.skills.length > 3 ? '<span class="skill-tag">+更多</span>' : ''}
      </div>
      <div class="expert-footer">
        <div class="expert-rate">${expert.hourlyRate}/時</div>
        <div class="expert-status status-busy">暫時約滿</div>
      </div>
    `;
    
    card.addEventListener('click', () => showExpertProfile(expert.id));
    
    grid.appendChild(card);
  });
}

// Load tasks from API and populate the marketplace
async function loadAndPopulateTasks() {
  try {
    console.log('Loading tasks from API...');
    const response = await fetch('/api/tasks');
    if (response.ok) {
      const tasks = await response.json();
      console.log('Loaded tasks from API:', tasks);
      populateTasks(tasks);
    } else {
      console.error('Failed to load tasks from API, using static data');
      populateTasks(platformData.tasks);
    }
  } catch (error) {
    console.error('Error loading tasks from API:', error);
    populateTasks(platformData.tasks);
  }
}

function populateTasks(tasks = platformData.tasks) {
  const grid = document.getElementById('tasksGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (tasks.length === 0) {
    grid.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-20);">目前沒有可接的任務</p>';
    return;
  }
  
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = 'task-card';
    
    // Handle both API data format and static data format
    const budget = task.budget || `$${task.budget_min}-${task.budget_max}`;
    const company = task.company || task.client_name || '未知公司';
    const companyLogo = task.companyLogo || '🏢';
    const duration = task.duration || '未指定';
    const experienceLevel = task.experience_level || task.experienceLevel || '未指定';
    const deadline = task.deadline || '未指定';
    const skills = task.skills || [];
    const applications = task.application_count || task.applications || 0;
    
    card.innerHTML = `
      <div class="task-header">
        <div>
          <div class="task-title">${task.title}</div>
          <div class="task-company">
            <span class="company-logo">${companyLogo}</span>
            ${company}
          </div>
        </div>
        <div class="task-budget">${budget}</div>
      </div>
      <div class="task-meta">
        <div class="task-meta-item">⏱️ ${duration}</div>
        <div class="task-meta-item">📍 遠程</div>
        <div class="task-meta-item">📊 ${experienceLevel}</div>
      </div>
      <div class="task-description">${task.description}</div>
      <div class="task-skills">
        ${skills.slice(0, 4).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
      <div class="task-footer">
        <div class="task-applications">${applications} 人申請</div>
        <div class="task-deadline">截止: ${deadline}</div>
      </div>
    `;
    
    card.addEventListener('click', () => showTaskDetails(task));
    
    grid.appendChild(card);
  });
}

function populateCoworkingSpaces() {
  const grid = document.getElementById('coworkingGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  platformData.coworkingSpaces.forEach(space => {
    const card = document.createElement('div');
    card.className = 'coworking-card';
    card.innerHTML = `
      <div class="coworking-name">${space.name}</div>
      <div class="coworking-location">📍 ${space.location}</div>
      <div class="coworking-pricing">
        <div><strong>日票:</strong> ${space.dayPass}</div>
        <div><strong>月票:</strong> ${space.monthlyPass}</div>
      </div>
      <div><strong>網速:</strong> ${space.wifi}</div>
      <div class="coworking-amenities">
        ${space.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
      </div>
    `;
    
    grid.appendChild(card);
  });
}

// Search functions
function searchExperts() {
  const searchTerm = document.getElementById('expertSearch')?.value.toLowerCase() || '';
  const skillFilter = document.getElementById('skillFilter')?.value || '';
  const locationFilter = document.getElementById('locationFilter')?.value || '';
  const rateFilter = document.getElementById('rateFilter')?.value || '';
  
  let filteredExperts = platformData.experts.filter(expert => {
    const matchesSearch = !searchTerm || 
      expert.name.toLowerCase().includes(searchTerm) ||
      expert.title.toLowerCase().includes(searchTerm) ||
      expert.skills.some(skill => skill.toLowerCase().includes(searchTerm));
    
    const matchesSkill = !skillFilter || expert.skills.includes(skillFilter);
    const matchesLocation = !locationFilter || getLocationRegion(expert.location) === locationFilter;
    const matchesRate = !rateFilter || checkRateRange(expert.hourlyRate, rateFilter);
    
    return matchesSearch && matchesSkill && matchesLocation && matchesRate;
  });
  
  populateExperts(filteredExperts);
}

async function searchTasks() {
  const searchTerm = document.getElementById('taskSearch')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('taskCategoryFilter')?.value || '';
  const budgetFilter = document.getElementById('budgetFilter')?.value || '';
  
  // If no filters are applied, reload all tasks from API
  if (!searchTerm && !categoryFilter && !budgetFilter) {
    await loadAndPopulateTasks();
    return;
  }
  
  try {
    // Load tasks from API first
    const response = await fetch('/api/tasks');
    if (response.ok) {
      const tasks = await response.json();
      
      // Apply filters
      let filteredTasks = tasks.filter(task => {
        const matchesSearch = !searchTerm || 
          task.title.toLowerCase().includes(searchTerm) ||
          (task.client_name && task.client_name.toLowerCase().includes(searchTerm)) ||
          (task.skills && task.skills.some(skill => skill.toLowerCase().includes(searchTerm)));
        
        const matchesCategory = !categoryFilter || (task.category_name && task.category_name === categoryFilter);
        const budget = task.budget || `$${task.budget_min}-${task.budget_max}`;
        const matchesBudget = !budgetFilter || checkBudgetRange(budget, budgetFilter);
        
        return matchesSearch && matchesCategory && matchesBudget;
      });
      
      populateTasks(filteredTasks);
    } else {
      // Fallback to static data
      let filteredTasks = platformData.tasks.filter(task => {
        const matchesSearch = !searchTerm || 
          task.title.toLowerCase().includes(searchTerm) ||
          task.company.toLowerCase().includes(searchTerm) ||
          task.skills.some(skill => skill.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !categoryFilter || task.category === categoryFilter;
        const matchesBudget = !budgetFilter || checkBudgetRange(task.budget, budgetFilter);
        
        return matchesSearch && matchesCategory && matchesBudget;
      });
      
      populateTasks(filteredTasks);
    }
  } catch (error) {
    console.error('Error searching tasks:', error);
    // Fallback to static data
    let filteredTasks = platformData.tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm) ||
        task.company.toLowerCase().includes(searchTerm) ||
        task.skills.some(skill => skill.toLowerCase().includes(searchTerm));
      
      const matchesCategory = !categoryFilter || task.category === categoryFilter;
      const matchesBudget = !budgetFilter || checkBudgetRange(task.budget, budgetFilter);
      
      return matchesSearch && matchesCategory && matchesBudget;
    });
    
    populateTasks(filteredTasks);
  }
}

function getLocationRegion(location) {
  if (location.includes('印尼') || location.includes('泰國')) return '亞洲';
  if (location.includes('葡萄牙')) return '歐洲';
  if (location.includes('墨西哥')) return '美洲';
  return '其他';
}

function checkRateRange(rate, filter) {
  const rateNum = parseInt(rate.match(/\d+/)[0]);
  switch(filter) {
    case '0-30': return rateNum <= 30;
    case '30-60': return rateNum >= 30 && rateNum <= 60;
    case '60+': return rateNum >= 60;
    default: return true;
  }
}

function checkBudgetRange(budget, filter) {
  const budgetNum = parseInt(budget.match(/\d+/)[0]);
  switch(filter) {
    case '1000-3000': return budgetNum >= 1000 && budgetNum <= 3000;
    case '3000-5000': return budgetNum >= 3000 && budgetNum <= 5000;
    case '5000+': return budgetNum >= 5000;
    default: return true;
  }
}

// Task and Expert Details
function showTaskDetails(task) {
  if (!task) return;
  
  const modal = document.getElementById('taskModal');
  const title = document.getElementById('taskModalTitle');
  const content = document.getElementById('taskModalContent');
  
  // Handle both API data format and static data format
  const budget = task.budget || `$${task.budget_min}-${task.budget_max}`;
  const company = task.company || task.client_name || '未知公司';
  const companyLogo = task.companyLogo || '🏢';
  const category = task.category || task.category_name || '未分類';
  const duration = task.duration || '未指定';
  const experienceLevel = task.experience_level || task.experienceLevel || '未指定';
  const deadline = task.deadline || '未指定';
  const skills = task.skills || [];
  
  title.textContent = task.title;
  content.innerHTML = `
    <div class="task-detail-header">
      <div style="display: flex; align-items: center; gap: var(--space-16); margin-bottom: var(--space-16);">
        <div style="font-size: 2rem;">${companyLogo}</div>
        <div>
          <h4 style="margin: 0; margin-bottom: var(--space-4);">${company}</h4>
          <div style="color: var(--color-text-secondary);">${category}</div>
        </div>
      </div>
    </div>
    
    <div class="task-detail-content">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-16); margin-bottom: var(--space-24);">
        <div><strong>預算:</strong> ${budget}</div>
        <div><strong>期程:</strong> ${duration}</div>
        <div><strong>經驗要求:</strong> ${experienceLevel}</div>
        <div><strong>截止日期:</strong> ${deadline}</div>
      </div>
      
      <h5>任務描述</h5>
      <p>${task.description}</p>
      
      <h5>所需技能</h5>
      <div class="task-skills">
        ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
      
      <div style="margin-top: var(--space-24); text-align: center;">
        <button class="btn btn--primary btn--lg" id="applyTaskBtn">申請此任務</button>
        <button class="btn btn--outline btn--lg" id="saveTaskBtn" style="margin-left: var(--space-12);">
          ${savedTasks.includes(task.id) ? '取消收藏' : '收藏任務'}
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('applyTaskBtn').addEventListener('click', () => {
    closeModal('taskModal');
    applyToTask(task.id);
  });
  document.getElementById('saveTaskBtn').addEventListener('click', () => {
    closeModal('taskModal');
    toggleSaveTask(task.id);
  });
  
  modal.classList.remove('hidden');
}

function showExpertProfile(expertId) {
  const expert = platformData.experts.find(e => e.id === expertId);
  if (!expert) return;
  
  const modal = document.getElementById('expertModal');
  const title = document.getElementById('expertModalTitle');
  const content = document.getElementById('expertModalContent');
  
  title.textContent = expert.name;
  content.innerHTML = `
    <div class="expert-profile-header">
      <div style="display: flex; align-items: center; gap: var(--space-20); margin-bottom: var(--space-24);">
        <div style="font-size: 4rem;">${expert.avatar}</div>
        <div>
          <h3 style="margin: 0; margin-bottom: var(--space-8);">${expert.name}</h3>
          <h4 style="margin: 0; margin-bottom: var(--space-8); color: var(--color-text-secondary);">${expert.title}</h4>
          <div style="display: flex; align-items: center; gap: var(--space-8); margin-bottom: var(--space-8);">
            <span style="color: #ffd700;">⭐⭐⭐⭐⭐</span>
            <span>${expert.rating} (${expert.reviews} 評價)</span>
          </div>
          <div style="color: var(--color-text-secondary);">📍 ${expert.location} • ${expert.timezone}</div>
        </div>
      </div>
      ${expert.verified ? '<div class="status status--success">✅ 已驗證專家</div>' : ''}
    </div>
    
    <div class="expert-profile-content">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-16); margin-bottom: var(--space-24);">
        <div><strong>時薪:</strong> ${expert.hourlyRate}</div>
        <div><strong>回應時間:</strong> ${expert.responseTime}</div>
        <div><strong>完成項目:</strong> ${expert.completedProjects}</div>
        <div><strong>可工作時間:</strong> ${expert.availability}</div>
      </div>
      
      <h5>專業簡介</h5>
      <p>${expert.description}</p>
      
      <h5>專業技能</h5>
      <div class="expert-skills" style="margin-bottom: var(--space-20);">
        ${expert.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
      
      <h5>語言能力</h5>
      <div class="expert-languages" style="margin-bottom: var(--space-24);">
        ${expert.languages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
      </div>
      
      <div style="text-align: center;">
        <button class="btn btn--primary btn--lg" id="contactExpertBtn">聯繫專家</button>
      </div>
    </div>
  `;
  
  document.getElementById('contactExpertBtn').addEventListener('click', () => {
    showNotification('聯繫功能即將推出！', 'info');
  });
  
  modal.classList.remove('hidden');
}

// Task Application
function applyToTask(taskId) {
  if (!currentUser) {
    openModal('login');
    return;
  }
  
  if (currentUser.type !== 'expert') {
    showNotification('只有專家可以申請任務', 'error');
    return;
  }
  
  const existingApplication = applications.find(app => app.taskId === taskId && app.userId === currentUser.id);
  if (existingApplication) {
    showNotification('您已經申請過這個任務了', 'info');
    return;
  }
  
  const applicationModal = document.getElementById('applicationModal');
  applicationModal.dataset.taskId = taskId;
  closeModal('taskModal');
  openModal('application');
}

async function handleTaskApplication() {
  const taskId = document.getElementById('applicationModal').dataset.taskId;
  const proposalText = document.getElementById('proposalText').value;
  const bidAmount = document.getElementById('bidAmount').value;
  const deliveryTime = document.getElementById('deliveryTime').value;
  const portfolioLink = document.getElementById('portfolioLink').value;
  
  if (!proposalText || !bidAmount || !deliveryTime) {
    showNotification('請填寫所有必填欄位', 'error');
    return;
  }
  
  if (!currentUser) {
    showNotification('請先登入', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/task-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: taskId,
        expert_id: currentUser.id,
        proposal_text: proposalText,
        bid_amount: parseInt(bidAmount),
        delivery_time: parseInt(deliveryTime),
        portfolio_link: portfolioLink
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      showNotification('申請已提交！', 'success');
      closeModal('applicationModal');
      
      // Also store locally for immediate UI updates
      const application = {
        id: generateSimpleUUID(),
        taskId: taskId,
        userId: currentUser.id,
        proposalText: proposalText,
        bidAmount: parseInt(bidAmount),
        deliveryTime: parseInt(deliveryTime),
        portfolioLink: portfolioLink,
        status: 'pending',
        appliedAt: new Date().toISOString()
      };
      
      applications.push(application);
      try {
        localStorage.setItem('applications', JSON.stringify(applications));
      } catch (e) {
        console.log('Could not save application locally:', e);
      }
      
      // Clear form
      document.getElementById('proposalText').value = '';
      document.getElementById('bidAmount').value = '';
      document.getElementById('deliveryTime').value = '';
      document.getElementById('portfolioLink').value = '';
      
      // Refresh the marketplace to update application counts
      setTimeout(() => {
        loadAndPopulateTasks();
      }, 1000);
      
    } else {
      const error = await response.json();
      showNotification('申請失敗：' + (error.error || '請稍後再試'), 'error');
    }
  } catch (error) {
    console.error('Error submitting application:', error);
    showNotification('申請失敗：網絡錯誤', 'error');
  }
}

function toggleSaveTask(taskId) {
  if (!currentUser) {
    openModal('login');
    return;
  }
  
  const index = savedTasks.indexOf(taskId);
  if (index > -1) {
    savedTasks.splice(index, 1);
    showNotification('已取消收藏', 'info');
  } else {
    savedTasks.push(taskId);
    showNotification('已收藏任務', 'success');
  }
  
  try {
    localStorage.setItem('savedTasks', JSON.stringify(savedTasks));
  } catch (e) {
    console.log('Could not save tasks:', e);
  }
  
  // Refresh the save button text
  const saveBtn = document.getElementById('saveTaskBtn');
  if (saveBtn) {
    saveBtn.textContent = savedTasks.includes(taskId) ? '取消收藏' : '收藏任務';
  }
}

// Management Portal
function populatePortal() {
  const content = document.getElementById('portalContent');
  if (!content) return;
  
  if (currentUser.type === 'expert') {
    populateExpertPortal(content);
  } else {
    populateClientPortal(content);
  }
}

function populateExpertPortal(content) {
  const userApplications = applications.filter(app => app.userId === currentUser.id);
  const userSavedTasks = savedTasks.map(taskId => platformData.tasks.find(task => task.id === taskId)).filter(Boolean);
  
  content.innerHTML = `
    <div class="portal-grid">
      <div class="portal-sidebar">
        <div class="profile-completion">
          <h4>檔案完整度</h4>
          <div class="completion-bar">
            <div class="completion-fill" style="width: ${currentUser.profileComplete}%"></div>
          </div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${currentUser.profileComplete}% 完成</div>
        </div>
        
        <div class="profile-section">
          <h4>個人資訊</h4>
          <div style="margin-bottom: var(--space-8);"><strong>姓名:</strong> ${currentUser.name}</div>
          <div style="margin-bottom: var(--space-8);"><strong>電郵:</strong> ${currentUser.email}</div>
          <div style="margin-bottom: var(--space-8);"><strong>位置:</strong> ${currentUser.location || '未設定'}</div>
          <div style="margin-bottom: var(--space-8);"><strong>時薪:</strong> ${currentUser.hourlyRate || '未設定'}</div>
          <div style="margin-bottom: var(--space-8);"><strong>驗證狀態:</strong> ${currentUser.verified ? '✅ 已驗證' : '⏳ 待驗證'}</div>
        </div>
        
        ${currentUser.skills && currentUser.skills.length > 0 ? `
        <div class="profile-section">
          <h4>技能</h4>
          <div class="expert-skills">
            ${currentUser.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}
        
        ${currentUser.languages && currentUser.languages.length > 0 ? `
        <div class="profile-section">
          <h4>語言</h4>
          <div class="expert-languages">
            ${currentUser.languages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="portal-main">
        <div class="profile-section">
          <h3>我的申請 (${userApplications.length})</h3>
          ${userApplications.length === 0 ? '<p style="color: var(--color-text-secondary);">您還沒有申請任何任務</p>' : ''}
          ${userApplications.map(app => {
            const task = platformData.tasks.find(t => t.id === app.taskId);
            return task ? `
              <div class="application-card">
                <div class="application-header">
                  <div>
                    <div style="font-weight: var(--font-weight-semibold);">${task.title}</div>
                    <div style="color: var(--color-text-secondary);">${task.company}</div>
                  </div>
                  <div class="application-status status-${app.status}">${getStatusText(app.status)}</div>
                </div>
                <div style="margin-bottom: var(--space-8);">
                  <strong>提案金額:</strong> $${app.bidAmount} • <strong>交付時間:</strong> ${app.deliveryTime}天
                </div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                  申請時間: ${new Date(app.appliedAt).toLocaleDateString()}
                </div>
              </div>
            ` : '';
          }).join('')}
        </div>
        
        <div class="profile-section">
          <h3>收藏的任務 (${userSavedTasks.length})</h3>
          ${userSavedTasks.length === 0 ? '<p style="color: var(--color-text-secondary);">您還沒有收藏任何任務</p>' : ''}
          <div style="display: grid; gap: var(--space-12);">
            ${userSavedTasks.map(task => `
              <div class="application-card saved-task-card" style="cursor: pointer;" data-task-id="${task.id}">
                <div class="application-header">
                  <div>
                    <div style="font-weight: var(--font-weight-semibold);">${task.title}</div>
                    <div style="color: var(--color-text-secondary);">${task.company}</div>
                  </div>
                  <div style="font-size: var(--font-size-sm); color: var(--color-primary);">${task.budget}</div>
                </div>
                <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                  ${task.duration} • 截止: ${task.deadline}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="profile-section">
          <h3>專家統計</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-16);">
            <div style="text-align: center; padding: var(--space-16); background: var(--color-bg-3); border-radius: var(--radius-base);">
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-success);">${userApplications.length}</div>
              <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">總申請數</div>
            </div>
            <div style="text-align: center; padding: var(--space-16); background: var(--color-bg-1); border-radius: var(--radius-base);">
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-info);">${currentUser.completedProjects || 0}</div>
              <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">完成項目</div>
            </div>
            <div style="text-align: center; padding: var(--space-16); background: var(--color-bg-6); border-radius: var(--radius-base);">
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-warning);">${currentUser.rating || 0}</div>
              <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">平均評分</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners to saved task cards
  document.querySelectorAll('.saved-task-card').forEach(card => {
    card.addEventListener('click', function() {
      const taskId = parseInt(this.dataset.taskId);
      showTaskDetails(taskId);
    });
  });
}

function populateClientPortal(content) {
  content.innerHTML = `
    <div class="portal-grid">
      <div class="portal-sidebar">
        <div class="profile-completion">
          <h4>企業資料完整度</h4>
          <div class="completion-bar">
            <div class="completion-fill" style="width: ${currentUser.profileComplete}%"></div>
          </div>
          <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${currentUser.profileComplete}% 完成</div>
        </div>
        
        <div class="profile-section">
          <h4>企業資訊</h4>
          <div style="margin-bottom: var(--space-8);"><strong>企業:</strong> ${currentUser.name}</div>
          <div style="margin-bottom: var(--space-8);"><strong>規模:</strong> ${currentUser.companySize || '未設定'}</div>
          <div style="margin-bottom: var(--space-8);"><strong>行業:</strong> ${currentUser.industry || '未設定'}</div>
          <div style="margin-bottom: var(--space-8);"><strong>驗證狀態:</strong> ${currentUser.verified ? '✅ 已驗證' : '⏳ 待驗證'}</div>
        </div>
      </div>
      
      <div class="portal-main">
        <div class="profile-section">
          <h3>企業功能</h3>
          <div class="feature-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-16);">
            <div class="feature-card" style="padding: var(--space-20); background: var(--color-bg-1); border-radius: var(--radius-base); text-align: center;">
              <div style="font-size: 2rem; margin-bottom: var(--space-12);">📝</div>
              <h4>發布任務</h4>
              <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">發布遠程工作任務，吸引全球專家</p>
              <button class="btn btn--primary btn--sm" style="margin-top: var(--space-12);" onclick="openPostTaskModal()">發布任務</button>
            </div>
            <div class="feature-card" style="padding: var(--space-20); background: var(--color-bg-3); border-radius: var(--radius-base); text-align: center;">
              <div style="font-size: 2rem; margin-bottom: var(--space-12);">👥</div>
              <h4>管理應聘者</h4>
              <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">查看和管理專家申請</p>
              <button class="btn btn--primary btn--sm" style="margin-top: var(--space-12);" onclick="showMyTasks()">管理任務</button>
            </div>
            <div class="feature-card" style="padding: var(--space-20); background: var(--color-bg-6); border-radius: var(--radius-base); text-align: center;">
              <div style="font-size: 2rem; margin-bottom: var(--space-12);">📊</div>
              <h4>項目統計</h4>
              <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">追蹤項目進度和成效</p>
              <button class="btn btn--primary btn--sm" style="margin-top: var(--space-12);">即將開放</button>
            </div>
          </div>
        </div>
        
        <div class="profile-section">
          <h3>我的任務</h3>
          <div id="myTasksList" style="display: grid; gap: var(--space-16);">
            <!-- Tasks will be loaded here -->
          </div>
        </div>
        
        <div class="profile-section">
          <h3>企業統計</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-16);">
            <div style="text-align: center; padding: var(--space-16); background: var(--color-bg-2); border-radius: var(--radius-base);">
              <div id="totalTasks" style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-warning);">0</div>
              <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">發布任務</div>
            </div>
            <div style="text-align: center; padding: var(--space-16); background: var(--color-bg-5); border-radius: var(--radius-base);">
              <div id="totalApplications" style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-info);">0</div>
              <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">收到申請</div>
            </div>
            <div style="text-align: center; padding: var(--space-16); background: var(--color-bg-4); border-radius: var(--radius-base);">
              <div id="activeProjects" style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-error);">0</div>
              <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">進行中項目</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load tasks after rendering the portal
  setTimeout(() => {
    loadMyTasks();
  }, 100);
}

function getStatusText(status) {
  const statusMap = {
    'pending': '待審核',
    'active': '進行中',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
}

// Utility functions
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    const target = parseInt(counter.textContent.replace(/,/g, ''));
    const increment = target / 100;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = Math.floor(current).toLocaleString();
    }, 20);
  });
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Global functions for inline handlers (backup)
window.showSection = showSection;
window.openModal = openModal;
window.closeModal = closeModal;
window.selectUserType = selectUserType;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.searchExperts = searchExperts;
window.searchTasks = searchTasks;
window.showTaskDetails = showTaskDetails;
window.showExpertProfile = showExpertProfile;
window.applyToTask = applyToTask;
window.toggleSaveTask = toggleSaveTask;
window.logout = logout;
window.showMyTasks = showMyTasks;
window.openPostTaskModal = openPostTaskModal;
window.loadAndPopulateTasks = loadAndPopulateTasks;
window.viewTaskApplications = viewTaskApplications;
window.scheduleInterview = scheduleInterview;
window.acceptApplication = acceptApplication;
window.rejectApplication = rejectApplication;