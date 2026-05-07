'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { UserPreferredLocale } from '@/lib/supabase/types';

interface ProfileFormProps {
  userEmail: string;
  initialDisplayName: string;
  initialPreferredLocale: UserPreferredLocale;
}

const LOCALE_OPTIONS: { value: UserPreferredLocale; label: string }[] = [
  { value: 'pl', label: 'Polski' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ar', label: 'العربية' },
];

export default function ProfileForm({
  userEmail,
  initialDisplayName,
  initialPreferredLocale,
}: ProfileFormProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [preferredLocale, setPreferredLocale] =
    useState<UserPreferredLocale>(initialPreferredLocale);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(tCommon('error'));
      }

      const { error } = await supabase
        .from('users')
        .update({
          display_name: displayName.trim() || null,
          preferred_locale: preferredLocale,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
      document.cookie = `NEXT_LOCALE=${encodeURIComponent(
        preferredLocale
      )}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;

      setMessage({ type: 'success', text: t('updated') });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : tCommon('error'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t('loginEmail')}
        </label>
        <input
          type="email"
          value={userEmail}
          disabled
          className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
        />
        <p className="text-xs text-slate-500 mt-1">
          {t('loginEmailNote')}
        </p>
      </div>

      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-2">
          {t('displayName')}
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t('displayNamePlaceholder')}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          autoComplete="name"
        />
        <p className="text-xs text-slate-500 mt-1">
          {t('displayNameNote')}
        </p>
      </div>

      <div>
        <label htmlFor="preferredLocale" className="block text-sm font-medium text-slate-700 mb-2">
          {t('preferredLocale')}
        </label>
        <select
          id="preferredLocale"
          value={preferredLocale}
          onChange={(e) => setPreferredLocale(e.target.value as UserPreferredLocale)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-white"
        >
          {LOCALE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">
          {t('preferredLocaleNote')}
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? t('saving') : t('saveChanges')}
      </button>
    </form>
  );
}
