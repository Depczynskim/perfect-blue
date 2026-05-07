#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const limitArg = args.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 500;

if (!Number.isFinite(limit) || limit <= 0) {
  console.error('Invalid --limit value. Example: --limit=500');
  process.exit(1);
}

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
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, ' ');
  return normalized.length > 0 ? normalized : null;
}

function hasLetters(value) {
  return /[A-Za-zÀ-ÿ]/.test(value);
}

function hasDigits(value) {
  return /\d/.test(value);
}

function inferFromAddress(addressText) {
  const normalized = normalizeText(addressText);
  if (!normalized) {
    return { city: null, zone: null };
  }

  const parts = normalized
    .split(',')
    .map((part) => normalizeText(part))
    .filter(Boolean);

  if (parts.length === 0) {
    return { city: null, zone: null };
  }

  // Prefer first clean token as city in "City, Zone, Address" format.
  let city = null;
  if (hasLetters(parts[0]) && !hasDigits(parts[0])) {
    city = parts[0];
  } else {
    // Fallback: pick first textual token from the right side.
    city = [...parts].reverse().find((part) => hasLetters(part) && !hasDigits(part)) || null;
  }

  if (!city) {
    return { city: null, zone: null };
  }

  let zone = null;
  if (parts.length > 1 && parts[0] === city) {
    const zoneCandidate = parts[1];
    if (zoneCandidate && hasLetters(zoneCandidate) && !hasDigits(zoneCandidate)) {
      zone = zoneCandidate;
    }
  }

  return { city, zone };
}

async function run() {
  const { data, error } = await supabase
    .from('listings')
    .select('id, address_text, city, zone')
    .or('city.is.null,city.eq.""')
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load listings: ${error.message}`);
  }

  const rows = data || [];
  const updates = [];
  const unresolved = [];

  for (const row of rows) {
    const inferred = inferFromAddress(row.address_text);
    if (inferred.city) {
      updates.push({
        id: row.id,
        city: inferred.city,
        zone: inferred.zone,
      });
    } else {
      unresolved.push(row.id);
    }
  }

  console.log(`Scanned rows: ${rows.length}`);
  console.log(`Resolvable city values: ${updates.length}`);
  console.log(`Unresolved rows: ${unresolved.length}`);

  if (updates.length > 0) {
    console.log('Sample inferred rows:', updates.slice(0, 10));
  }

  if (unresolved.length > 0) {
    console.log('Sample unresolved IDs:', unresolved.slice(0, 10));
  }

  if (!shouldApply) {
    console.log('Dry run complete. Use --apply to persist updates.');
    return;
  }

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        city: update.city,
        zone: update.zone,
      })
      .eq('id', update.id);

    if (updateError) {
      console.error(`Failed to update listing ${update.id}: ${updateError.message}`);
    }
  }

  console.log(`Applied updates: ${updates.length}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
