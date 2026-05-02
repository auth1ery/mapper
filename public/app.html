// ── state ──────────────────────────────────────────────────────────────────────

let token = localStorage.getItem('mapper_token') || null
let me = null
let currentPage = 'browse'
let browseSort = 'recent'
let browsePage = 1
let browseSearch = ''
let searchTimer = null

// editor state
let currentRoadmap = null
let nodes = []
let edges = []
let selectedNode = null
let dragging = null
let dragOffset = { x: 0, y: 0 }
let connectingFrom = null
let nextNodeId = 1
let canvasScale = 1
let canvasPan = { x: 0, y: 0 }
let isPanning = false
let panStart = { x: 0, y: 0 }

// ── init ───────────────────────────────────────────────────────────────────────

;(async () => {
  if (token) {
    try {
      const r = await api('GET', '/auth/me')
      me = r
      setLoggedIn(true)
    } catch {
      token = null
      localStorage.removeItem('mapper_token')
    }
  }
  loadBrowse()
  loadTrending()
  handleToggle()
})()

// ── api helper ─────────────────────────────────────────────────────────────────

async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (token) opts.headers['Authorization'] = 'Bearer ' + token
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch('/api' + path, opts)
  const data = await r.json()
  if (!r.ok) throw new Error(data.error || 'error')
  return data
}

// ── nav ────────────────────────────────────────────────────────────────────────

function goPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === page)
  })
  const el = document.getElementById('page-' + page)
  if (el) {
    el.classList.add('active')
    currentPage = page
  }
  if (page === 'dashboard' && me) loadDashboard()
  if (page === 'trending') loadTrending()
  if (page === 'browse') loadBrowse()
}

// ── auth ───────────────────────────────────────────────────────────────────────

function setLoggedIn(yes) {
  document.getElementById('nav-auth-btns').style.display = yes ? 'none' : 'flex'
  document.getElementById('nav-user').style.display = yes ? 'flex' : 'none'
  document.getElementById('nav-dash').style.display = yes ? '' : 'none'
  if (yes && me) {
    document.getElementById('nav-username-btn').textContent = me.username
  }
}

async function doLogin() {
  const username = document.getElementById('login-username').value.trim()
  const password = document.getElementById('login-password').value
  const err = document.getElementById('login-error')
  err.classList.remove('show')
  try {
    const r = await api('POST', '/auth/login', { username, password })
    token = r.token
    me = r.user
    localStorage.setItem('mapper_token', token)
    setLoggedIn(true)
    closeModal('login')
    toast('welcome back, ' + me.username)
    goPage('dashboard')
  } catch (e) {
    err.textContent = e.message
    err.classList.add('show')
  }
}

async function doRegister() {
  const username = document.getElementById('reg-username').value.trim()
  const email = document.getElementById('reg-email').value.trim()
  const password = document.getElementById('reg-password').value
  const err = document.getElementById('reg-error')
  err.classList.remove('show')
  try {
    const r = await api('POST', '/auth/register', { username, email, password })
    token = r.token
    me = r.user
    localStorage.setItem('mapper_token', token)
    setLoggedIn(true)
    closeModal('register')
    toast('account created — welcome!')
    goPage('dashboard')
  } catch (e) {
    err.textContent = e.message
    err.classList.add('show')
  }
}

function logout() {
  token = null
  me = null
  localStorage.removeItem('mapper_token')
  setLoggedIn(false)
  goPage('browse')
  toast('signed out')
}

// ── modals ─────────────────────────────────────────────────────────────────────

function openModal(name) {
  document.getElementById('modal-' + name).classList.add('open')
}

function closeModal(name) {
  document.getElementById('modal-' + name).classList.remove('open')
  const err = document.getElementById(name.replace(/-/g, '') + '-error') ||
               document.getElementById(name + '-error')
  if (err) err.classList.remove('show')
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'))
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && currentPage === 'editor' &&
      selectedNode && document.activeElement.tagName === 'BODY') {
    deleteSelected()
  }
})

// ── toast ──────────────────────────────────────────────────────────────────────

let toastTimer = null
function toast(msg, type = '') {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.className = 'show ' + type
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { el.className = '' }, 2800)
}

