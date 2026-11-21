<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import NxGallery from '../../components/next/NxGallery.vue'

  defineProps({
      lastUpdate: String
  })

  const currentTab = ref("remake")

  const imagesRemake = [
    "/data/mw-index/MWR1.webp",
    "/data/mw-index/MWR2.webp",
    "/data/mw-index/MWR3.webp",
    "/data/mw-index/MWR4.webp",
    "/data/mw-index/MWR5.webp",
    "/data/mw-index/MWR6.webp",
    "/data/mw-index/MWR7.webp",
    "/data/mw-index/MWR8.webp",
    "/data/mw-index/MWR9.webp",
    "/data/mw-index/MWR10.webp",
  ]

  const imagesSmwp = [
    "/data/mw-index/smwp-title.webp",
    "/data/mw-index/smwp-editor.webp",
    "/data/mw-index/smwp-blocks.webp",
    "/data/mw-index/smwp-musicselector.webp",
    "/data/mw-index/smwp-additional.webp",
    "/data/mw-index/smwp-decade.webp",
    "/data/mw-index/smwp-nightsand.webp",
    "/data/mw-index/smwp-classicepic.webp",
    "/data/mw-index/smwp-muitfaceted.webp",
  ]

  const currentImages = computed(() => {
    if (currentTab.value === "remake") {
      return imagesRemake
    } else if (currentTab.value === "smwp") {
      return imagesSmwp
    }
    return imagesRemake
  })

  const tabs = [
    { id: "remake", label: "Mario Worker Remake" },
    { id: "smwp", label: "Super Mario Worker Project" }
  ]

  onMounted(() => {
  })

  onBeforeUnmount(() => {
  })
</script>

Istnieje kilka oficjalnych i nieoficjalnych edytorów poziomów do Mario Forever, powszechnie określanych mianem Mario Worker.

<p v-if="lastUpdate" class="last-update" style="font-weight: bold;">Ostatnia aktualizacja: {{ lastUpdate }}</p>

## Pobierz klasyczny Mario Worker

Klasyczny Mario Worker, wcześniej znany jako Mario Forever Editor, to edytor poziomów do Mario Forever opracowany przez Buziol Games (Softendo). Umożliwia tworzenie, edytowanie, przesyłanie, pobieranie i odtwarzanie własnych poziomów Mario Forever. Znane są dwie zasadniczo różne gałęzie tego edytora: Mario Worker 1.0 i Mario Worker 1.1. Ta druga jest często określana zbiorczo w chińskiej społeczności Mario Forever jako Mario Worker 4.x.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%201.0.exe">Pobierz Mario Worker 1.0</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%204.4%20(2009).exe">Pobierz Mario Worker 1.1 (2009)</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/original-mw/Mario%20Worker%204.4%20(2011).exe">Pobierz Mario Worker 1.1 (2011)</a>

Mario Worker 1.0 został wydany w 2004 roku i stworzony przy użyciu Multimedia Fusion 1.5. Autor nieumyślnie ujawnił jego kod źródłowy, który stał się podstawą większości współczesnych fanowskich gier Mario Forever. Mimo że Mario Worker 1.0 działa, jest stosunkowo niedopracowany i zawiera kilka błędów. Późniejszy Mario Worker Remake bazuje na tym kodzie źródłowym i jest obecnie jednym z najpopularniejszych wariantów Mario Worker. Istnienie Mario Worker 1.0 pozostawało w dużej mierze nieznane społeczności aż do około 2012 roku.

Mario Worker 1.1 to odrębna, opracowana od nowa wersja edytora. Pierwsza kompilacja pojawiła się w 2006 roku jako edytor poziomów dołączony do Mario Forever 4.0. Została stworzona przy użyciu Game Maker 6. W przeciwieństwie do Mario Worker 1.0, Mario Worker 1.1 wprowadza istotne zmiany w fizyce, mechanice i grafice w porównaniu z Mario Forever i Mario Worker 1.0. Z tego powodu rozgrywka często wydawała się graczom obca, a nowym użytkownikom trudno było się do niej przyzwyczaić. Pierwsza kompilacja Mario Worker 1.1 zawierała liczne błędy i bez modyfikacji nie działała poprawnie w systemach Windows Vista i nowszych.

W 2008 roku Buziol zaktualizował Mario Worker 1.1, przenosząc go na silnik Game Maker 7 i naprawiając kilka problemów. Ta zaktualizowana kompilacja została dołączona do Mario Forever 4.1. Ponieważ obie kompilacje były dystrybuowane wraz z konkretnymi wersjami Mario Forever, chińska społeczność określa je odpowiednio jako Mario Worker 4.0 i Mario Worker 4.1.

