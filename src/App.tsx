import { useEffect, useState } from 'react'
import { Terminal } from './components/Terminal'
import { Toaster } from './components/ui/sonner'

interface RepoData {
  repos: any[]
  languages: { [key: string]: number }
  totalStars: number
  totalForks: number
}

function App() {
  const [userData, setUserData] = useState<any>(null)
  const [repoData, setRepoData] = useState<RepoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGitHubData() {
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

        setLoading(false)
      } catch (error) {
        console.error('Error fetching GitHub data:', error)
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [])

  return (
    <>
      <Terminal userData={userData} repoData={repoData} loading={loading} />
      <Toaster />
    </>
  )
}

export default App