// ── browse ─────────────────────────────────────────────────────────────────────

async function loadBrowse() {
  const grid = document.getElementById('browse-grid')
  grid.innerHTML = '<div class="empty-state">loading...</div>'
  try {
    const r = await api('GET', `/roadmaps/public?sort=${browseSort}&page=${browsePage}&q=${encodeURIComponent(browseSearch)}`)
    renderCards(r.roadmaps, grid)
    renderPagination(r.pages)
  } catch {
    grid.innerHTML = '<div class="empty-state">could not load roadmaps</div>'
  }
}

function renderCards(maps, grid) {
  if (!maps.length) {
    grid.innerHTML = '<div class="empty-state">no roadmaps found</div>'
    return
  }
  grid.innerHTML = maps.map(m => `
    <div class="roadmap-card" onclick="viewRoadmap('${m.id}')">
      <div class="card-owner">${esc(m.ownerUsername)}</div>
      <div class="card-title">${esc(m.title)}</div>
      ${m.description ? `<div class="card-desc">${esc(m.description)}</div>` : ''}
      ${m.tags.length ? `<div class="card-tags">${m.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="card-meta">
        <span>
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          ${m.likeCount}
        </span>
        <span>
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z"/></svg>
          ${m.commentCount}
        </span>
        <span>
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          ${m.views}
        </span>
        <span style="margin-left:auto;color:var(--text3)">${m.nodes.length} nodes</span>
      </div>
    </div>
  `).join('')
}

function renderPagination(pages) {
  const el = document.getElementById('browse-pagination')
  if (pages <= 1) { el.innerHTML = ''; return }
  el.innerHTML = Array.from({ length: pages }, (_, i) => i + 1).map(p =>
    `<button class="${p === browsePage ? 'btn-primary' : 'btn-ghost'}" onclick="goBrowsePage(${p})" style="min-width:34px;padding:0.4rem">${p}</button>`
  ).join('')
}

function goBrowsePage(p) {
  browsePage = p
  loadBrowse()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function setSort(s) {
  browseSort = s
  browsePage = 1
  document.querySelectorAll('.sort-tab').forEach(t => t.classList.toggle('active', t.dataset.sort === s))
  loadBrowse()
}

function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    browseSearch = document.getElementById('browse-search').value.trim()
    browsePage = 1
    loadBrowse()
  }, 320)
}

// ── trending ───────────────────────────────────────────────────────────────────

async function loadTrending() {
  const list = document.getElementById('trending-list')
  try {
    const data = await api('GET', '/roadmaps/trending')
    if (!data.length) { list.innerHTML = '<div class="empty-state">no public roadmaps yet — be the first!</div>'; return }
    list.innerHTML = data.map((m, i) => `
      <div class="trending-item" onclick="viewRoadmap('${m.id}')">
        <div class="trending-rank ${i < 3 ? 'top3' : ''}">${i + 1}</div>
        <div class="trending-info">
          <div class="trending-title">${esc(m.title)}</div>
          <div class="trending-by">${esc(m.ownerUsername)}</div>
        </div>
        <div class="trending-stats">
          <span>♥ ${m.likeCount}</span>
          <span>⑂ ${m.forkCount}</span>
          <span>👁 ${m.views}</span>
        </div>
      </div>
    `).join('')
  } catch {
    list.innerHTML = '<div class="empty-state">could not load trending</div>'
  }
}

// ── dashboard ──────────────────────────────────────────────────────────────────

async function loadDashboard() {
  if (!me) return
  const el = document.getElementById('my-roadmaps-list')
  el.innerHTML = '<div class="empty-state">loading...</div>'
  try {
    const maps = await api('GET', '/roadmaps/mine')
    if (!maps.length) {
      el.innerHTML = '<div class="empty-state">no roadmaps yet — create one!</div>'
      return
    }
    el.innerHTML = maps.map(m => `
      <div class="my-roadmap-item">
        <div class="mri-info" onclick="editRoadmap(${JSON.stringify(m).replace(/"/g, '&quot;')})">
          <div class="mri-title">${esc(m.title)}</div>
          <div class="mri-meta">
            <span class="badge ${m.isPublic ? 'badge-public' : 'badge-private'}">${m.isPublic ? 'public' : 'private'}</span>
            ${m.forkedFrom ? '<span class="badge badge-fork">fork</span>' : ''}
            <span>${m.nodes.length} nodes</span>
            <span>updated ${timeAgo(m.updatedAt)}</span>
            ${m.isPublic ? `<span>♥ ${m.likeCount} · 👁 ${m.views}</span>` : ''}
          </div>
        </div>
        <div class="mri-actions">
          ${m.isPublic ? `<button class="btn-icon" onclick="viewRoadmap('${m.id}')" title="view public">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>` : ''}
          <button class="btn-icon" onclick="editRoadmap(${JSON.stringify(m).replace(/"/g, '&quot;')})" title="edit">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          ${m.isOwner ? `<button class="btn-icon" style="color:var(--red)" onclick="deleteRoadmap('${m.id}')" title="delete">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>` : ''}
        </div>
      </div>
    `).join('')
  } catch {
    el.innerHTML = '<div class="empty-state">could not load your maps</div>'
  }
}

async function doCreateRoadmap() {
  if (!me) return openModal('login')
  const title = document.getElementById('cr-title').value.trim()
  const desc = document.getElementById('cr-desc').value.trim()
  const tagsRaw = document.getElementById('cr-tags').value
  const isPublic = document.getElementById('cr-public').checked
  const err = document.getElementById('cr-error')
  err.classList.remove('show')
  if (!title) { err.textContent = 'title required'; err.classList.add('show'); return }
  try {
    const tags = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 8)
    const r = await api('POST', '/roadmaps', { title, description: desc, isPublic, tags })
    closeModal('create-roadmap')
    document.getElementById('cr-title').value = ''
    document.getElementById('cr-desc').value = ''
    document.getElementById('cr-tags').value = ''
    document.getElementById('cr-public').checked = false
    editRoadmap(r)
    toast('roadmap created')
  } catch (e) {
    err.textContent = e.message
    err.classList.add('show')
  }
}

async function deleteRoadmap(id) {
  if (!confirm('delete this roadmap?')) return
  try {
    await api('DELETE', `/roadmaps/${id}`)
    toast('deleted')
    loadDashboard()
  } catch (e) {
    toast(e.message, 'error')
  }
}

// ── editor ─────────────────────────────────────────────────────────────────────

function editRoadmap(map) {
  currentRoadmap = map
  nodes = JSON.parse(JSON.stringify(map.nodes || []))
  edges = JSON.parse(JSON.stringify(map.edges || []))
  selectedNode = null
  nextNodeId = (nodes.reduce((m, n) => Math.max(m, parseInt(n.id) || 0), 0)) + 1

  document.getElementById('editor-title').value = map.title
  const pubCb = document.getElementById('editor-public')
  pubCb.checked = map.isPublic
  handleToggle()

  const anaBtn = document.getElementById('analytics-btn')
  anaBtn.style.display = map.isOwner && map.isPublic ? '' : 'none'

  goPage('editor')
  setTimeout(() => {
    renderCanvas()
    closeNodePanel()
  }, 50)
}

function editCurrentRoadmap() {
  if (currentRoadmap) editRoadmap(currentRoadmap)
}

// canvas render

function renderCanvas() {
  const nodesEl = document.getElementById('canvas-nodes')
  const svg = document.getElementById('canvas-svg')
  nodesEl.innerHTML = ''
  svg.innerHTML = ''

  // transform
  nodesEl.style.transform = `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasScale})`
  nodesEl.style.transformOrigin = '0 0'

  nodes.forEach(n => {
    const el = createNodeEl(n)
    nodesEl.appendChild(el)
  })

  renderEdges()
}

function createNodeEl(n) {
  const el = document.createElement('div')
  el.className = `r-node type-${n.type || 'task'}`
  el.id = 'node-' + n.id
  el.style.left = n.x + 'px'
  el.style.top = n.y + 'px'
  if (selectedNode && selectedNode.id === n.id) el.classList.add('selected')

  const typeIcons = { task: '◻', milestone: '★', section: '─', done: '✓', warning: '⚠' }

  el.innerHTML = `
    <button class="delete-node-btn" onclick="removeNode('${n.id}')">×</button>
    <div class="node-type-icon">${typeIcons[n.type || 'task'] || '◻'}</div>
    <div class="node-label">${esc(n.label || 'untitled')}</div>
    ${n.desc ? `<div class="node-desc">${esc(n.desc)}</div>` : ''}
    ${n.date ? `<div class="node-date">${n.date}</div>` : ''}
    <div class="node-connect-dot top" data-node="${n.id}" data-dir="top"></div>
    <div class="node-connect-dot bottom" data-node="${n.id}" data-dir="bottom"></div>
    <div class="node-connect-dot left" data-node="${n.id}" data-dir="left"></div>
    <div class="node-connect-dot right" data-node="${n.id}" data-dir="right"></div>
  `

  // drag
  el.addEventListener('mousedown', e => {
    if (e.target.classList.contains('node-connect-dot') || e.target.classList.contains('delete-node-btn')) return
    e.preventDefault()
    selectNode(n.id)
    dragging = n.id
    const rect = el.getBoundingClientRect()
    const canvasRect = document.getElementById('canvas-area').getBoundingClientRect()
    dragOffset.x = e.clientX - rect.left
    dragOffset.y = e.clientY - rect.top
  })

  // connect dots
  el.querySelectorAll('.node-connect-dot').forEach(dot => {
    dot.addEventListener('mousedown', e => {
      e.stopPropagation()
      e.preventDefault()
      connectingFrom = { nodeId: n.id, dir: dot.dataset.dir }
    })
    dot.addEventListener('mouseup', e => {
      e.stopPropagation()
      if (connectingFrom && connectingFrom.nodeId !== n.id) {
        addEdge(connectingFrom.nodeId, n.id)
        connectingFrom = null
        renderCanvas()
      }
    })
  })

  el.addEventListener('click', e => {
    if (e.target.classList.contains('node-connect-dot') || e.target.classList.contains('delete-node-btn')) return
    selectNode(n.id)
  })

  return el
}

function renderEdges() {
  const svg = document.getElementById('canvas-svg')
  svg.innerHTML = ''
  const nodesEl = document.getElementById('canvas-nodes')

  // apply same transform to SVG viewBox conceptually via transform
  svg.style.transform = `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasScale})`
  svg.style.transformOrigin = '0 0'

  edges.forEach(e => {
    const fromNode = nodes.find(n => n.id === e.from)
    const toNode = nodes.find(n => n.id === e.to)
    if (!fromNode || !toNode) return

    const fromEl = document.getElementById('node-' + e.from)
    const toEl = document.getElementById('node-' + e.to)
    if (!fromEl || !toEl) return

    const fx = fromNode.x + fromEl.offsetWidth / 2
    const fy = fromNode.y + fromEl.offsetHeight / 2
    const tx = toNode.x + toEl.offsetWidth / 2
    const ty = toNode.y + toEl.offsetHeight / 2

    const dx = tx - fx, dy = ty - fy
    const mx = (fx + tx) / 2

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', `M ${fx} ${fy} C ${mx} ${fy}, ${mx} ${ty}, ${tx} ${ty}`)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'rgba(232,221,181,0.25)')
    path.setAttribute('stroke-width', '1.5')
    path.setAttribute('marker-end', 'url(#arrow)')
    path.style.cursor = 'pointer'
    path.addEventListener('click', () => removeEdge(e.from, e.to))

    svg.appendChild(path)
  })

  // arrow marker
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  marker.setAttribute('id', 'arrow')
  marker.setAttribute('markerWidth', '8')
  marker.setAttribute('markerHeight', '8')
  marker.setAttribute('refX', '6')
  marker.setAttribute('refY', '3')
  marker.setAttribute('orient', 'auto')
  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  arrowPath.setAttribute('d', 'M0,0 L0,6 L6,3 z')
  arrowPath.setAttribute('fill', 'rgba(232,221,181,0.4)')
  marker.appendChild(arrowPath)
  defs.appendChild(marker)
  svg.prepend(defs)
}

// canvas mouse events

const canvasArea = document.getElementById('canvas-area')

canvasArea.addEventListener('mousemove', e => {
  if (dragging) {
    const canvasRect = canvasArea.getBoundingClientRect()
    const node = nodes.find(n => n.id === dragging)
    if (node) {
      node.x = (e.clientX - canvasRect.left - dragOffset.x - canvasPan.x) / canvasScale
      node.y = (e.clientY - canvasRect.top - dragOffset.y - canvasPan.y) / canvasScale
      const el = document.getElementById('node-' + dragging)
      if (el) { el.style.left = node.x + 'px'; el.style.top = node.y + 'px' }
      renderEdges()
    }
  }
  if (isPanning) {
    canvasPan.x += e.clientX - panStart.x
    canvasPan.y += e.clientY - panStart.y
    panStart = { x: e.clientX, y: e.clientY }
    const nodesEl = document.getElementById('canvas-nodes')
    nodesEl.style.transform = `translate(${canvasPan.x}px,${canvasPan.y}px) scale(${canvasScale})`
    const svg = document.getElementById('canvas-svg')
    svg.style.transform = `translate(${canvasPan.x}px,${canvasPan.y}px) scale(${canvasScale})`
  }
})

canvasArea.addEventListener('mouseup', e => {
  dragging = null
  connectingFrom = null
  if (isPanning) { isPanning = false; canvasArea.style.cursor = '' }
})

canvasArea.addEventListener('mousedown', e => {
  if (e.target === canvasArea || e.target.classList.contains('canvas-nodes')) {
    selectedNode = null
    closeNodePanel()
    if (e.button === 1 || e.altKey) {
      isPanning = true
      panStart = { x: e.clientX, y: e.clientY }
      canvasArea.style.cursor = 'grabbing'
    }
  }
})

canvasArea.addEventListener('wheel', e => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  canvasScale = Math.min(2, Math.max(0.3, canvasScale * delta))
  const nodesEl = document.getElementById('canvas-nodes')
  nodesEl.style.transform = `translate(${canvasPan.x}px,${canvasPan.y}px) scale(${canvasScale})`
  const svg = document.getElementById('canvas-svg')
  svg.style.transform = `translate(${canvasPan.x}px,${canvasPan.y}px) scale(${canvasScale})`
}, { passive: false })

// tools

function setTool(t) {
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('tool-' + t)?.classList.add('active')
}

function addNode(type) {
  const id = String(nextNodeId++)
  const canvasRect = canvasArea.getBoundingClientRect()
  const cx = (canvasRect.width / 2 - canvasPan.x) / canvasScale
  const cy = (canvasRect.height / 2 - canvasPan.y) / canvasScale
  nodes.push({
    id,
    type,
    label: type === 'milestone' ? 'new milestone' : type === 'section' ? 'section' : type === 'done' ? 'done' : type === 'warning' ? 'note' : 'new task',
    desc: '',
    date: '',
    x: cx - 70 + Math.random() * 60 - 30,
    y: cy - 30 + Math.random() * 60 - 30
  })
  renderCanvas()
  selectNode(id)
}

function addEdge(from, to) {
  if (edges.find(e => e.from === from && e.to === to)) return
  edges.push({ from, to })
}

function removeEdge(from, to) {
  edges = edges.filter(e => !(e.from === from && e.to === to))
  renderCanvas()
}

function removeNode(id) {
  nodes = nodes.filter(n => n.id !== id)
  edges = edges.filter(e => e.from !== id && e.to !== id)
  if (selectedNode && selectedNode.id === id) { selectedNode = null; closeNodePanel() }
  renderCanvas()
}

function deleteSelected() {
  if (selectedNode) removeNode(selectedNode.id)
}

function selectNode(id) {
  selectedNode = nodes.find(n => n.id === id) || null
  document.querySelectorAll('.r-node').forEach(el => el.classList.remove('selected'))
  if (selectedNode) {
    document.getElementById('node-' + id)?.classList.add('selected')
    openNodePanel(selectedNode)
  }
}

function openNodePanel(n) {
  const panel = document.getElementById('node-panel')
  panel.classList.add('open')
  document.getElementById('np-label').value = n.label || ''
  document.getElementById('np-desc').value = n.desc || ''
  document.getElementById('np-date').value = n.date || ''
  document.getElementById('np-type').value = n.type || 'task'
}

function closeNodePanel() {
  document.getElementById('node-panel').classList.remove('open')
}

function updateSelectedNode() {
  if (!selectedNode) return
  selectedNode.label = document.getElementById('np-label').value
  selectedNode.desc = document.getElementById('np-desc').value
  selectedNode.date = document.getElementById('np-date').value
  selectedNode.type = document.getElementById('np-type').value
  const node = nodes.find(n => n.id === selectedNode.id)
  if (node) Object.assign(node, selectedNode)
  // re-render just this node
  const el = document.getElementById('node-' + selectedNode.id)
  if (el) {
    const newEl = createNodeEl(selectedNode)
    el.replaceWith(newEl)
    newEl.classList.add('selected')
  }
}

async function saveRoadmap() {
  if (!currentRoadmap) return
  try {
    const r = await api('PUT', `/roadmaps/${currentRoadmap.id}`, {
      title: document.getElementById('editor-title').value.trim() || 'untitled',
      nodes,
      edges
    })
    currentRoadmap = r
    toast('saved', 'success')
  } catch (e) {
    toast(e.message, 'error')
  }
}

async function saveTitle() {
  if (!currentRoadmap) return
  const title = document.getElementById('editor-title').value.trim() || 'untitled'
  try {
    await api('PUT', `/roadmaps/${currentRoadmap.id}`, { title })
    currentRoadmap.title = title
  } catch {}
}

async function saveVisibility() {
  if (!currentRoadmap || !currentRoadmap.isOwner) return
  const isPublic = document.getElementById('editor-public').checked
  try {
    await api('PUT', `/roadmaps/${currentRoadmap.id}`, { isPublic })
    currentRoadmap.isPublic = isPublic
    handleToggle()
    document.getElementById('analytics-btn').style.display = isPublic ? '' : 'none'
    toast(isPublic ? 'now public' : 'now private')
  } catch (e) {
    toast(e.message, 'error')
  }
}

function handleToggle() {
  const cb = document.getElementById('editor-public')
  const track = document.getElementById('toggle-track')
  const thumb = document.getElementById('toggle-thumb')
  if (!cb || !track || !thumb) return
  if (cb.checked) {
    track.style.background = 'rgba(232,221,181,0.2)'
    track.style.borderColor = 'var(--cream3)'
    thumb.style.background = 'var(--cream)'
    thumb.style.left = '18px'
  } else {
    track.style.background = 'var(--bg4)'
    track.style.borderColor = 'var(--border)'
    thumb.style.background = 'var(--text3)'
    thumb.style.left = '2px'
  }
}

document.getElementById('editor-public').addEventListener('change', handleToggle)

// ── collaborators ──────────────────────────────────────────────────────────────

function openModal_manageCollabs() {
  if (!currentRoadmap) return
  openModal('manage-collabs')
  renderCollabsList()
  document.getElementById('collabs-owner-section').style.display =
    currentRoadmap.isOwner ? '' : 'none'
}

// override openModal for manage-collabs
const _openModal = openModal
window.openModal = function(name) {
  if (name === 'manage-collabs') return openModal_manageCollabs()
  _openModal(name)
}

function renderCollabsList() {
  const list = document.getElementById('collabs-list')
  const collabs = currentRoadmap?.collaborators || []
  if (!collabs.length) { list.innerHTML = '<div style="font-size:0.78rem;color:var(--text3)">no collaborators yet</div>'; return }
  list.innerHTML = collabs.map(u => `
    <div class="collab-item">
      <span>${esc(u)}</span>
      ${currentRoadmap.isOwner ? `<button class="btn-icon" style="color:var(--red)" onclick="removeCollab('${esc(u)}')">×</button>` : ''}
    </div>
  `).join('')
}

async function addCollab() {
  const username = document.getElementById('collab-username-input').value.trim()
  const err = document.getElementById('collab-error')
  err.classList.remove('show')
  if (!username) return
  try {
    const collabs = [...(currentRoadmap.collaborators || []), username]
    const r = await api('PUT', `/roadmaps/${currentRoadmap.id}`, { collaborators: collabs })
    currentRoadmap.collaborators = r.collaborators
    document.getElementById('collab-username-input').value = ''
    renderCollabsList()
    toast('collaborator added')
  } catch (e) {
    err.textContent = e.message; err.classList.add('show')
  }
}

async function removeCollab(username) {
  try {
    const collabs = (currentRoadmap.collaborators || []).filter(u => u !== username)
    const r = await api('PUT', `/roadmaps/${currentRoadmap.id}`, { collaborators: collabs })
    currentRoadmap.collaborators = r.collaborators
    renderCollabsList()
    toast('removed')
  } catch (e) {
    toast(e.message, 'error')
  }
}

// ── roadmap view (public) ──────────────────────────────────────────────────────

async function viewRoadmap(id) {
  try {
    const r = await api('GET', `/roadmaps/${id}`)
    currentRoadmap = r
    renderRoadmapView(r)
    goPage('roadmap-view')
  } catch (e) {
    toast(e.message, 'error')
  }
}

function renderRoadmapView(r) {
  document.getElementById('rv-title').textContent = r.title
  document.getElementById('rv-by').textContent = 'by ' + r.ownerUsername
  document.getElementById('rv-owner-link').textContent = r.ownerUsername
  document.getElementById('rv-nodes-count').textContent = r.nodes.length + ' nodes'
  document.getElementById('rv-updated').textContent = 'updated ' + timeAgo(r.updatedAt)
  document.getElementById('like-count').textContent = r.likeCount
  document.getElementById('fork-count').textContent = r.forkCount || ''

  const likeBtn = document.getElementById('like-btn')
  likeBtn.classList.toggle('liked', r.liked)
  likeBtn.style.display = me ? '' : 'none'

  document.getElementById('fork-btn').style.display = me && !r.isOwner ? '' : 'none'
  document.getElementById('edit-rv-btn').style.display = r.canEdit ? '' : 'none'

  // forked from
  const forkEl = document.getElementById('rv-forked-from')
  if (r.forkedFrom) {
    forkEl.style.display = ''
    document.getElementById('rv-fork-link').textContent = 'original'
    document.getElementById('rv-fork-link').onclick = () => viewRoadmap(r.forkedFrom)
  } else forkEl.style.display = 'none'

  // tags
  const tagsEl = document.getElementById('rv-tags')
  tagsEl.innerHTML = r.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')

  // render canvas (readonly)
  renderReadonlyCanvas(r)

  // comments
  document.getElementById('comment-form-wrap').style.display = me ? '' : 'none'
  document.getElementById('comment-count').textContent = r.comments.length
  renderComments(r.comments, r)
}

function renderReadonlyCanvas(r) {
  const nodesEl = document.getElementById('rv-nodes')
  const svg = document.getElementById('rv-svg')
  nodesEl.innerHTML = ''
  svg.innerHTML = ''

  r.nodes.forEach(n => {
    const el = document.createElement('div')
    el.className = `r-node type-${n.type || 'task'}`
    el.style.left = n.x + 'px'
    el.style.top = n.y + 'px'
    el.style.cursor = 'default'
    const typeIcons = { task: '◻', milestone: '★', section: '─', done: '✓', warning: '⚠' }
    el.innerHTML = `
      <div class="node-type-icon">${typeIcons[n.type || 'task'] || '◻'}</div>
      <div class="node-label">${esc(n.label || '')}</div>
      ${n.desc ? `<div class="node-desc">${esc(n.desc)}</div>` : ''}
      ${n.date ? `<div class="node-date">${n.date}</div>` : ''}
    `
    nodesEl.appendChild(el)
  })

  // edges (after nodes are in DOM)
  setTimeout(() => {
    r.edges.forEach(e => {
      const fromNode = r.nodes.find(n => n.id === e.from)
      const toNode = r.nodes.find(n => n.id === e.to)
      if (!fromNode || !toNode) return
      const fromEl = nodesEl.querySelector('[style*="left: ' + fromNode.x + 'px"]')
      const toEl2 = nodesEl.querySelector('[style*="left: ' + toNode.x + 'px"]')

      const fx = fromNode.x + 70
      const fy = fromNode.y + 35
      const tx = toNode.x + 70
      const ty = toNode.y + 35
      const mx = (fx + tx) / 2

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', `M ${fx} ${fy} C ${mx} ${fy}, ${mx} ${ty}, ${tx} ${ty}`)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', 'rgba(232,221,181,0.22)')
      path.setAttribute('stroke-width', '1.5')
      path.setAttribute('marker-end', 'url(#rv-arrow)')
      svg.appendChild(path)
    })

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
    marker.setAttribute('id', 'rv-arrow')
    marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '8')
    marker.setAttribute('refX', '6'); marker.setAttribute('refY', '3')
    marker.setAttribute('orient', 'auto')
    const ap = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    ap.setAttribute('d', 'M0,0 L0,6 L6,3 z')
    ap.setAttribute('fill', 'rgba(232,221,181,0.35)')
    marker.appendChild(ap); defs.appendChild(marker); svg.prepend(defs)
  }, 50)
}

function renderComments(comments, r) {
  const el = document.getElementById('comments-list')
  if (!comments.length) { el.innerHTML = '<div style="font-size:0.82rem;color:var(--text3)">no comments yet</div>'; return }
  el.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-header">
        <span class="comment-user">${esc(c.username)}</span>
        <span class="comment-time">${timeAgo(c.createdAt)}</span>
        ${me && (c.userId === me.id || r.isOwner) ? `<button class="btn-icon comment-del" onclick="deleteComment('${c.id}')" title="delete">×</button>` : ''}
      </div>
      <div class="comment-text">${esc(c.text)}</div>
    </div>
  `).join('')
}