W 2009 roku Buziol (który w międzyczasie zmienił nazwę na Softendo) wydał samodzielny instalator Mario Worker 1.1. Ponieważ nastąpiło to mniej więcej w tym samym czasie co premiera Mario Forever 4.4, chińska społeczność nieoficjalnie nazwała tę wersję Mario Worker 4.4. Ta samodzielna kompilacja jest niemal identyczna z wersją 4.1, z wyjątkiem zmian w oznaczeniach marki z Broshome na Softendo. Jest to ostatnie wydanie Mario Worker 1.1.

## Pobierz Mario Worker Remake

Mario Worker Remake to gruntownie przebudowany edytor poziomów Mario Worker 1.0, opracowany przez TheMarioVariable.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-worker-remake/MWRemake%20v3.03.rar">Pobierz Mario Worker Remake v3.03</a><a class="md-button" target="_blank" href="https://www.themariovariable.org/mario-forever/mario-worker-remake/">Strona internetowa Mario Worker Remake</a><a class="md-button" target="_blank" href="https://marioworkerdatabase.altervista.org/">Baza danych Mario Worker Remake</a>

W porównaniu z Mario Worker 1.0 Mario Worker Remake oferuje wiele nowych funkcji, takich jak dodatkowe obiekty, przeciwnicy, tła i muzyka, a także ustawienia umożliwiające między innymi automatyczne przewijanie ekranu (autoscroll) oraz edycję koloru gradientu tła.

Początkowo edytor był dystrybuowany razem z Mario Forever Remake, jednak od wersji v3.0 jest udostępniany jako samodzielny program.

## Pobierz Super Mario Worker Project

Super Mario Worker Project (SMWP) to edytor poziomów do Mario, oparty na Mario Worker 1.1, opracowany przez INNOVATION LEAP i stworzony przy użyciu Game Maker 8.

<a class="md-button" target="_blank" href="https://file.marioforever.net/smwp">Pobierz Super Mario Worker Project</a><a class="md-button" target="_blank" href="https://smwp.marioforever.net/">Strona internetowa Super Mario Worker Project</a><a class="md-button" target="_blank" href="https://github.com/InnovationLeap/Super-Mario-Worker-Project-GM82">Repozytorium źródłowe Super Mario Worker Project</a>

Super Mario Worker Project rozwija i rozbudowuje Mario Worker 1.1, wprowadzając nowe elementy i naprawiając różne błędy, a jednocześnie zachowując oryginalne zasady fizyki oraz strukturę formatu poziomów.

Domyślnie Super Mario Worker Project zapisuje poziomy w formacie .smwl. Zachowuje również kompatybilność wsteczną z poziomami utworzonymi w starszych wersjach Super Mario Worker Projectoraz z poziomami Mario Worker 1.1 w formacie .mfl. Nie zapisuje jednak poziomów w formacie .mfl.

