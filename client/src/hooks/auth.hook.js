import {useState, useCallback, useEffect} from 'react'

const storageName = 'userData'

export const useAuth = () => {
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userTypeId, setUserTypeId] = useState(null)

  const login = useCallback((jwtToken, id, typeId) => {
    setToken(jwtToken)
    setUserId(id)
    setUserTypeId(typeId)

    localStorage.setItem(storageName, JSON.stringify({
      userId: id, token: jwtToken, userTypeId: typeId
    }))
  }, [])


  const logout = useCallback(() => {
    setToken(null)
    setUserId(null)
    setUserTypeId(null)
    localStorage.removeItem(storageName)
  }, [])

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(storageName))

    if (data && data.token) {
      login(data.token, data.userId, data.userTypeId)
    }
    setReady(true)
  }, [login])


  return { login, logout, token, userId, userTypeId, ready }
}
