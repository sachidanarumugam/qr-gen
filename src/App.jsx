import Header from './components/Header.jsx'
import Section from './components/Section.jsx'
import PreviewCard from './components/PreviewCard.jsx'
import './App.css'

const GUIDE_COLUMNS = Array.from({ length: 12 }, (_, i) => i)

export default function App() {
  return (
    <div className="page">
      <div className="grid-guides" aria-hidden="true">
        {GUIDE_COLUMNS.map((column) => (
          <span key={column} />
        ))}
      </div>
      <Header />
      {/* DOM order is the mobile order: the preview sits right after the content inputs. */}
      <main className="layout">
        <Section id="content" number="01" title="Content" />
        <PreviewCard />
        <Section id="style" number="02" title="Style" />
        <Section id="presets" number="03" title="Presets" />
        <Section id="recent" number="04" title="Recent" />
      </main>
    </div>
  )
}