Od wersji v1.7.13-beta1 Super Mario Worker Project korzysta z ulepszonego silnika [Game Maker 8.2](https://gm82.cherry-treehouse.com/) i jest projektem open source.

## Pobierz Mario Worker: Community Edition

Mario Worker: Community Edition to edytor poziomów do Mario Forever oparty na silniku Thunder Engine z Godot 4, opracowany przez Meteo Dream. Obecnie znajduje się na etapie prototypu.

<a class="md-button" target="_blank" href="https://nx.wtf/s/aVtZ?path=Games%2FMario%20Worker%20-%20Community%20Edition">Pobierz Mario Worker: Community Edition</a><a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-worker-ce">Pobierz Mario Worker: Community Edition (kopia zapasowa)</a><a class="md-button" target="_blank" href="https://github.com/meteo-dream/mario-worker-ce">Repozytorium źródłowe Mario Worker: Community Edition</a>

## Zrzuty ekranu
<div class="radio-inputs">
  <a
    v-for="tab in tabs"
    :key="tab.id"
    class="radio"
    :class="{ 'checked': currentTab === tab.id }"
    @click="currentTab = tab.id"
  >
    <span class="radio-text">
      {{ tab.label }}
    </span>
  </a>
</div>
<NxGallery :key="currentTab" :images="currentImages" alt="Mario Worker" :max-height="480" :autoplay="3000" />

## Inne warianty Mario Worker

### Mario Worker 2

Mario Worker 2 to edytor poziomów podobny do Mario Worker 1.1, opracowany przez Rubis et Cie przy użyciu GameMaker Studio 1. Nie jest kompatybilny z Mario Worker 1.1 ani z żadnym innym wariantem Mario Worker.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/other-mw-programs/Mario%20Worker%202.2.exe">Pobierz Mario Worker 2.2</a>

### Mario Constructor Master

Mario Constructor Master to następca Mario Worker 2, opracowany przez Rubis et Cie i TheMarioVariable. Jest projektem open source napisanym w języku C++.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/mario-constructor-master/Mario.Constructor.Master.2.3.zip">Pobierz Mario Constructor Master 2.3</a><a class="md-button" target="_blank" href="https://github.com/RubisetCie/mario-constructor-master">Repozytorium źródłowe Mario Constructor Master</a>

### Mario Worker Android

Mario Worker Android to edytor poziomów do Mario Forever oparty na Mario Worker 1.0, opracowany przez Alexandro Games. Nie jest kompatybilny z innymi edytorami bazującymi na Mario Worker 1.0.

<a class="md-button" target="_blank" href="https://www.mediafire.com/file/peppr8pao5sxfxd/Mario_Worker_Android_v1.3.1.apk/file">Pobierz Mario Worker Android v1.3.1</a><a class="md-button" target="_blank" href="https://alexandrogames.altervista.org/mario-worker-android/">Strona internetowa Mario Worker Android</a>

### Mario Constructor Forever

Mario Constructor Forever to edytor poziomów podobny do Mario Forever, stworzony przy użyciu GameMaker 7 przez glider521al. Wykorzystuje fizykę różniącą się od tej zastosowanej w oryginalnym Mario Forever oraz Mario Worker 4.x.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-worker/other-mw-programs/MarioConstructor1.7.zip">Pobierz Mario Constructor Forever</a>

## Często zadawane pytania

**P: Jak mogę pobrać poziomy do Mario Worker?**
**O:** Obecnie nie udostępniamy poziomów do takich wariantów jak Mario Worker Remake. Istnieje jednak baza [Mario Worker Database](https://marioworkerdatabase.altervista.org/), zawierająca dużą liczbę poziomów Mario Worker Remake.  
Na naszej stronie dostępny jest również [katalog poziomów](https://download.marioforever.net/mw-levels.html) do Mario Worker 1.1 i Super Mario Worker Project, jednak obecnie jest on dostępny wyłącznie w języku chińskim. Poziomów możesz także szukać w Internecie, na przykład na YouTube, serwerach Discord i forach społeczności Mario Forever.

**P: Czy Mario Worker Remake jest kompatybilny wstecz z poziomami Mario Worker 1.0?**
**O:** Różne warianty Mario Worker zasadniczo nie są ze sobą kompatybilne, nawet jeśli niektóre z nich bazują na oryginalnym Mario Worker. Jedynym istotnym wyjątkiem jest Super Mario Worker Project, który zachowuje kompatybilność wsteczną z Mario Worker 1.1. Ogólnie zaleca się uruchamianie poziomów w tej samej wersji edytora, w której zostały utworzone.

## Indeks formatów plików Mario Worker

- `mfs` - Mario Worker 1.0, Mario Worker 1.1 (scenariusz), Super Mario Worker Project v0.x (scenariusz), Mario Worker Remake v1.2~v2.1.0.5
- `mfl` - Mario Worker 1.1 (poziom), Super Mario Worker Project v0.x (poziom)
- `mfes` - Mario Worker Remake v2.5
- `mfel` - Mario Worker Remake v3.0
- `mfsc` - Mario Worker Remake (scenariusz)
- `mfem` - Mario Worker Remake (mapa)
- `smwl` - Super Mario Worker Project v1.x (poziom)
- `smws` - Super Mario Worker Project v1.x (scenariusz)
- `smwp` - Super Mario Worker Project v1.4+ (zabezpieczony scenariusz)
- `scn` / `tscn` - Mario Worker: Community Edition (poziom)
- `mwl` - Mario Worker 2 (poziom)
- `mws` - Mario Worker 2 (scenariusz)
- `mlws` - Mario Worker Android (poziom)
- `mwws` - Mario Worker Android (scenariusz)
- `cml` - Mario Constructor Master (poziom)
- `cms` - Mario Constructor Master (scenariusz/zestaw)
- `cmw` - Mario Constructor Master (mapa/świat)

<style scoped>
  .radio-inputs {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    border-radius: 0.5rem;
    background-color: #EEE;
    box-sizing: border-box;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    line-height: 1.2em;
  }

  .radio-inputs .radio {
    flex: 1 1 auto;
    text-align: center;
    border-radius: 0.35rem;
    margin: 0.2rem;
  }

  .radio-inputs .radio-text {
    display: flex;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border: none;
    padding: .5rem;
    color: rgba(51, 65, 85, 1);
    display: inline-block;
  }

  @media (min-width: 864px) {
    .radio-inputs .radio {
      flex: 1 1 0;
    }
  }

  .radio-inputs .radio.checked {
    background-color: #fff;
    font-weight: 600;
  }

  .radio-inputs .radio:hover {
    background-color: #f7f7f7;
  }

  body.dark .radio-inputs {
    background-color: #3a3a3a;
    border-color: #444;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
  }

  body.dark .radio-inputs .radio-text {
    color: rgba(220, 220, 220, 1);
  }

  body.dark .radio-inputs .radio.checked {
    background-color: #4a4a4a;
  }

  body.dark .radio-inputs .radio:hover {
    background-color: #555;
  }

</style>
