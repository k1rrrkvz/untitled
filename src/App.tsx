import { useEffect, useState, useCallback } from 'react'
import { Terminal } from './components/Terminal'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner'

interface RepoData {
  repos: any[]
  languages: { [key: string]: number }
  totalStars: number
  totalForks: number
}

const REFRESH_INTERVAL = 5 * 60 * 1000

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchGitHubData = useCallback(async (showNotification = false) => {
    try {
      const user = await spark.user()
      setUserData(user)

      const response = await fetch(`https://api.github.com/users/${user.login}/repos?per_page=100&sort=updated`)
      const repos = await response.json()

      const languages: { [key: string]: number } = {}
      let totalStars = 0
      let totalForks = 0

      repos.forEach((repo: any) => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + (repo.size || 1)
        }
        totalStars += repo.stargazers_count || 0
        totalForks += repo.forks_count || 0
      })

      setRepoData({
        repos,
        languages,
        totalStars,
        totalForks
      })

      setLastUpdate(new Date())
      setLoading(false)

      if (showNotification) {
        toast.success('Data updated successfully', {
          description: `Last update: ${new Date().toLocaleTimeString()}`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error)
      setLoading(false)
      if (showNotification) {
        toast.error('Failed to update data', {
          description: 'Will retry automatically',
          duration: 3000,
        })
      }
    }
  }, [])

  useEffect(() => {
    fetchGitHubData(false)

    const interval = setInterval(() => {
      fetchGitHubData(true)
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchGitHubData])

  return (
    <>
      <Terminal userData={userData} repoData={repoData} loading={loading} lastUpdate={lastUpdate} />
      <Toaster />
    </>
  )
}

export default App
