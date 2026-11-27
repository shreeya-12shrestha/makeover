type Shade = { name: string; color: string }

type ShadePickerProps = {
  title: string
  shades: Shade[]
  selected: string
  onSelect: (color: string) => void
  intensity: number
  onIntensityChange: (value: number) => void
}

export function ShadePicker({
  title,
  shades,
  selected,
  onSelect,
  intensity,
  onIntensityChange,
}: ShadePickerProps) {
  return (
    <section className="controls">
      <h2>{title}</h2>
      <div className="shades">
        {shades.map((s) => (
          <button
            key={s.name}
            title={s.name}
            className={`shade ${selected === s.color ? 'active' : ''}`}
            style={{ background: s.color || 'transparent' }}
            onClick={() => onSelect(s.color)}
          >
            {s.color ? '' : 'None'}
          </button>
        ))}
      </div>
      <label className="intensity">
        Intensity: {Math.round(intensity * 100)}%
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={intensity}
          onChange={(e) => onIntensityChange(Number(e.target.value))}
        />
      </label>
    </section>
  )
}