/**
 * QRServe — Dashboard JavaScript
 * Full interactive dashboard functionality
 */

'use strict';

/* ============================================================
   DASHBOARD SIDEBAR TOGGLE
   ============================================================ */
const DashboardSidebar = (() => {
  let sidebar, mainContent, toggleBtn;
  const COLLAPSED_CLASS = 'db-sidebar--collapsed';
  const STORAGE_KEY = 'qrserve-sidebar-collapsed';

  const toggle = () => {
    const isCollapsed = sidebar.classList.toggle(COLLAPSED_CLASS);
    mainContent?.classList.toggle('db-main--expanded', isCollapsed);
    localStorage.setItem(STORAGE_KEY, isCollapsed);
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', (!isCollapsed).toString());
    }
  };

  const init = () => {
    sidebar = document.querySelector('.db-sidebar');
    mainContent = document.querySelector('.db-main');
    toggleBtn = document.querySelector('[data-sidebar-toggle]');

    if (!sidebar) return;

    // Restore state
    const wasCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (wasCollapsed) {
      sidebar.classList.add(COLLAPSED_CLASS);
      mainContent?.classList.add('db-main--expanded');
    }

    toggleBtn?.addEventListener('click', toggle);

    // Mobile overlay close
    document.querySelector('.db-sidebar-overlay')?.addEventListener('click', () => {
      sidebar.classList.remove('db-sidebar--mobile-open');
      document.querySelector('.db-sidebar-overlay')?.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Mobile hamburger
    document.querySelector('[data-mobile-sidebar]')?.addEventListener('click', () => {
      sidebar.classList.add('db-sidebar--mobile-open');
      document.querySelector('.db-sidebar-overlay')?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  };

  return { init };
})();

/* ============================================================
   DASHBOARD TABS
   ============================================================ */
const DashboardTabs = (() => {
  const init = () => {
    document.querySelectorAll('[data-tab-group]').forEach(group => {
      const tabs = group.querySelectorAll('[data-tab]');
      const panels = document.querySelectorAll(`[data-tab-panel="${group.dataset.tabGroup}"]`);

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;

          tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });

          panels.forEach(panel => {
            panel.classList.remove('active');
            panel.hidden = true;
          });

          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');

          const targetPanel = document.querySelector(`[data-tab-panel="${group.dataset.tabGroup}"][data-panel="${target}"]`);
          if (targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.hidden = false;
            
            // Scroll to top of the page when switching sections
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      });
    });
  };

  return { init };
})();

/* ============================================================
   ORDER MANAGEMENT
   ============================================================ */
