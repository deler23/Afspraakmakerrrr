const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'bedrijven.json');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
function laadData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function slaOp(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
app.get('/api/bedrijven', (req, res) => res.json(laadData()));
app.post('/api/bedrijven', (req, res) => {
  const bedrijven = laadData();
  bedrijven.push(req.body);
  slaOp(bedrijven);
  res.status(201).json(req.body);
});
app.put('/api/bedrijven/:id', (req, res) => {
  const bedrijven = laadData();
  const idx = bedrijven.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Niet gevonden' });
  bedrijven[idx] = { ...bedrijven[idx], ...req.body };
  slaOp(bedrijven);
  res.json(bedrijven[idx]);
});
app.delete('/api/bedrijven/:id', (req, res) => {
  let b = laadData();
  slaOp(b.filter(x => x.id !== req.params.id));
  res.json({ ok: true });
});
app.post('/api/bedrijven/:id/afspraken', (req, res) => {
  const b = laadData();
  const idx = b.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Niet gevonden' });
  b[idx].afspraken = [...(b[idx].afspraken || []), { ...req.body, status: 'nieuw' }];
  slaOp(b);
  res.status(201).json(req.body);
});
app.put('/api/bedrijven/:id/afspraken/:aid', (req, res) => {
  const b = laadData();
  const idx = b.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Niet gevonden' });
  b[idx].afspraken = b[idx].afspraken.map(a => a.id === req.params.aid ? { ...a, ...req.body } : a);
  slaOp(b);
  res.json({ ok: true });
});
app.delete('/api/bedrijven/:id/afspraken/:aid', (req, res) => {
  const b = laadData();
  const idx = b.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Niet gevonden' });
  b[idx].afspraken = b[idx].afspraken.filter(a => a.id !== req.params.aid);
  slaOp(b);
  res.json({ ok: true });
});
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
