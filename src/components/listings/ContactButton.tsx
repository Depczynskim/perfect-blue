'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface ContactButtonProps {
  listingId: string;
  hasAccess: boolean;
  isLoggedIn: boolean;
}

export default function ContactButton({
  listingId,
  hasAccess,
  isLoggedIn,
}: ContactButtonProps) {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      window.location.href = `/${locale}/auth/login?redirect=` + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listing_id: listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || tCommon('error'));
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError(tCommon('error'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          body: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || tCommon('error'));
      }

      setMessageSent(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Jeśli ma dostęp - pokaż formularz wiadomości
  if (hasAccess) {
    if (messageSent) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('messageSent')}
          </div>
          <p className="text-sm text-green-700">
            {t('ownerWillRespond')}
          </p>
          <button
            onClick={() => setMessageSent(false)}
            className="mt-3 text-sm text-green-600 hover:text-green-700 underline"
          >
            {t('sendAnother')}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 font-medium mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('hasSubscription')}
          </div>
          
          {!showMessageForm ? (
            <button
              onClick={() => setShowMessageForm(true)}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t('writeMessage')}
            </button>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? t('sending') : t('send')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMessageForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Jeśli nie ma dostępu - pokaż przycisk zakupu
  return (
    <div className="space-y-3">
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {tCommon('loading')}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {t('button')}
          </>
        )}
      </button>
      
      <p className="text-xs text-slate-500 text-center">
        {t('subscriptionInfo')}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!isLoggedIn && (
        <p className="text-xs text-slate-400 text-center">
          {t('loginRequired')}
        </p>
      )}
    </div>
  );
}
