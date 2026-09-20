import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const required = [
  '<!doctype html>',
  'Growth Center',
  'Centro de Crecimiento',
  'var CAPS=',
  'function attention()',
  'function classify(name)',
  'ask-pdf-route',
  'drawing-review',
  'nbo-crm-core-v1-backup',
  'nbo-crm-backup.json',
  'Practical AI + Content Automation',
  'publish only after approval',
];

for (const needle of required) {
  if (!html.includes(needle)) throw new Error('Missing required CRM core feature: ' + needle);
}

if (html.includes('<script src=') || html.includes('<link rel=')) {
  throw new Error('CRM core must remain dependency-free.');
}

const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Inline application script not found.');
new Function(match[1]);

console.log('NBO CRM Core verification PASS');
console.log('Required features:', required.length);
console.log('HTML bytes:', Buffer.byteLength(html));
