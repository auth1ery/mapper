const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// ── data helpers ───────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const ROADMAPS_FILE = path.join(DATA_DIR, 'roadmaps.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(path.join(__dirname, 'logs'))) fs.mkdirSync(path.join(__dirname, 'logs'))

function readJSON(file) {
  try {
    if (!fs.existsSync(file)) return {}
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch { return {} }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function getUsers() { return readJSON(USERS_FILE) }
function saveUsers(u) { writeJSON(USERS_FILE, u) }
function getRoadmaps() { return readJSON(ROADMAPS_FILE) }
function saveRoadmaps(r) { writeJSON(ROADMAPS_FILE, r) }

// ── middleware ─────────────────────────────────────────────────────────────────

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.static(path.join(__dirname, 'public')))

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'no token' })
  try {
    req.user = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'invalid token' })
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header) {
    try { req.user = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET) } catch {}
  }
  next()
}

// ── auth routes ────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { username, password, email } = req.body
  if (!username || !password || !email)
    return res.status(400).json({ error: 'all fields required' })
  if (username.length < 3 || username.length > 20)
    return res.status(400).json({ error: 'username must be 3–20 chars' })
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return res.status(400).json({ error: 'username: letters, numbers, underscores only' })
  if (password.length < 6)
    return res.status(400).json({ error: 'password must be at least 6 chars' })

  const users = getUsers()
  const lc = username.toLowerCase()
  if (Object.values(users).find(u => u.username.toLowerCase() === lc))
    return res.status(400).json({ error: 'username taken' })
  if (Object.values(users).find(u => u.email === email))
    return res.status(400).json({ error: 'email already registered' })

  const id = uuidv4()
  users[id] = {
    id, username, email,
    password: await bcrypt.hash(password, 10),
    createdAt: Date.now(),
    bio: ''
  }
  saveUsers(users)

  const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: { id, username, email } })
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const users = getUsers()
  const user = Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase())
  if (!user) return res.status(400).json({ error: 'user not found' })
  if (!await bcrypt.compare(password, user.password))
    return res.status(400).json({ error: 'wrong password' })

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
})

app.get('/api/auth/me', auth, (req, res) => {
  const users = getUsers()
  const user = users[req.user.id]
  if (!user) return res.status(404).json({ error: 'user not found' })
  res.json({ id: user.id, username: user.username, email: user.email, bio: user.bio })
})

// ── roadmap routes ─────────────────────────────────────────────────────────────

