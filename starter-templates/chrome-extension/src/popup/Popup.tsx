import { useState, useEffect } from 'react'

export default function Popup() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Example of using Chrome APIs
    chrome.storage.sync.get(['count'], (result) => {
      setCount(result.count || 0)
    })
  }, [])

  const increment = () => {
    const newCount = count + 1
    setCount(newCount)
    chrome.storage.sync.set({ count: newCount })
  }

  return (
    <div style={{ width: '300px', padding: '1rem' }}>
      <h1>Chrome Extension</h1>
      <button onClick={increment}>
        Count is {count}
      </button>
    </div>
  )
}