const OrderManager = (() => {
  const statuses = {
    new: { label: 'New', color: '#3b82f6' },
    preparing: { label: 'Preparing', color: '#f59e0b' },
    ready: { label: 'Ready', color: '#00c896' },
    completed: { label: 'Completed', color: '#6d8072' },
    cancelled: { label: 'Cancelled', color: '#ff6b5b' }
  };

  const sampleOrders = [
    { id: '#1052', table: 'Table 3', items: 'Pasta, Wine x2', amount: '$54.00', status: 'new', time: '2 min ago' },
    { id: '#1051', table: 'Table 7', items: 'Burger, Fries, Cola', amount: '$28.50', status: 'preparing', time: '8 min ago' },
    { id: '#1050', table: 'Table 12', items: 'Steak, Salad', amount: '$67.00', status: 'ready', time: '14 min ago' },
    { id: '#1049', table: 'Table 5', items: 'Pizza Margherita', amount: '$16.99', status: 'completed', time: '22 min ago' },
    { id: '#1048', table: 'Table 9', items: 'Tiramisu x3', amount: '$23.97', status: 'completed', time: '31 min ago' },
    { id: '#1047', table: 'Table 1', items: 'Fish & Chips', amount: '$19.50', status: 'cancelled', time: '45 min ago' },
  ];

  const renderOrders = (container, orders) => {
    if (!container) return;
    container.innerHTML = '';

    orders.forEach(order => {
      const status = statuses[order.status];
      const row = document.createElement('tr');
      row.className = 'db-table__row';
      row.innerHTML = `
        <td class="db-table__cell">
          <span class="text--mono" style="font-size:0.8rem;font-weight:600;">${order.id}</span>
        </td>
        <td class="db-table__cell">${order.table}</td>
        <td class="db-table__cell" style="color:var(--clr-text-secondary);font-size:0.85rem;">${order.items}</td>
        <td class="db-table__cell">
          <span style="font-weight:600;color:var(--clr-secondary);">${order.amount}</span>
        </td>
        <td class="db-table__cell">
          <span class="order-status-badge" style="background:${status.color}20;color:${status.color};padding:0.25rem 0.625rem;border-radius:4px;font-size:0.75rem;font-weight:600;">
            ${status.label}
          </span>
        </td>
        <td class="db-table__cell" style="color:var(--clr-text-muted);font-size:0.8rem;">${order.time}</td>
        <td class="db-table__cell">
          <div style="display:flex;gap:0.375rem;">
            <button class="db-action-btn" data-order-id="${order.id}" data-action="view" title="View order" aria-label="View order ${order.id}">
              <i class="ri-eye-line" aria-hidden="true"></i>
            </button>
            ${order.status === 'new' ? `
            <button class="db-action-btn db-action-btn--green" data-order-id="${order.id}" data-action="accept" title="Accept order" aria-label="Accept order ${order.id}">
              <i class="ri-check-line" aria-hidden="true"></i>
            </button>` : ''}
            ${order.status === 'new' || order.status === 'preparing' ? `
            <button class="db-action-btn db-action-btn--red" data-order-id="${order.id}" data-action="cancel" title="Cancel order" aria-label="Cancel order ${order.id}">
              <i class="ri-close-line" aria-hidden="true"></i>
            </button>` : ''}
          </div>
        </td>
      `;
      container.appendChild(row);
    });

    // Wire actions
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        const orderId = btn.dataset.orderId;
        if (window.QRServe?.Toast) {
          const messages = {
            view: `Viewing order ${orderId}`,
            accept: `Order ${orderId} accepted and sent to kitchen`,
            cancel: `Order ${orderId} has been cancelled`
          };
          const types = { view: 'info', accept: 'success', cancel: 'error' };
          window.QRServe.Toast.show(messages[action], types[action]);
        }
      });
    });
  };

  const init = () => {
    const tbodyOverview = document.getElementById('orders-tbody');
    const tbodyFull = document.getElementById('orders-tbody-full');

    if (tbodyOverview) renderOrders(tbodyOverview, sampleOrders);
    if (tbodyFull) renderOrders(tbodyFull, sampleOrders);

    // Status filter
    document.querySelectorAll('[data-order-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const parentCard = btn.closest('.db-card');
        if (!parentCard) return;

        parentCard.querySelectorAll('[data-order-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.orderFilter;
        const filtered = filter === 'all' ? sampleOrders : sampleOrders.filter(o => o.status === filter);
        
        const targetTbody = parentCard.querySelector('tbody');
        if (targetTbody) renderOrders(targetTbody, filtered);
      });
    });
  };

  return { init };
})();

/* ============================================================
   QR CODE MANAGEMENT
   ============================================================ */