async function toggleLike() {
  if (!me) return openModal('login')
  if (!currentRoadmap) return
  try {
    const r = await api('POST', `/roadmaps/${currentRoadmap.id}/like`)
    document.getElementById('like-count').textContent = r.likes
    const btn = document.getElementById('like-btn')
    btn.classList.toggle('liked', r.liked)
    currentRoadmap.likeCount = r.likes
    currentRoadmap.liked = r.liked
  } catch (e) {
    toast(e.message, 'error')
  }
}

async function forkRoadmap() {
  if (!me) return openModal('login')
  if (!currentRoadmap) return
  try {
    const r = await api('POST', `/roadmaps/${currentRoadmap.id}/fork`)
    toast('forked! opening your copy...')
    setTimeout(() => editRoadmap(r), 800)
  } catch (e) {
    toast(e.message, 'error')
  }
}

async function postComment() {
  if (!me) return openModal('login')
  const text = document.getElementById('comment-input').value.trim()
  if (!text) return
  try {
    await api('POST', `/roadmaps/${currentRoadmap.id}/comment`, { text })
    document.getElementById('comment-input').value = ''
    const r = await api('GET', `/roadmaps/${currentRoadmap.id}`)
    currentRoadmap = r
    document.getElementById('comment-count').textContent = r.comments.length
    renderComments(r.comments, r)
  } catch (e) {
    toast(e.message, 'error')
  }
}

