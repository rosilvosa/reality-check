import { useEffect, useState } from 'react'
import { useT } from '../i18n'
import { HELP_REGIONS, resolveHelpRegion, tpl, type HelpRegion } from '@rc/core'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore } from '../stores/settingsStore'
import {
  createPost,
  deletePost,
  fetchPosts,
  fetchReportCounts,
  loadLocalHearts,
  loadLocalReports,
  reportPost,
  saveLocalHearts,
  saveLocalReports,
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
  const [loadFailed, setLoadFailed] = useState(false)
  const [filter, setFilter] = useState<'all' | PostType>('all')
  const [onlyReported, setOnlyReported] = useState(false)
  const [countryFilter, setCountryFilter] = useState<'all' | HelpRegion>('all')
  const myRegion = useSettingsStore((s) => resolveHelpRegion(s.helpRegion))
  const [type, setType] = useState<PostType>('tip')
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [hearts, setHearts] = useState<Set<string>>(new Set())
  const [reported, setReported] = useState<Set<string>>(new Set())
  const isModerator = useAuthStore((s) => s.isModerator)
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user) return
    setHearts(loadLocalHearts(user.uid))
    setReported(loadLocalReports(user.uid))
  }, [user?.uid])

  // Only a moderator can read these, so do not even ask otherwise.
  useEffect(() => {
    if (!isModerator) { setReportCounts({}); return }
    fetchReportCounts().then(setReportCounts).catch(() => setReportCounts({}))
  }, [isModerator])

  async function onReport(postId: string) {
    if (!user || reported.has(postId)) return
    const next = new Set(reported).add(postId)
    setReported(next)
    saveLocalReports(user.uid, next)
    try {
      await reportPost(postId, user.uid)
    } catch {
      // The marker stays put. Re-reporting the same post would be rejected by
      // the rules anyway, and nagging about a failed report is not useful.
    }
  }

  async function onRemove(postId: string) {
    if (!window.confirm(t.community.removeConfirm)) return
    try {
      await deletePost(postId)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setReportCounts((prev) => {
        const next = { ...prev }
        delete next[postId]
        return next
      })
    } catch {
      setError(t.community.failed)
    }
  }

  async function reload() {
    try {
      setPosts(await fetchPosts())
      setLoadFailed(false)
    } catch (e) {
      // Offline, this used to render as "no posts yet" -- telling someone
      // looking for peer support that the room is empty.
      console.error(e)
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loadingAuth) return
    reload()
  }, [loadingAuth])

  const reportedCount = Object.values(reportCounts).filter((n) => n > 0).length
  const visible = posts.filter(
    (p) => (filter === 'all' || p.type === filter)
      && (countryFilter === 'all' || p.country === countryFilter)
      // Without this a moderator has to scroll the whole feed to find the one
      // post someone flagged.
      && (!onlyReported || (reportCounts[p.id] ?? 0) > 0),
  )

  async function submit() {
    if (!user || posting) return
    const trimmed = text.trim()
    if (!trimmed) return
    setPosting(true)
    setError('')
    try {
      await createPost(user.uid, type, trimmed, myRegion)
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
      <h2 className="text-lg font-extrabold text-ink mb-1">{t.community.title}</h2>
      <p className="text-sm text-muted mb-3 leading-relaxed">{t.community.subtitle}</p>
      <p className="text-sm text-muted mb-5 leading-relaxed">{t.community.hero}</p>

      <div className="flex gap-1 mb-3 overflow-x-auto bg-surface border border-border rounded-xl p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`flex-1 min-w-fit px-2 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
              filter === f.id ? 'bg-surface2 text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {t.community[f.key]}
          </button>
        ))}
        {isModerator && reportedCount > 0 && (
          <button
            type="button"
            onClick={() => setOnlyReported((v) => !v)}
            className={`flex-1 min-w-fit px-2 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
              onlyReported ? 'bg-red-500/20 text-red-300' : 'text-red-400 hover:text-red-300'
            }`}
          >
            {tpl(t.community.filterReported, { n: String(reportedCount) })}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label htmlFor="community-country" className="text-xs font-bold text-muted shrink-0">
          {t.community.countryLabel}
        </label>
        <select
          id="community-country"
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value as 'all' | HelpRegion)}
          className="flex-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-ink outline-none focus:border-accent"
        >
          <option value="all">{t.community.countryAll}</option>
          {HELP_REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
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
                  type === pt.id ? 'border-accent text-ink' : 'border-border text-muted'
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
            className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-ink text-sm outline-none focus:border-accent mb-2"
          />
          <p className="text-[0.6875rem] text-muted mb-3">{t.community.postedAs} · {text.length}/{MAX}</p>
          <p className="text-[0.6875rem] text-muted mb-3">{t.community.rules}</p>
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
              className="px-4 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-ink"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted">…</p>}
      {!loading && loadFailed && (
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <p className="text-sm text-muted mb-3">{t.community.loadFailed}</p>
          <button
            type="button"
            onClick={() => { setLoading(true); reload() }}
            className="text-sm font-bold text-ink underline underline-offset-4"
          >
            {t.community.retry}
          </button>
        </div>
      )}
      {!loading && !loadFailed && visible.length === 0 && (
        <p className="text-sm text-muted">{t.community.empty}</p>
      )}

      <div className="space-y-3">
        {visible.map((post) => {
          const mine = user?.uid === post.uid
          const liked = hearts.has(post.id)
          return (
            <article key={post.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[0.6875rem] font-bold uppercase tracking-wider text-muted">
                  Anonymous · {timeAgo(post.createdAt)}
                </p>
                <span className="text-[0.6875rem] text-muted">{t.community[
                  post.type === 'tip' ? 'typeTip'
                    : post.type === 'urge' ? 'typeUrge'
                      : post.type === 'question' ? 'typeQuestion'
                        : 'typeVent'
                ]}</span>
              </div>
              <p className="text-ink text-[0.9375rem] leading-relaxed whitespace-pre-wrap">{post.text}</p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => onHeart(post)}
                  className={`text-xs font-bold ${liked ? 'text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {liked ? '♥' : '♡'} {post.hearts}
                </button>
                {mine && (
                  <button
                    type="button"
                    onClick={() => onDelete(post.id)}
                    className="text-xs text-muted hover:text-ink"
                  >
                    {t.community.deletePost}
                  </button>
                )}
                {!mine && (
                  <button
                    type="button"
                    onClick={() => onReport(post.id)}
                    disabled={reported.has(post.id)}
                    className="text-xs text-muted hover:text-ink disabled:hover:text-muted disabled:opacity-60"
                  >
                    {reported.has(post.id) ? t.community.reported : t.community.reportBtn}
                  </button>
                )}
                {isModerator && (
                  <div className="flex items-center gap-3 ml-auto">
                    {(reportCounts[post.id] ?? 0) > 0 && (
                      <span className="text-xs font-bold text-red-400">
                        {tpl(t.community.reportsLabel, { n: String(reportCounts[post.id]) })}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(post.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-300"
                    >
                      {t.community.removeBtn}
                    </button>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
