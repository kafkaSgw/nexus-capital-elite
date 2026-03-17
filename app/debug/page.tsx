export default function DebugPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Nexus Capital Debug Page</h1>
      <p>Deployment timestamp: {new Date().toISOString()}</p>
      <p>If you see this, the deployment is working at this path.</p>
    </div>
  )
}
