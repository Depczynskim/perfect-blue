#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const CSV_PATH = 'Municipis_Catalunya/Municipis_Catalunya_Geo_20260221.csv';
const REQUIRED_HEADERS = ['Codi', 'Nom', 'Codi comarca', 'Nom comarca', 'Longitud', 'Latitud'];
const ACTIVE_REGION_COMARQUES = [
  'Alt Camp',
  'Baix Camp',
  'Baix Penedès',
  'Conca de Barberà',
  'Priorat',
  'Tarragonès',
];

const shouldApply = process.argv.includes('--apply');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function normalizeText(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
}

function detectDelimiterFromHeader(text) {
  const firstNonEmptyLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstNonEmptyLine) {
    throw new Error('CSV file is empty: cannot detect delimiter');
  }

  const candidates = [';', ',', '\t'];
  const counts = candidates.map((delimiter) => ({
    delimiter,
    count: [...firstNonEmptyLine].filter((char) => char === delimiter).length,
  }));

  counts.sort((a, b) => b.count - a.count);
  const selected = counts[0];

  if (!selected || selected.count === 0) {
    throw new Error('Unable to detect delimiter from header line (no ; , or tab found)');
  }

  return selected.delimiter;
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows
    .map((r) => r.map((cell) => cell.trim()))
    .filter((r) => r.some((cell) => cell !== ''));
}

function parseIntegerStrict(value, fieldName, rowNumber) {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new Error(`Row ${rowNumber}: missing required integer field "${fieldName}"`);
  }
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${rowNumber}: invalid integer in "${fieldName}" -> "${value}"`);
  }
  return parsed;
}

function parseFloatStrict(value, fieldName, rowNumber) {
  const normalized = normalizeText(value);
  if (!normalized) {
    throw new Error(`Row ${rowNumber}: missing required numeric field "${fieldName}"`);
  }
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${rowNumber}: invalid number in "${fieldName}" -> "${value}"`);
  }
  return parsed;
}

