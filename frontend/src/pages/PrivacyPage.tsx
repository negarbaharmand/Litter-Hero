// Det här är en sida som visar integritetspolicyn för LitterHero
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/PageShell'

const PrivacyPage = () => {
  const navigate = useNavigate()

  return (
    <PageShell>
      <div className="mx-4 mt-6 flex flex-col gap-6">

        {/* Tillbaka-knapp */}
        <button
        type="button"
        onClick={() => navigate(-1)}
        className="self-start text-base font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--color-text-body)' }}
        >
        ← Back
        </button>

        <div>
          <h2>Integritetspolicy för Litter Hero</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Version: 1.0 · Datum: 13 maj 2026
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-body)' }}>
            Denna integritetspolicy beskriver hur Litter Hero ("vi", "oss" eller "vår") samlar in, använder och skyddar dina personuppgifter i enlighet med dataskyddsförordningen (GDPR).
          </p>
        </div>

        <div>
          <h3>1. Personuppgiftsansvarig</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-body)' }}>
            Litter Hero är ansvarig för behandlingen av de personuppgifter som samlas in via appen.
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-body)' }}>
            Chas Challange 2026, Chas Academy · Projektgrupp 2: Litter Hero · litterheroapp@gmail.com
          </p>
        </div>

        <div>
          <h3>2. Vilka uppgifter vi samlar in och varför</h3>
          <p className="text-sm mt-2 mb-3" style={{ color: 'var(--color-text-body)' }}>
            Vi samlar endast in uppgifter som är nödvändiga för att tillhandahålla tjänsten.
          </p>
          <div className="card flex flex-col gap-3">
            {[
              { type: 'Namn och e-postadress', purpose: 'Skapa användarkonto, följa framsteg, poängsystem och kontakta användaren', basis: 'Fullgörande av avtal' },
              { type: 'Platsinformation (GPS & Metadata)', purpose: 'Visa närliggande uppdrag och verifiera skräpuppdragets position via GPS eller bildens inbäddade platsinformation', basis: 'Fullgörande av avtal' },
              { type: 'Bilder och Metadata', purpose: 'Dokumentera skräplockning. Vi behandlar även metadata (t.ex. tidpunkt och plats) som finns lagrad i bilden', basis: 'Fullgörande av avtal' },
              { type: 'Inloggningsuppgifter (Lokalt)', purpose: 'Hålla användaren inloggad på enheten ("Stay logged in")', basis: 'Berättigat intresse' },
            ].map((row) => (
              <div key={row.type} className="flex flex-col gap-0.5 pb-3 border-b last:border-b-0 last:pb-0" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{row.type}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-body)' }}>{row.purpose}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Rättslig grund: {row.basis}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>3. Särskilt om Bilder och Metadata</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-body)' }}>
            När du laddar upp en bild på ett utfört skräpuppdrag kan appen komma att läsa av bildens metadata (EXIF-data). Detta inkluderar information om när och var bilden togs. Vi använder denna information för att bekräfta att skräpet plockades på den angivna platsen och vid den angivna tidpunkten för att säkerställa poängsystemets integritet.
          </p>
        </div>

        <div>
          <h3>4. Lagring av data</h3>
          <ul className="text-sm mt-2 flex flex-col gap-2" style={{ color: 'var(--color-text-body)' }}>
            <li>• <strong>Central lagring:</strong> Profiluppgifter, poäng och skapade uppdrag lagras på våra säkra servrar.</li>
            <li>• <strong>Lokal lagring:</strong> Vi sparar en identifierare (token) lokalt på din enhet för att du ska slippa logga in vid varje besök.</li>
            <li>• <strong>Lagringstid:</strong> Vi sparar dina uppgifter så länge du har ett konto. Vid radering av konto tas all identifierbar data bort inom 30 dagar.</li>
          </ul>
        </div>

        <div>
          <h3>5. Dina rättigheter enligt GDPR</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-body)' }}>
            Du har rätt att begära utdrag, rättelse eller radering av dina uppgifter. Du kan också invända mot viss typ av behandling eller begära att din data flyttas (dataportabilitet).
          </p>
        </div>

        <div>
          <h3>6. Säkerhet</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-body)' }}>
            Vi använder kryptering vid all överföring av data och vidtar tekniska åtgärder för att skydda din information mot obehörig åtkomst.
          </p>
        </div>

        <div className="mb-6">
          <h3>Kontakt</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-body)' }}>
            För frågor om dina data, kontakta oss på:{' '}
            <a href="mailto:litterheroapp@gmail.com" style={{ color: 'var(--color-green-dark)' }}>
              litterheroapp@gmail.com
            </a>
          </p>
        </div>

      </div>
    </PageShell>
  )
}

export default PrivacyPage