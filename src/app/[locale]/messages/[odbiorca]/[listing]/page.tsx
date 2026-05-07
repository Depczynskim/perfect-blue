import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { Header } from '@/components/layout';
import { formatDateTime } from '@/lib/format';
import ConversationForm from './ConversationForm';

export default async function ConversationPage({
  params,
}: {
  params: { odbiorca: string; listing: string; locale: string };
}) {
  const { locale } = params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'messages' });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const otherUserId = params.odbiorca;
  const listingId = params.listing;

  // Pobierz ogłoszenie
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, owner_id')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    notFound();
  }

  // Pobierz wiadomości między użytkownikami w kontekście tego ogłoszenia
  const { data: messages } = await supabase
    .from('messages')
    .select('id, body, created_at, from_user_id, to_user_id, is_read')
    .eq('listing_id', listingId)
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  // Oznacz wiadomości jako przeczytane
  if (messages && messages.length > 0) {
    const unreadIds = messages
      .filter(m => m.to_user_id === user.id && !m.is_read)
      .map(m => m.id);
    
    if (unreadIds.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadIds);
    }
  }

  // Sprawdź czy użytkownik może pisać (ma subskrypcję lub jest właścicielem)
  const isOwner = listing.owner_id === user.id;
  let canReply = isOwner; // Właściciel zawsze może odpowiadać

  if (!isOwner) {
    // Sprawdź subskrypcję
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_paid')
      .eq('id', user.id)
      .single();
    canReply = !!userProfile?.is_paid;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} variant="minimal" />

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Nagłówek konwersacji */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{t('conversation')}</p>
              <Link
                href={`/${locale}/listings/${listingId}`}
                className="text-lg font-semibold text-primary-600 hover:underline"
              >
                {listing.title}
              </Link>
            </div>
            <div className="text-right text-sm text-slate-500">
              {isOwner ? t('youAreOwner') : t('contactingOwner')}
            </div>
          </div>
        </div>

        {/* Lista wiadomości */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 min-h-[400px] max-h-[500px] overflow-y-auto">
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isMyMessage = msg.from_user_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-3 ${
                        isMyMessage
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.body}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMyMessage ? 'text-primary-200' : 'text-slate-500'
                        }`}
                      >
                        {formatDateTime(msg.created_at, locale)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              {t('noMessagesYet')}
            </div>
          )}
        </div>

        {/* Formularz odpowiedzi */}
        {canReply ? (
          <ConversationForm
            listingId={listingId}
            recipientId={otherUserId}
          />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              {t('subscriptionRequired')}
            </p>
            <Link
              href={`/${locale}/listings/${listingId}`}
              className="text-primary-600 hover:underline text-sm"
            >
              {t('buySubscription')} →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
