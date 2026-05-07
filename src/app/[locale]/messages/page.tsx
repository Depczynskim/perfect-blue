import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createServerClient } from '@/lib/supabase';
import { Header } from '@/components/layout';
import { formatDateTime } from '@/lib/format';

interface MessageWithDetails {
  id: string;
  body: string;
  is_read: boolean;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  listing: { id: string; title: string } | null;
}

// Grupuj wiadomości po konwersacji (listing + drugi użytkownik)
function groupByConversation(messages: MessageWithDetails[], currentUserId: string) {
  const conversations = new Map<string, {
    listingId: string;
    listingTitle: string;
    otherUserId: string;
    lastMessage: MessageWithDetails;
    unreadCount: number;
    messageCount: number;
  }>();

  for (const msg of messages) {
    if (!msg.listing) continue;
    
    const otherUserId = msg.from_user_id === currentUserId ? msg.to_user_id : msg.from_user_id;
    const key = `${msg.listing.id}-${otherUserId}`;
    
    const existing = conversations.get(key);
    if (!existing) {
      conversations.set(key, {
        listingId: msg.listing.id,
        listingTitle: msg.listing.title,
        otherUserId,
        lastMessage: msg,
        unreadCount: msg.to_user_id === currentUserId && !msg.is_read ? 1 : 0,
        messageCount: 1,
      });
    } else {
      existing.messageCount++;
      if (msg.to_user_id === currentUserId && !msg.is_read) {
        existing.unreadCount++;
      }
      // Aktualizuj ostatnią wiadomość jeśli ta jest nowsza
      if (new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
        existing.lastMessage = msg;
      }
    }
  }

  return Array.from(conversations.values()).sort(
    (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
  );
}

export default async function MessagesPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'messages' });

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Pobierz wszystkie wiadomości użytkownika (wysłane i otrzymane)
  const { data: allMessages } = await supabase
    .from('messages')
    .select(`
      id, body, is_read, created_at, from_user_id, to_user_id,
      listing:listings(id, title)
    `)
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Mapuj wiadomości do właściwego formatu (Supabase zwraca listing jako tablicę)
  const formattedMessages: MessageWithDetails[] = (allMessages || []).map((msg: any) => ({
    ...msg,
    listing: Array.isArray(msg.listing) ? msg.listing[0] : msg.listing,
  }));

  const conversations = groupByConversation(formattedMessages, user.id);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {t('title')}
            {totalUnread > 0 && (
              <span className="ml-2 bg-primary-600 text-white text-sm px-2 py-1 rounded-full">
                {t('newMessages', { count: totalUnread })}
              </span>
            )}
          </h1>
        </div>

        {conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={`${conv.listingId}-${conv.otherUserId}`}
                href={`/${locale}/messages/${conv.otherUserId}/${conv.listingId}`}
                className={`block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 ${
                  conv.unreadCount > 0 ? 'border-primary-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 flex items-center gap-2">
                      {conv.listingTitle}
                      {conv.unreadCount > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                          {t('newMessages', { count: conv.unreadCount })}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {t('messageCount', { count: conv.messageCount })}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {formatDateTime(conv.lastMessage.created_at, locale)}
                  </span>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">
                  {conv.lastMessage.from_user_id === user.id ? (
                    <span className="text-slate-400">{t('youPrefix')}</span>
                  ) : null}
                  {conv.lastMessage.body}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {t('noMessages')}
            </h3>
            <p className="text-slate-500 mb-4">
              {t('noMessagesDescription')}
            </p>
            <Link
              href={`/${locale}/listings`}
              className="text-primary-600 hover:underline"
            >
              {t('browseListings')} →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
