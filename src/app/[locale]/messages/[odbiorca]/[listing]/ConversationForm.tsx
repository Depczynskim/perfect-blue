'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface ConversationFormProps {
  listingId: string;
  recipientId: string;
}

export default function ConversationForm({
  listingId,
  recipientId,
}: ConversationFormProps) {
  const t = useTranslations('messages');
  const tCommon = useTranslations('common');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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
          to_user_id: recipientId,
          body: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || tCommon('error'));
      }

      setMessage('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('writeMessage')}
          rows={2}
          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          {isLoading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </form>
  );
}
