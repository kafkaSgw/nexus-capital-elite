export default function Sparkline({ data, color }: { data: number[], color: string }) {
    if (!data || data.length === 0) return <div className="h-8 w-24"></div>

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // Evita divisão por zero se todos os valores forem iguais

    // Normaliza os pontos para encaixar num SVG hipotético de 100x30
    const width = 100
    const height = 30

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width="100" height="30" viewBox="0 0 100 30" className="overflow-visible">
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Sombra suave preenchendo a área embaixo da linha */}
            <polygon
                points={`0,30 ${points} 100,30`}
                fill={`url(#gradient-${color})`}
            />

            {/* A linha propriamente dita */}
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />

            {/* Bolinha final destacando o último dado */}
            {data.length > 0 && (
                <circle
                    cx="100"
                    cy={height - ((data[data.length - 1] - min) / range) * height}
                    r="3"
                    fill={color}
                    className="shadow-glow"
                />
            )}
        </svg>
    )
}