// create roadmap
app.post('/api/roadmaps', auth, (req, res) => {
  const { title, description, isPublic } = req.body
  if (!title) return res.status(400).json({ error: 'title required' })

  const roadmaps = getRoadmaps()
  const id = uuidv4()
  roadmaps[id] = {
    id,
    title: title.trim(),
    description: description?.trim() || '',
    isPublic: Boolean(isPublic),
    ownerId: req.user.id,
    ownerUsername: req.user.username,
    collaborators: [],
    nodes: [],
    edges: [],
    tags: [],
    likes: [],
    comments: [],
    views: 0,
    forkCount: 0,
    forkedFrom: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  saveRoadmaps(roadmaps)
  res.json(roadmaps[id])
})

// get my roadmaps
app.get('/api/roadmaps/mine', auth, (req, res) => {
  const roadmaps = getRoadmaps()
  const mine = Object.values(roadmaps)
    .filter(r => r.ownerId === req.user.id || r.collaborators.includes(req.user.username))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(r => sanitize(r, req.user))
  res.json(mine)
})

// browse public roadmaps
app.get('/api/roadmaps/public', optionalAuth, (req, res) => {
  const { q, sort = 'recent', page = 1 } = req.query
  const roadmaps = getRoadmaps()
  let list = Object.values(roadmaps).filter(r => r.isPublic)

  if (q) {
    const lc = q.toLowerCase()
    list = list.filter(r =>
      r.title.toLowerCase().includes(lc) ||
      r.description.toLowerCase().includes(lc) ||
      r.ownerUsername.toLowerCase().includes(lc) ||
      r.tags.some(t => t.toLowerCase().includes(lc))
    )
  }

  if (sort === 'trending') {
    const now = Date.now()
    list = list.sort((a, b) => {
      const scoreA = a.likes.length * 3 + a.comments.length * 2 + a.views + a.forkCount * 4 - (now - a.updatedAt) / 3600000
      const scoreB = b.likes.length * 3 + b.comments.length * 2 + b.views + b.forkCount * 4 - (now - b.updatedAt) / 3600000
      return scoreB - scoreA
    })
  } else if (sort === 'likes') {
    list = list.sort((a, b) => b.likes.length - a.likes.length)
  } else {
    list = list.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  const perPage = 12
  const total = list.length
  const paginated = list.slice((page - 1) * perPage, page * perPage).map(r => sanitize(r, req.user))
  res.json({ roadmaps: paginated, total, pages: Math.ceil(total / perPage) })
})

// trending
app.get('/api/roadmaps/trending', optionalAuth, (req, res) => {
  const roadmaps = getRoadmaps()
  const now = Date.now()
  const list = Object.values(roadmaps)
    .filter(r => r.isPublic)
    .map(r => ({
      ...r,
      score: r.likes.length * 3 + r.comments.length * 2 + r.views + r.forkCount * 4 - (now - r.updatedAt) / 3600000
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(r => sanitize(r, req.user))
  res.json(list)
})

// get single roadmap
app.get('/api/roadmaps/:id', optionalAuth, (req, res) => {
  const roadmaps = getRoadmaps()
  const r = roadmaps[req.params.id]
  if (!r) return res.status(404).json({ error: 'not found' })

  const canView = r.isPublic || (req.user && (r.ownerId === req.user.id || r.collaborators.includes(req.user.username)))
  if (!canView) return res.status(403).json({ error: 'private' })

  // count view if not owner
  if (!req.user || req.user.id !== r.ownerId) {
    roadmaps[req.params.id].views++
    saveRoadmaps(roadmaps)
  }

  res.json(sanitize(r, req.user))
})

// update roadmap
app.put('/api/roadmaps/:id', auth, (req, res) => {
  const roadmaps = getRoadmaps()
  const r = roadmaps[req.params.id]
  if (!r) return res.status(404).json({ error: 'not found' })

  const canEdit = r.ownerId === req.user.id || r.collaborators.includes(req.user.username)
  if (!canEdit) return res.status(403).json({ error: 'not allowed' })

  const allowed = ['title', 'description', 'isPublic', 'nodes', 'edges', 'tags']
  // only owner can change visibility and collab list
  if (req.body.collaborators !== undefined && r.ownerId === req.user.id)
    r.collaborators = req.body.collaborators
  allowed.forEach(k => { if (req.body[k] !== undefined) r[k] = req.body[k] })
  r.updatedAt = Date.now()

  saveRoadmaps(roadmaps)
  res.json(sanitize(r, req.user))
})

// delete roadmap
app.delete('/api/roadmaps/:id', auth, (req, res) => {
  const roadmaps = getRoadmaps()
  const r = roadmaps[req.params.id]
  if (!r) return res.status(404).json({ error: 'not found' })
  if (r.ownerId !== req.user.id) return res.status(403).json({ error: 'not owner' })
  delete roadmaps[req.params.id]
  saveRoadmaps(roadmaps)
  res.json({ ok: true })
})

// like / unlike
app.post('/api/roadmaps/:id/like', auth, (req, res) => {
  const roadmaps = getRoadmaps()
  const r = roadmaps[req.params.id]
  if (!r || !r.isPublic) return res.status(404).json({ error: 'not found' })

  const idx = r.likes.indexOf(req.user.id)
  if (idx === -1) r.likes.push(req.user.id)
  else r.likes.splice(idx, 1)
  saveRoadmaps(roadmaps)
  res.json({ likes: r.likes.length, liked: idx === -1 })
})

// comment
app.post('/api/roadmaps/:id/comment', auth, (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'empty comment' })
  const roadmaps = getRoadmaps()
  const r = roadmaps[req.params.id]
  if (!r || !r.isPublic) return res.status(404).json({ error: 'not found' })

  const comment = {
    id: uuidv4(),
    userId: req.user.id,
    username: req.user.username,
    text: text.trim().slice(0, 500),
    createdAt: Date.now()
  }
  r.comments.push(comment)
  saveRoadmaps(roadmaps)
  res.json(comment)
})

// delete comment
app.delete('/api/roadmaps/:id/comment/:cid', auth, (req, res) => {
  const roadmaps = getRoadmaps()
  const r = roadmaps[req.params.id]
  if (!r) return res.status(404).json({ error: 'not found' })
  const ci = r.comments.findIndex(c => c.id === req.params.cid)
  if (ci === -1) return res.status(404).json({ error: 'comment not found' })
  const c = r.comments[ci]
  if (c.userId !== req.user.id && r.ownerId !== req.user.id)
    return res.status(403).json({ error: 'not allowed' })
  r.comments.splice(ci, 1)
  saveRoadmaps(roadmaps)
  res.json({ ok: true })
})

// fork
app.post('/api/roadmaps/:id/fork', auth, (req, res) => {
  const roadmaps = getRoadmaps()
  const src = roadmaps[req.params.id]
  if (!src || !src.isPublic) return res.status(404).json({ error: 'not found' })

  const id = uuidv4()
  roadmaps[id] = {
    ...JSON.parse(JSON.stringify(src)),
    id,
    title: `${src.title} (fork)`,
    ownerId: req.user.id,
    ownerUsername: req.user.username,
    collaborators: [],
    likes: [],
    comments: [],
    views: 0,
    forkCount: 0,
    forkedFrom: src.id,
    isPublic: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  roadmaps[req.params.id].forkCount++
  saveRoadmaps(roadmaps)
  res.json(roadmaps[id])
})

// analytics for owner
app.get('/api/roadmaps/:id/analytics', auth, (req, res) => {
  const roadmaps = getRoadmaps()
  const r = roadmaps[req.params.id]
  if (!r) return res.status(404).json({ error: 'not found' })
  if (r.ownerId !== req.user.id) return res.status(403).json({ error: 'not owner' })

  res.json({
    views: r.views,
    likes: r.likes.length,
    comments: r.comments.length,
    forkCount: r.forkCount,
    collaborators: r.collaborators.length,
    nodeCount: r.nodes.length,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  })
})

// user profile
app.get('/api/users/:username', optionalAuth, (req, res) => {
  const users = getUsers()
  const user = Object.values(users).find(u => u.username.toLowerCase() === req.params.username.toLowerCase())
  if (!user) return res.status(404).json({ error: 'user not found' })

  const roadmaps = getRoadmaps()
  const userRoadmaps = Object.values(roadmaps)
    .filter(r => r.ownerId === user.id && (r.isPublic || (req.user && req.user.id === user.id)))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(r => sanitize(r, req.user))

  res.json({
    username: user.username,
    bio: user.bio,
    createdAt: user.createdAt,
    roadmaps: userRoadmaps
  })
})

// ── helpers ────────────────────────────────────────────────────────────────────

function sanitize(r, user) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    isPublic: r.isPublic,
    ownerId: r.ownerId,
    ownerUsername: r.ownerUsername,
    collaborators: r.collaborators,
    nodes: r.nodes,
    edges: r.edges,
    tags: r.tags,
    likeCount: r.likes.length,
    liked: user ? r.likes.includes(user.id) : false,
    commentCount: r.comments.length,
    comments: r.comments,
    views: r.views,
    forkCount: r.forkCount,
    forkedFrom: r.forkedFrom,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    canEdit: user ? (r.ownerId === user.id || r.collaborators.includes(user.username)) : false,
    isOwner: user ? r.ownerId === user.id : false
  }
}

// ── serve app ──────────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`mapper running on :${PORT}`)
})
