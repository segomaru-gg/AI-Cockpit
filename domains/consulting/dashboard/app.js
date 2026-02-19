document.addEventListener('DOMContentLoaded', () => {
    const tasks = [
        {
            title: "対象SKU一覧確定とBuyBox有無確認",
            phase: "Q1 Recovery",
            status: "pending",
            priority: "high",
            deadline: "2026-03-15"
        },
        {
            title: "競合価格との差分一覧作成",
            phase: "Q1 Recovery",
            status: "pending",
            priority: "high",
            deadline: "2026-03-15"
        },
        {
            title: "商品登録状況レポート作成",
            phase: "Q1 Recovery",
            status: "pending",
            priority: "high",
            deadline: "2026-03-15"
        },
        {
            title: "主力4SKU現状分析と優先順位決定",
            phase: "Q1 Growth",
            status: "pending",
            priority: "high",
            deadline: "2026-03-31"
        },
        {
            title: "各SKU改善施策選定（A+/SEO/セット）",
            phase: "Q1 Growth",
            status: "pending",
            priority: "high",
            deadline: "2026-03-31"
        }
    ];

    renderTasks(tasks);
});

function renderTasks(tasks) {
    const container = document.getElementById('task-list');
    container.innerHTML = '';

    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';

        card.innerHTML = `
            <div class="task-header">
                <span class="task-title">${task.title}</span>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>
            <div class="task-meta">
                <span>${task.phase}</span>
                <span>📅 ${task.deadline || 'No deadline'}</span>
            </div>
            <div class="task-status">
                <span class="badge ${task.status}">${task.status}</span>
            </div>
        `;
        container.appendChild(card);
    });
}
