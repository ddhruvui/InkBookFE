import { useCallback } from 'react'
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import useNotebookStore, { findTopicByName } from '../store/useNotebookStore'

// Current tree position derived from the route (ids are node UUIDs).
export function useCurrentRef() {
  const { pathname } = useLocation()
  const note = matchPath('/s/:s/c/:c/t/:t', pathname)
  if (note)
    return { subjectId: note.params.s, chapterId: note.params.c, topicId: note.params.t }
  const chap = matchPath('/subject/:s/chapter/:c', pathname)
  if (chap) return { subjectId: chap.params.s, chapterId: chap.params.c, topicId: null }
  return { subjectId: null, chapterId: null, topicId: null }
}

export function useNav() {
  const navigate = useNavigate()

  const goHome = useCallback(() => {
    useNotebookStore.setState({ drawerOpen: false, palOpen: false, menu: null })
    navigate('/')
  }, [navigate])

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
      navigate(`/s/${subjectId}/c/${chapterId}/t/${topicId}`)
    },
    [navigate]
  )

  const goByName = useCallback(
    (name) => {
      const st = useNotebookStore.getState()
      const found = findTopicByName(st.subjects, name)
      if (found) goTopic(found.subject._id, found.chapter.id, found.topic.id)
      else st.toast('No note named "' + name + '" yet')
    },
    [goTopic]
  )

  return { goHome, goChapter, goTopic, goByName }
}
