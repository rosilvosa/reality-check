import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { useAuthStore } from '../stores/authStore'
import {
  createPost,
  deletePost,
  fetchPosts,
  loadLocalHearts,
  saveLocalHearts,
  timeAgo,
  toggleHeart,
  type CommunityPost,
  type PostType,
} from '../lib/community'

const FILTERS: Array<{ id: 'all' | PostType; key: 'filterAll' | 'filterTips' | 'filterUrge' | 'filterQuestions' | 'filterVent' }> = [
  { id: 'all', key: 'filterAll' },
  { id: 'tip', key: 'filterTips' },
  { id: 'urge', key: 'filterUrge' },
  { id: 'question', key: 'filterQuestions' },
  { id: 'vent', key: 'filterVent' },
]

const TYPES: Array<{ id: PostType; key: 'typeTip' | 'typeUrge' | 'typeQuestion' | 'typeVent' }> = [
  { id: 'tip', key: 'typeTip' },
  { id: 'urge', key: 'typeUrge' },
  { id: 'question', key: 'typeQuestion' },
  { id: 'vent', key: 'typeVent' },
]

const MAX = 500

export default function Community() {
  const t = useT()
  const user = useAuthStore((s) => s.user)
  const loadingAuth = useAuthStore((s) => s.loading)
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | PostType>('all')
  const [type, setType] = useState<PostType>('tip')
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [hearts, setHearts] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) setHearts(loadLocalHearts(user.uid))
  }, [user?.uid])

  async function reload() {
    try {
      setPosts(await fetchPosts())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loadingAuth) return
    reload()
  }, [loadingAuth])

  const visible = filter === 'all' ? posts : posts.filter((p) => p.type === filter)

  async function submit() {
    if (!user || posting) return
    const trimmed = text.trim()
    if (!trimmed) return
    setPosting(true)
    setError('')
    try {
      await createPost(user.uid, type, trimmed)
      setText('')
      setOpen(false)
      await reload()
    } catch {
      setError(t.community.failed)
    } finally {
      setPosting(false)
    }
  }

  async function onHeart(post: CommunityPost) {
    if (!user) return
    const on = !hearts.has(post.id)
    setHearts((prev) => {
      const next = new Set(prev)
      if (on) next.add(post.id)
      else next.delete(post.id)
      saveLocalHearts(user.uid, next)
      return next
    })
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, hearts: Math.max(0, p.hearts + (on ? 1 : -1)) } : p)),
    )
    try {
      await toggleHeart(post.id, user.uid, on)
    } catch {
      setHearts((prev) => {
        const next = new Set(prev)
        if (on) next.delete(post.id)
        else next.add(post.id)
        saveLocalHearts(user.uid, next)
        return next
      })
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, hearts: Math.max(0, p.hearts + (on ? -1 : 1)) } : p)),
      )
    }
  }

  async function onDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    try {
      await deletePost(id)
    } catch {
      await reload()
    }
  }

  return (
    <div>
      <h2 className="text-lg font-extrabold text-white mb-1">{t.community.title}</h2>
      <p className="text-sm text-muted mb-3 leading-relaxed">{t.community.subtitle}</p>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.community.hero}</p>

      <div className="flex gap-1 mb-4 overflow-x-auto bg-surface border border-border rounded-xl p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`flex-1 min-w-fit px-2 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
              filter === f.id ? 'bg-surface2 text-white' : 'text-muted hover:text-white'
            }`}
          >
            {t.community[f.key]}
          </button>
        ))}
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-left bg-surface border border-border rounded-xl px-4 py-3 text-sm text-muted mb-5 hover:border-white/20"
        >
          {t.community.composeHint}
        </button>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-4 mb-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {TYPES.map((pt) => (
              <button
                key={pt.id}
                type="button"
                onClick={() => setType(pt.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                  type === pt.id ? 'border-accent text-white' : 'border-border text-muted'
                }`}
              >
                {t.community[pt.key]}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            rows={4}
            placeholder={t.community.composeHint}
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-accent mb-2"
          />
          <p className="text-[11px] text-muted mb-3">{t.community.postedAs} · {text.length}/{MAX}</p>
          <p className="text-[11px] text-muted mb-3">{t.community.rules}</p>
          {error && <p className="text-sm text-accent mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={posting || !text.trim() || !user}
              className="flex-1 bg-accent text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50"
            >
              {posting ? t.community.posting : t.community.postBtn}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError('') }}
              className="px-4 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-white"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted">…</p>}
      {!loading && visible.length === 0 && <p className="text-sm text-muted">{t.community.empty}</p>}

      <div className="space-y-3">
        {visible.map((post) => {
          const mine = user?.uid === post.uid
          const liked = hearts.has(post.id)
          return (
            <article key={post.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Anonymous · {timeAgo(post.createdAt)}
                </p>
                <span className="text-[11px] text-muted">{t.community[
                  post.type === 'tip' ? 'typeTip'
                    : post.type === 'urge' ? 'typeUrge'
                      : post.type === 'question' ? 'typeQuestion'
                        : 'typeVent'
                ]}</span>
              </div>
              <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">{post.text}</p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => onHeart(post)}
                  className={`text-xs font-bold ${liked ? 'text-white' : 'text-muted hover:text-white'}`}
                >
                  {liked ? '♥' : '♡'} {post.hearts}
                </button>
                {mine && (
                  <button
                    type="button"
                    onClick={() => onDelete(post.id)}
                    className="text-xs text-muted hover:text-white"
                  >
                    {t.community.deletePost}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
