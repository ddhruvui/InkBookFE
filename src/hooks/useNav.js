import { useCallback } from 'react'
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import useNotebookStore, { findTopicByName } from '../store/useNotebookStore'

// Topic URL: /s/:s/c/:c/t/:t inside a chapter, /s/:s/t/:t directly in a subject.
export const topicUrl = (subjectId, chapterId, topicId) =>
  chapterId ? `/s/${subjectId}/c/${chapterId}/t/${topicId}` : `/s/${subjectId}/t/${topicId}`

// Current tree position derived from the route (ids are node UUIDs).
// chapterId is null on a subject page and on a topic that sits directly in a subject.
export function useCurrentRef() {
  const { pathname } = useLocation()
  const note = matchPath('/s/:s/c/:c/t/:t', pathname)
  if (note)
    return { subjectId: note.params.s, chapterId: note.params.c, topicId: note.params.t }
  const subjNote = matchPath('/s/:s/t/:t', pathname)
  if (subjNote) return { subjectId: subjNote.params.s, chapterId: null, topicId: subjNote.params.t }
  const chap = matchPath('/subject/:s/chapter/:c', pathname)
  if (chap) return { subjectId: chap.params.s, chapterId: chap.params.c, topicId: null }
  const subj = matchPath('/subject/:s', pathname)
  if (subj) return { subjectId: subj.params.s, chapterId: null, topicId: null }
  return { subjectId: null, chapterId: null, topicId: null }
}

export function useNav() {
  const navigate = useNavigate()

  const goHome = useCallback(() => {
    useNotebookStore.setState({ drawerOpen: false, palOpen: false, menu: null })
    navigate('/')
  }, [navigate])

  const goSubject = useCallback(
    (subjectId) => {
      const st = useNotebookStore.getState()
      st.openPath(subjectId)
      useNotebookStore.setState({ drawerOpen: false, palOpen: false, menu: null })
      navigate(`/subject/${subjectId}`)
    },
    [navigate]
  )

  const goChapter = useCallback(
    (subjectId, chapterId) => {
      const st = useNotebookStore.getState()
      st.openPath(subjectId, chapterId)
      useNotebookStore.setState({ drawerOpen: false, palOpen: false, menu: null })
      navigate(`/subject/${subjectId}/chapter/${chapterId}`)
    },
    [navigate]
  )

  const goTopic = useCallback(
    // chapterId null → a topic directly in the subject.
    (subjectId, chapterId, topicId, opts = {}) => {
      const st = useNotebookStore.getState()
      st.openPath(subjectId, chapterId)
      useNotebookStore.setState({
        drawerOpen: false,
        palOpen: false,
        menu: null,
        insertOpen: false,
        hlQ: opts.hl || '',
      })
      navigate(topicUrl(subjectId, chapterId, topicId))
    },
    [navigate]
  )

  const goByName = useCallback(
    (name) => {
      const st = useNotebookStore.getState()
      const found = findTopicByName(st.subjects, name)
      if (found) goTopic(found.subject._id, found.chapter?.id ?? null, found.topic.id)
      else st.toast('No note named "' + name + '" yet')
    },
    [goTopic]
  )

  return { goHome, goSubject, goChapter, goTopic, goByName }
}