function slugifyBase(name) {
  const transliterationMap = {
    à: 'a', á: 'a', â: 'a', ä: 'a', ã: 'a', å: 'a', ā: 'a', ă: 'a', ą: 'a',
    ç: 'c', ć: 'c', č: 'c',
    ď: 'd',
    è: 'e', é: 'e', ê: 'e', ë: 'e', ē: 'e', ė: 'e', ę: 'e', ě: 'e',
    ì: 'i', í: 'i', î: 'i', ï: 'i', ī: 'i', į: 'i',
    ł: 'l',
    ñ: 'n', ń: 'n', ň: 'n',
    ò: 'o', ó: 'o', ô: 'o', ö: 'o', õ: 'o', ø: 'o', ō: 'o', ő: 'o',
    ŕ: 'r', ř: 'r',
    ś: 's', š: 's', ș: 's',
    ť: 't', ț: 't',
    ù: 'u', ú: 'u', û: 'u', ü: 'u', ū: 'u', ů: 'u', ű: 'u',
    ý: 'y', ÿ: 'y',
    ź: 'z', ž: 'z', ż: 'z',
  };

  const lowered = normalizeText(name).toLowerCase();
  const transliterated = [...lowered]
    .map((char) => transliterationMap[char] ?? char)
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const withoutApostrophes = transliterated.replace(/['`´]/g, '');
  const punctuationRemoved = withoutApostrophes.replace(/[^a-z0-9\s-]/g, ' ');
  const hyphenated = punctuationRemoved.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return hyphenated || 'city';
}

function prepareRows(rawRows, headerIndex) {
  const stats = {
    dataRows: 0,
    droppedPlaceholderCode: 0,
    droppedZeroCoordinates: 0,
    cleanedRows: 0,
  };

  const cleaned = [];

  for (let i = 1; i < rawRows.length; i += 1) {
    const row = rawRows[i];
    if (!row || row.every((cell) => !normalizeText(cell))) {
      continue;
    }
    stats.dataRows += 1;

    const rowNumber = i + 1;
    const ineCode = parseIntegerStrict(row[headerIndex['Codi']], 'Codi', rowNumber);
    const name = normalizeText(row[headerIndex['Nom']]);
    const comarcaCode = parseIntegerStrict(row[headerIndex['Codi comarca']], 'Codi comarca', rowNumber);
    const comarca = normalizeText(row[headerIndex['Nom comarca']]);
    const lng = parseFloatStrict(row[headerIndex['Longitud']], 'Longitud', rowNumber);
    const lat = parseFloatStrict(row[headerIndex['Latitud']], 'Latitud', rowNumber);

    if (!name) {
      throw new Error(`Row ${rowNumber}: missing required field "Nom"`);
    }
    if (!comarca) {
      throw new Error(`Row ${rowNumber}: missing required field "Nom comarca"`);
    }

    if (ineCode === 999998 || ineCode === 999999) {
      stats.droppedPlaceholderCode += 1;
      continue;
    }

    if (lat === 0 && lng === 0) {
      stats.droppedZeroCoordinates += 1;
      continue;
    }

    cleaned.push({
      ine_code: ineCode,
      name,
      comarca_code: comarcaCode,
      comarca,
      lat,
      lng,
      autonomous_community: 'Catalonia',
      status: 'approved',
      is_active_region: false,
    });
  }

  stats.cleanedRows = cleaned.length;
  return { cleaned, stats };
}

function resolveSlugs(rows, existingCities = []) {
  const existingSlugByIneCode = new Map();
  const usedSlugsByOtherCodes = new Set();

  for (const city of existingCities) {
    if (city?.ine_code == null || !city?.slug) continue;
    existingSlugByIneCode.set(city.ine_code, city.slug);
    usedSlugsByOtherCodes.add(city.slug);
  }

  const baseSlugCounts = new Map();
  for (const row of rows) {
    const base = slugifyBase(row.name);
    baseSlugCounts.set(base, (baseSlugCounts.get(base) || 0) + 1);
  }

  const resolved = [];
  const finalSlugs = new Set();

  for (const row of rows) {
    const base = slugifyBase(row.name);
    const existingForSameCode = existingSlugByIneCode.get(row.ine_code);
    const hasInternalCollision = (baseSlugCounts.get(base) || 0) > 1;
    const hasExternalCollision = usedSlugsByOtherCodes.has(base) && existingForSameCode !== base;
    const slug = hasInternalCollision || hasExternalCollision ? `${base}-${row.ine_code}` : base;

    if (finalSlugs.has(slug)) {
      throw new Error(`Slug collision after resolution for slug "${slug}".`);
    }
    finalSlugs.add(slug);

    resolved.push({
      ...row,
      slug,
    });
  }

  return resolved;
}

async function fetchExistingCities() {
  const all = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from('cities')
      .select('ine_code, slug')
      .range(from, to);

    if (error) {
      throw new Error(`Failed to read existing cities: ${error.message}`);
    }

    const page = data || [];
    all.push(...page);
    if (page.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

async function upsertCities(rows) {
  const chunkSize = 500;
  let upserted = 0;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('cities')
      .upsert(chunk, { onConflict: 'ine_code' });

    if (error) {
      throw new Error(`Failed to upsert cities chunk ${i}-${i + chunk.length - 1}: ${error.message}`);
    }

    upserted += chunk.length;
  }

  return upserted;
}

async function applyActiveRegionFlags() {
  const { error: resetError } = await supabase
    .from('cities')
    .update({ is_active_region: false })
    .eq('status', 'approved');

  if (resetError) {
    throw new Error(`Failed to reset is_active_region: ${resetError.message}`);
  }

  const { error: setActiveError } = await supabase
    .from('cities')
    .update({ is_active_region: true })
    .eq('status', 'approved')
    .in('comarca', ACTIVE_REGION_COMARQUES);

  if (setActiveError) {
    throw new Error(`Failed to set active region comarques: ${setActiveError.message}`);
  }
}

function printChecklist() {
  console.log('\nVerification checklist (run in Supabase SQL editor):');
  console.log('1) SELECT COUNT(*) FROM public.cities; -- expected: 947');
  console.log('2) SELECT ine_code, COUNT(*) FROM public.cities GROUP BY ine_code HAVING COUNT(*) > 1;');
  console.log('3) SELECT slug, COUNT(*) FROM public.cities GROUP BY slug HAVING COUNT(*) > 1;');
  console.log('4) SELECT COUNT(*) FROM public.cities WHERE lat = 0 AND lng = 0;');
  console.log("5) (anon) SELECT COUNT(*) FROM public.cities WHERE status = 'pending'; -- expected: 0");
  console.log("6) (authenticated anon key) direct INSERT into public.cities should fail due to RLS (no INSERT policy).");
}

async function run() {
  const csvText = await readFile(CSV_PATH, 'utf8');
  const delimiter = detectDelimiterFromHeader(csvText);
  const parsed = parseDelimited(csvText, delimiter);

  if (parsed.length < 2) {
    throw new Error(`CSV has no data rows: ${CSV_PATH}`);
  }

  const header = parsed[0].map((cell) => normalizeText(cell));
  const headerIndex = Object.fromEntries(header.map((cell, index) => [cell, index]));
  const missingHeaders = REQUIRED_HEADERS.filter((expected) => headerIndex[expected] === undefined);

  if (missingHeaders.length > 0) {
    throw new Error(
      `Header validation failed. Missing required columns: ${missingHeaders.join(', ')}. Found header: ${header.join(' | ')}`
    );
  }

  const { cleaned, stats } = prepareRows(parsed, headerIndex);
  let existingCities = [];
  try {
    existingCities = await fetchExistingCities();
  } catch (error) {
    if (shouldApply) {
      throw error;
    }
    console.warn(`Warning: could not load existing cities (continuing dry-run): ${error.message}`);
  }
  const rowsWithSlugs = resolveSlugs(cleaned, existingCities);

  console.log(`CSV file: ${CSV_PATH}`);
  console.log(`Detected delimiter: ${JSON.stringify(delimiter)}`);
  console.log(`Header columns: ${header.length}`);
  console.log(`Data rows scanned: ${stats.dataRows}`);
  console.log(`Dropped placeholder code rows: ${stats.droppedPlaceholderCode}`);
  console.log(`Dropped zero-coordinate rows: ${stats.droppedZeroCoordinates}`);
  console.log(`Rows ready for import: ${stats.cleanedRows}`);
  console.log(`Expected valid municipalities: 947`);
  console.log(`Dry-run upsert preview count: ${rowsWithSlugs.length}`);

  if (rowsWithSlugs.length !== 947) {
    console.warn(`WARNING: cleaned row count is ${rowsWithSlugs.length}, expected 947.`);
  }

  if (!shouldApply) {
    console.log('\nDry-run complete. No database writes performed.');
    printChecklist();
    return;
  }

  const upserted = await upsertCities(rowsWithSlugs);
  await applyActiveRegionFlags();

  console.log(`\nApply complete. Upserted rows: ${upserted}`);
  console.log('Applied is_active_region=true for target Tarragonès area comarques.');
  printChecklist();
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