const QRManager = (() => {
  const tables = [
    { id: 1, name: 'Table 1', status: 'active', scans: 42, lastScan: '5 min ago' },
    { id: 2, name: 'Table 2', status: 'active', scans: 28, lastScan: '12 min ago' },
    { id: 3, name: 'Table 3', status: 'active', scans: 65, lastScan: '2 min ago' },
    { id: 4, name: 'Table 4', status: 'inactive', scans: 0, lastScan: 'Never' },
    { id: 5, name: 'Table 5', status: 'active', scans: 19, lastScan: '31 min ago' },
    { id: 6, name: 'Bar Area', status: 'active', scans: 87, lastScan: 'Just now' },
    { id: 7, name: 'Terrace 1', status: 'active', scans: 34, lastScan: '7 min ago' },
    { id: 8, name: 'Terrace 2', status: 'inactive', scans: 0, lastScan: 'Never' },
  ];

  const renderQRCodes = (container) => {
    if (!container) return;
    container.innerHTML = '';

    tables.forEach(table => {
      const card = document.createElement('div');
      card.className = 'qr-card';
      card.innerHTML = `
        <div class="qr-card__code" aria-hidden="true">
          <i class="ri-qr-code-fill" style="font-size:3.5rem;color:var(--clr-text-primary);"></i>
        </div>
        <div class="qr-card__info">
          <h4 class="qr-card__name">${table.name}</h4>
          <div class="qr-card__scans">
            <i class="ri-scan-line" aria-hidden="true"></i>
            <span>${table.scans} scans</span>
            <span class="qr-card__last">${table.lastScan}</span>
          </div>
          <span class="badge ${table.status === 'active' ? 'badge--green' : 'badge--muted'}" aria-label="Status: ${table.status}">
            ${table.status === 'active' ? '● Active' : '○ Inactive'}
          </span>
        </div>
        <div class="qr-card__actions">
          <button class="db-action-btn" title="Download QR code" aria-label="Download QR code for ${table.name}">
            <i class="ri-download-2-line" aria-hidden="true"></i>
          </button>
          <button class="db-action-btn" title="Copy link" aria-label="Copy menu link for ${table.name}">
            <i class="ri-file-copy-line" aria-hidden="true"></i>
          </button>
          <button class="db-action-btn" title="Toggle status" aria-label="Toggle status for ${table.name}">
            <i class="ri-toggle-line" aria-hidden="true"></i>
          </button>
        </div>
      `;

      // Wire buttons
      const [downloadBtn, copyBtn, toggleBtn] = card.querySelectorAll('.db-action-btn');

      downloadBtn.addEventListener('click', () => {
        window.QRServe?.Toast?.show(`Downloading QR code for ${table.name}`, 'success');
      });

      copyBtn.addEventListener('click', () => {
        const url = `https://menu.qrserve.io/t/${table.id}`;
        navigator.clipboard?.writeText(url).then(() => {
          window.QRServe?.Toast?.show(`Menu link copied to clipboard`, 'success');
        }).catch(() => {
          window.QRServe?.Toast?.show(`Link: menu.qrserve.io/t/${table.id}`, 'info');
        });
      });

      container.appendChild(card);
    });
  };

  const init = () => {
    const container = document.getElementById('qr-grid');
    renderQRCodes(container);

    // Add new table
    document.getElementById('add-table-btn')?.addEventListener('click', () => {
      window.QRServe?.Toast?.show('New table dialog opened', 'info');
    });
  };

  return { init };
})();

/* ============================================================
   MENU BUILDER
   ============================================================ */