async function deleteComment(cid) {
  try {
    await api('DELETE', `/roadmaps/${currentRoadmap.id}/comment/${cid}`)
    const r = await api('GET', `/roadmaps/${currentRoadmap.id}`)
    currentRoadmap = r
    document.getElementById('comment-count').textContent = r.comments.length
    renderComments(r.comments, r)
  } catch (e) {
    toast(e.message, 'error')
  }
}

// ── analytics ──────────────────────────────────────────────────────────────────

async function openAnalytics() {
  if (!currentRoadmap) return
  try {
    const a = await api('GET', `/roadmaps/${currentRoadmap.id}/analytics`)
    const grid = document.getElementById('stat-grid')
    const stats = [
      { label: 'total views', value: a.views },
      { label: 'likes', value: a.likes },
      { label: 'comments', value: a.comments },
      { label: 'forks', value: a.forkCount },
      { label: 'collaborators', value: a.collaborators },
      { label: 'nodes', value: a.nodeCount }
    ]
    grid.innerHTML = stats.map(s => `
      <div class="stat-card">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value">${s.value}</div>
      </div>
    `).join('')
    goPage('analytics')
  } catch (e) {
    toast(e.message, 'error')
  }
}

// ── utils ──────────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60)
  if (h < 24) return h + 'h ago'
  const d = Math.floor(h / 24)
  if (d < 30) return d + 'd ago'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
