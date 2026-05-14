"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

type PublicUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isPremium: boolean;
};

type Friend = {
  id: string;
  name: string;
  initials: string;
  bg: string;
  color: string;
  online: boolean;
  plus?: boolean;
  preview: string;
};

type Message = {
  id: string;
  mine: boolean;
  fromInitials: string;
  fromBg: string;
  fromColor: string;
  text: string;
  time: string;
};

function getInitials(params: { name?: string | null; email?: string | null }) {
  const base = params.name?.trim() || params.email?.split("@")[0] || "U";
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (base[1] ?? "");
  return (first + last).toUpperCase();
}

export default function ChatClient(props: {
  currentUser: { id: string; name: string | null; email: string | null; image: string | null };
  users: PublicUser[];
}) {
  const { currentUser, users } = props;

  const palette = useMemo(
    () => [
      { bg: "#bbf7d0", color: "#065f46" },
      { bg: "#fecaca", color: "#991b1b" },
      { bg: "#ddd6fe", color: "#5b21b6" },
      { bg: "#e0f2fe", color: "#075985" },
      { bg: "#fde68a", color: "#92400e" },
    ],
    []
  );

  const friends: Friend[] = useMemo(() => {
    return users.map((u, idx) => {
      const p = palette[idx % palette.length];
      const displayName = u.name ?? u.email ?? "Utilisateur";
      return {
        id: u.id,
        name: displayName,
        initials: getInitials({ name: u.name, email: u.email }),
        bg: p.bg,
        color: p.color,
        online: true, // pas de présence réelle pour l'instant (design conservé)
        plus: u.isPremium,
        preview: u.email ?? "Clique pour discuter…",
      };
    });
  }, [palette, users]);

  const [query, setQuery] = useState("");
  const [activeFriendId, setActiveFriendId] = useState<string | null>(() => friends[0]?.id ?? null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    // Si la liste change (nouveau user), on sélectionne le 1er si rien n'est sélectionné.
    if (!activeFriendId && friends[0]?.id) setActiveFriendId(friends[0].id);
  }, [activeFriendId, friends]);

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q));
  }, [friends, query]);

  const activeFriend = useMemo(() => {
    if (!activeFriendId) return null;
    return friends.find((f) => f.id === activeFriendId) ?? null;
  }, [activeFriendId, friends]);

  const meInitials = useMemo(
    () => getInitials({ name: currentUser.name, email: currentUser.email }),
    [currentUser]
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      mine: false,
      fromInitials: "TM",
      fromBg: "#bbf7d0",
      fromColor: "#065f46",
      text: "Salut ! T'as fait le quiz de maths sur les intégrales ?",
      time: "11:24",
    },
    {
      id: "m2",
      mine: true,
      fromInitials: meInitials,
      fromBg: "#ddd6fe",
      fromColor: "#5b21b6",
      text: "Ouais j'ai eu 9/12 😅 la dernière question m'a tué",
      time: "11:26",
    },
    {
      id: "m3",
      mine: false,
      fromInitials: "TM",
      fromBg: "#bbf7d0",
      fromColor: "#065f46",
      text: "Haha pareil ! Tu veux qu'on révise ensemble ce soir ? Je lance un Pomodoro à 18h",
      time: "11:27",
    },
    {
      id: "m4",
      mine: true,
      fromInitials: meInitials,
      fromBg: "#ddd6fe",
      fromColor: "#5b21b6",
      text: "Carrément 🔥 Je crée les flashcards avec la Mini-IA et tu me rejoins",
      time: "11:29",
    },
  ]);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function sendMsg() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        mine: true,
        fromInitials: meInitials,
        fromBg: "#ddd6fe",
        fromColor: "#5b21b6",
        text,
        time: "maintenant",
      },
    ]);
    setDraft("");
  }

  return (
    <>
      <h2 className="sr-only">
        StudyPulse — interface de chat avec liste d'amis et messagerie 1-on-1
      </h2>

      <div className={styles.chatShell}>
        <aside className={styles.sidebar}>
          <div className={styles.sidHead}>
            <span className={styles.sidTitle}>Messages</span>
            <button className={styles.iconBtn} aria-label="Ajouter un ami">
              <i
                className="ti ti-user-plus"
                style={{ fontSize: 15 }}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className={styles.searchWrap}>
            <input
              className={styles.searchInp}
              type="text"
              placeholder="Rechercher un ami…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.friendsList}>
            <div className={styles.sidSection}>En ligne</div>

            {filteredFriends.map((f) => (
              <div
                key={f.id}
                className={`${styles.friendItem} ${
                  f.id === activeFriendId ? styles.active : ""
                }`}
                onClick={() => setActiveFriendId(f.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActiveFriendId(f.id);
                }}
              >
                <div className={styles.friendAv} style={{ background: f.bg, color: f.color }}>
                  {f.initials}
                  {f.online && <div className={styles.onlineDot} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.friendName}>
                    {f.name} {f.plus && <span className={styles.plusBadge}>✦</span>}
                  </div>
                  <div className={styles.friendPreview}>{f.preview}</div>
                </div>
              </div>
            ))}

            {filteredFriends.length === 0 && (
              <div style={{ padding: "8px 10px", fontSize: 12, color: "var(--color-text-tertiary)" }}>
                Aucun utilisateur trouvé.
              </div>
            )}
          </div>
        </aside>

        <section className={styles.chatArea}>
          <div className={styles.chatHead}>
            <div
              className={styles.chatHeadAv}
              style={{
                background: activeFriend?.bg ?? "#bbf7d0",
                color: activeFriend?.color ?? "#065f46",
              }}
            >
              {activeFriend?.initials ?? "?"}
            </div>
            <div>
              <div className={styles.chatHeadName}>
                {activeFriend?.name ?? "Sélectionne un utilisateur"}
                {activeFriend?.plus && <span className={styles.plusBadge}>✦</span>}
              </div>
              <div
                className={styles.chatHeadStatus}
                style={{
                  color: activeFriend ? "var(--color-text-success)" : "var(--color-text-tertiary)",
                }}
              >
                {activeFriend ? "En ligne" : "—"}
              </div>
            </div>
            <div className={styles.chatHeadActions}>
              <button className={styles.iconBtn} aria-label="Démarrer un Pomodoro">
                <i className="ti ti-clock" style={{ fontSize: 15 }} aria-hidden="true" />
              </button>
              <button className={styles.iconBtn} aria-label="Voir le profil">
                <i className="ti ti-user" style={{ fontSize: 15 }} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className={styles.messages} ref={messagesRef}>
            {messages.map((m) => (
              <div key={m.id} className={`${styles.msgRow} ${m.mine ? styles.mine : ""}`}>
                <div className={styles.msgAv} style={{ background: m.fromBg, color: m.fromColor }}>
                  {m.fromInitials}
                </div>
                <div className={styles.msgCol}>
                  <div className={`${styles.bubble} ${m.mine ? styles.bubbleMine : styles.bubbleThem}`}>
                    {m.text}
                  </div>
                  <div className={styles.bubbleTime}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.realtimeNotice}>
            <i className="ti ti-bolt" style={{ fontSize: 13 }} aria-hidden="true" />
            Temps réel Supabase — à brancher à l'étape suivante
          </div>

          <div className={styles.chatInputWrap}>
            <button className={styles.iconBtn} aria-label="Emoji">
              <i className="ti ti-mood-smile" style={{ fontSize: 16 }} aria-hidden="true" />
            </button>
            <textarea
              className={styles.chatInput}
              rows={1}
              placeholder="Écris un message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMsg();
                }
              }}
              disabled={!activeFriend}
            />
            <button className={styles.sendBtn} onClick={sendMsg} aria-label="Envoyer" disabled={!activeFriend}>
              <i className="ti ti-send" style={{ fontSize: 15 }} aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