const MenuBuilder = (() => {
  const categories = [
    { id: 1, name: 'Starters', items: 8, color: '#00c896' },
    { id: 2, name: 'Main Course', items: 14, color: '#ff6b5b' },
    { id: 3, name: 'Desserts', items: 6, color: '#f59e0b' },
    { id: 4, name: 'Beverages', items: 12, color: '#3b82f6' },
  ];

  const menuItems = [
    { id: 1, cat: 1, name: 'Bruschetta', price: '$8.99', available: true, img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=80&h=80&auto=format&fit=crop' },
    { id: 2, cat: 1, name: 'Calamari', price: '$12.50', available: true, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=80&h=80&auto=format&fit=crop' },
    { id: 3, cat: 2, name: 'Margherita Pizza', price: '$14.99', available: true, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=80&h=80&auto=format&fit=crop' },
    { id: 4, cat: 2, name: 'Truffle Pasta', price: '$18.00', available: false, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=80&h=80&auto=format&fit=crop' },
    { id: 5, cat: 3, name: 'Tiramisu', price: '$7.99', available: true, img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=80&h=80&auto=format&fit=crop' },
  ];

  const renderCategories = (container) => {
    if (!container) return;
    container.innerHTML = '';
    categories.forEach(cat => {
      const el = document.createElement('div');
      el.className = 'menu-cat-chip';
      el.innerHTML = `
        <span class="menu-cat-chip__dot" style="background:${cat.color};" aria-hidden="true"></span>
        <span>${cat.name}</span>
        <span class="badge badge--muted">${cat.items}</span>
        <button class="db-action-btn" style="width:24px;height:24px;" aria-label="Edit ${cat.name} category">
          <i class="ri-edit-line" aria-hidden="true"></i>
        </button>
      `;
      container.appendChild(el);
    });
  };

  const renderMenuItems = (container) => {
    if (!container) return;
    container.innerHTML = '';
    menuItems.forEach(item => {
      const el = document.createElement('div');
      el.className = 'menu-item-row';
      el.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="menu-item-row__img" loading="lazy" />
        <div class="menu-item-row__info">
          <h4 class="menu-item-row__name">${item.name}</h4>
          <span class="menu-item-row__price">${item.price}</span>
        </div>
        <label class="toggle" style="margin-inline-start:auto;" aria-label="Toggle availability for ${item.name}">
          <input type="checkbox" ${item.available ? 'checked' : ''} />
          <span class="toggle__slider"></span>
        </label>
        <button class="db-action-btn" title="Edit item" aria-label="Edit ${item.name}">
          <i class="ri-edit-line" aria-hidden="true"></i>
        </button>
        <button class="db-action-btn db-action-btn--red" title="Delete item" aria-label="Delete ${item.name}">
          <i class="ri-delete-bin-line" aria-hidden="true"></i>
        </button>
      `;

      const editBtn = el.querySelector('[title="Edit item"]');
      const deleteBtn = el.querySelector('[title="Delete item"]');
      const toggle = el.querySelector('input[type="checkbox"]');

      editBtn.addEventListener('click', () => {
        window.QRServe?.Toast?.show(`Editing "${item.name}"`, 'info');
      });

      deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete "${item.name}"? This cannot be undone.`)) {
          el.remove();
          window.QRServe?.Toast?.show(`"${item.name}" deleted`, 'error');
        }
      });

      toggle.addEventListener('change', () => {
        window.QRServe?.Toast?.show(
          toggle.checked ? `"${item.name}" is now available` : `"${item.name}" marked as unavailable`,
          toggle.checked ? 'success' : 'info'
        );
      });

      container.appendChild(el);
    });
  };

  const init = () => {
    renderCategories(document.getElementById('menu-categories'));
    renderMenuItems(document.getElementById('menu-items-list'));

    document.getElementById('add-item-btn')?.addEventListener('click', () => {
      window.QRServe?.Toast?.show('Add new menu item dialog opened', 'info');
    });

    document.getElementById('add-category-btn')?.addEventListener('click', () => {
      window.QRServe?.Toast?.show('Add new category dialog opened', 'info');
    });
  };

  return { init };
})();

/* ============================================================
   SIMPLE CHART (SVG — no library)
   ============================================================ */
const Charts = (() => {
  const drawLineChart = (canvasId, labels, data, color = '#00c896') => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 160;
    const pad = { top: 16, right: 16, bottom: 32, left: 40 };

    const maxVal = Math.max(...data) * 1.15;
    const minVal = 0;

    const xStep = (width - pad.left - pad.right) / (data.length - 1);
    const yScale = (height - pad.top - pad.bottom) / (maxVal - minVal);

    // Background
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-border') || 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * (height - pad.top - pad.bottom);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
    }

    // Fill gradient
    const grad = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = pad.left + i * xStep;
      const y = height - pad.bottom - (val - minVal) * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    const lastX = pad.left + (data.length - 1) * xStep;
    const lastY = height - pad.bottom - (data[data.length - 1] - minVal) * yScale;
    ctx.lineTo(lastX, height - pad.bottom);
    ctx.lineTo(pad.left, height - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    data.forEach((val, i) => {
      const x = pad.left + i * xStep;
      const y = height - pad.bottom - (val - minVal) * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots
    data.forEach((val, i) => {
      const x = pad.left + i * xStep;
      const y = height - pad.bottom - (val - minVal) * yScale;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    });

    // X Labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-text-muted') || '#7a8c84';
    ctx.font = '10px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = pad.left + i * xStep;
      ctx.fillText(label, x, height - 6);
    });
  };

  const drawBarChart = (canvasId, labels, data, color = '#ff6b5b') => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 160;
    const pad = { top: 16, right: 16, bottom: 32, left: 40 };

    const maxVal = Math.max(...data) * 1.2;
    const barWidth = ((width - pad.left - pad.right) / data.length) * 0.6;
    const barGap = ((width - pad.left - pad.right) / data.length) * 0.4;
    const yScale = (height - pad.top - pad.bottom) / maxVal;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-border') || 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * (height - pad.top - pad.bottom);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
    }

    // Bars
    data.forEach((val, i) => {
      const x = pad.left + i * (barWidth + barGap) + barGap / 2;
      const barHeight = val * yScale;
      const y = height - pad.bottom - barHeight;

      const grad = ctx.createLinearGradient(0, y, 0, height - pad.bottom);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '66');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();
    });

    // X Labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--clr-text-muted') || '#7a8c84';
    ctx.font = '10px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = pad.left + i * (barWidth + barGap) + barGap / 2 + barWidth / 2;
      ctx.fillText(label, x, height - 6);
    });
  };

  const init = () => {
    const revenueLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueData = [2100, 2800, 3200, 2900, 3600, 4100, 3284];
    drawLineChart('revenue-chart', revenueLabels, revenueData, '#00c896');
    drawLineChart('revenue-chart-2', revenueLabels, revenueData, '#00c896');

    const ordersLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const ordersData = [142, 189, 210, 185, 247, 310, 247];
    drawBarChart('orders-chart', ordersLabels, ordersData, '#ff6b5b');
    drawBarChart('orders-chart-2', ordersLabels, ordersData, '#ff6b5b');

    // Redraw on theme change
    const observer = new MutationObserver(() => {
      drawLineChart('revenue-chart', revenueLabels, revenueData, '#00c896');
      drawLineChart('revenue-chart-2', revenueLabels, revenueData, '#00c896');
      drawBarChart('orders-chart', ordersLabels, ordersData, '#ff6b5b');
      drawBarChart('orders-chart-2', ordersLabels, ordersData, '#ff6b5b');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        drawLineChart('revenue-chart', revenueLabels, revenueData, '#00c896');
        drawLineChart('revenue-chart-2', revenueLabels, revenueData, '#00c896');
        drawBarChart('orders-chart', ordersLabels, ordersData, '#ff6b5b');
        drawBarChart('orders-chart-2', ordersLabels, ordersData, '#ff6b5b');
      }, 200);
    });
  };

  return { init };
})();

/* ============================================================
   NOTIFICATION PANEL
   ============================================================ */
const NotificationPanel = (() => {
  const init = () => {
    const btn = document.querySelector('[data-notification-toggle]');
    const panel = document.querySelector('.notification-panel');

    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.toggle('active');
      btn.setAttribute('aria-expanded', isOpen.toString());
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        panel.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  };

  return { init };
})();

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  DashboardSidebar.init();
  DashboardTabs.init();
  OrderManager.init();
  QRManager.init();
  MenuBuilder.init();
  Charts.init();
  NotificationPanel.init();
});
