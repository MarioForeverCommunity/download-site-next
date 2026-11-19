<script setup>
defineProps({
  lastUpdate: String
})
</script>

<p v-if="lastUpdate" class="last-update" style="font-weight: bold;">Ostatnia aktualizacja: {{ lastUpdate }}</p>

## Clickteam Fusion 2.5

Clickteam Fusion (wcześniej znany jako Multimedia Fusion) to aplikacja do tworzenia oprogramowania multimedialnego opracowana przez firmę Clickteam. Program umożliwia użytkownikom tworzenie i testowanie własnego oprogramowania za pomocą opracowanego przez siebie, opartego na zdarzeniach języka programowania. Wiele znanych gier powstało przy użyciu Multimedia Fusion, w tym seria Five Nights at Freddy's. Z programu tego korzystał Michał Gdaniec podczas tworzenia swoich gier, w tym Mario Forever. Używali go również inni twórcy związani z Mario Forever do tworzenia kolejnych fanowskich gier opartych na tej serii.

<a class="md-button" target="_blank" href="https://www.clickteam.com/web-shop">Kup Clickteam Fusion 2.5 (Clickteam.com)</a><a class="md-button" target="_blank" href="https://store.steampowered.com/app/248170/Clickteam_Fusion_25/">Kup Clickteam Fusion 2.5 (Steam)</a>

### Szablony Mario Forever w Clickteam Fusion

#### Mario Forever Editor

MarioForeverEditorV1.cca to plik źródłowy dołączony do instalatora Mario Worker 1.0. Po otwarciu w Multimedia Fusion nie nadaje się do bezpośredniego wykorzystania jako szablon gry — wymaga znacznych ręcznych modyfikacji. Ze względu na ograniczenia Multimedia Fusion 1.5 wszystkie zdarzenia w obrębie jednej klatki znajdują się na głównej liście zdarzeń, co utrudnia utrzymanie projektu i jego dalszy rozwój.

Uwaga: Nie należy mylić tego projektu z Mario Forever Engine autorstwa Dunami.

#### World 10 Engine / Mario Forever Remake Engine

Ten szablon jest ulepszoną wersją opartą na MarioForeverEditorV1.cca. To jeden z najwcześniejszych szablonów Mario Forever, które można było wykorzystać bezpośrednio do tworzenia gier. W zależności od poziomów dołączonych do wydania jest on powszechnie określany jako World 10 Engine lub Mario Forever Remake Engine. W porównaniu z innymi szablonami jest trudniejszy w utrzymaniu i mniej odpowiedni do dalszego rozwoju. Jego wykorzystanie wymaga również dobrej znajomości Multimedia Fusion.

<AssetsEntry name="Mario Forever World 10 Engine" /><AssetsEntry name="Mario Forever Editor (MF Remake Engine)" />

#### Cloud Engine

Cloud Engine to szablon Mario Forever stworzony przez Meteo Dream (wcześniej Team CE) na podstawie MarioForeverEditorV1.cca. Jego celem było zapewnienie większej łatwości obsługi, użyteczności i stabilności, przy jednoczesnym zachowaniu charakteru oryginalnego Mario Forever, dobrze znanego i lubianego przez graczy. Zawiera większość oryginalnej zawartości Mario Forever, a jednocześnie dodaje własne funkcje, zachowując prostotę i niewielki rozmiar. Cloud Engine wykorzystuje również funkcję podzdarzeń wprowadzoną w Clickteam Fusion 2.5+, dzięki czemu jest jednym z łatwiejszych w obsłudze szablonów Mario Forever.

<AssetsEntry name="Cloud Engine" variant="本体" /><AssetsEntry name="Cloud Engine" variant="Official Plugins" />

#### Feather Engine

Feather Engine to szablon stworzony przez TheMarioVariable jako gruntownie zaktualizowana wersja oryginalnego pliku MarioForeverEditorV1.cca. Zawiera wszystkie przedmioty, grafiki, sprite'y i elementy fizyki z klasycznych gier Mario Forever wydanych przed wersją v4.0. Zachowując znaczną część oryginalnej struktury kodu, został zaktualizowany do Clickteam Fusion 2.5, a kod uczyniono bardziej zrozumiałym i uzupełniono o instrukcje ułatwiające korzystanie z projektu. Nazwa Feather Engine (dosłownie „silnik z piórka”) nawiązuje do jego niewielkiego rozmiaru — cały projekt zajmuje mniej niż 8 MB.

<AssetsEntry name="Mario Forever Feather Engine" />

#### Rainbow Engine

Rainbow Engine to szablon Mario Forever stworzony przez Lyh. Został zbudowany całkowicie od podstaw, dlatego pod pewnymi względami różni się od szablonów opartych na MarioForeverEditorV1.cca.

W Rainbow Engine wiele obiektów ma przypisane własne zachowania, dzięki czemu zdarzenia można umieszczać bezpośrednio w odpowiednich obiektach. W rezultacie tworzenie nowych przeciwników wymaga mniej powtarzalnej pracy, ponieważ część zdarzeń można po prostu kopiować i wklejać. Jednak Clickteam Fusion 2.5 nie obsługuje odwoływania się do grup z poziomu zachowań, dlatego zdarzenia związane z grupami nadal muszą znajdować się na głównej liście zdarzeń.

Rainbow Engine jest łatwy do opanowania i dobrze odtwarza oryginalne Mario Forever. Większość chińskich fanowskich gier Mario Forever powstaje przy jego użyciu lub z wykorzystaniem opartych na nim wersji pochodnych.

<AssetsEntry name="Rainbow Engine" variant="含开始页" ver="0.10.7.1" /><AssetsEntry name="Rainbow Engine" variant="含开始页" ver="0.10.6.1" />

#### Spectrum Engine

Spectrum Engine (wcześniej Rainbow Engine Mod) rozszerza Rainbow Engine o nowych przeciwników, elementy otoczenia i ulepszenia, naprawia błędy oraz tłumaczy większość głównej zawartości na język angielski.

<AssetsEntry name="Spectrum Engine" variant="Ful MFA" /><AssetsEntry name="Spectrum Engine" variant="Level only MFA" />

#### Super Mario Ultra Edition

W 2020 roku ukazało się Clickteam Fusion 2.5+, które umożliwiło korzystanie z podzdarzeń oraz odwoływanie się do grup wewnątrz zachowań. W tych okolicznościach dasasdhba stworzył Super Mario Ultra Edition. Ten szablon również został zbudowany od podstaw i w pełni wykorzystuje strukturę oraz możliwości Clickteam Fusion 2.5+. Cały projekt charakteryzuje się rygorystycznym systemem wykrywania kolizji i dobrze uporządkowaną strukturą, oferując wiele interfejsów ułatwiających dalszy rozwój. Jego wykorzystanie wymaga jednak pewnej znajomości samego szablonu. Projekt nie koncentruje się na odtwarzaniu oryginalnego Mario Forever — jego celem jest zapewnienie większego komfortu tworzenia, rozwijania i grania pod każdym względem. Niektóre chińskie fanowskie gier Mario Forever wydane od 2021 roku powstały właśnie przy jego użyciu.

<AssetsEntry name="Super Mario Ultra Edition" variant="Full" /><AssetsEntry name="Super Mario Ultra Edition" variant="Mod" />

#### Factory Engine

Jest to szablon wykorzystany w grze <a href="https://download.marioforever.net/mf-games.html?design=next&id=mf%3A%3AMario+Forever+Irrational+Travel%3A%3ADET+Factory">Mario Forever Irrational Travel</a>, fanowskiej grze DET Factory. Został oparty na Rainbow Engine i zawiera wiele optymalizacji.

<AssetsEntry name="Factory Engine" />

#### Inne szablony

Do tej kategorii należą Mario Forever Engine autorstwa Dunami, Super Mario Ultra Engine autorstwa dasasdhba, Geography Engine Ultimate autorstwa MarioX7 i inne projekty. Szablony te nie są powszechnie używane.

<a class="md-button" target="_blank" href="https://file.marioforever.net/mario-forever/engines">Zobacz więcej szablonów Mario Forever</a>

## Godot Engine

Godot to silnik gier typu open source, umożliwiający tworzenie zarówno gier 2D, jak i 3D. Projektowanie gier odbywa się w nim za pomocą architektury opartej na węzłach. Godot pozwala twórcom gier korzystać z wielu języków programowania, takich jak C++, C# i GDScript.

<a class="md-button" target="_blank" href="https://godotengine.org/">Oficjalna strona Godot Engine</a>

Godot to rozbudowana platforma do tworzenia gier. Korzystanie z niej może wymagać wszechstronnej znajomości samego silnika, programowania, gier z serii Mario Forever oraz szablonów gier, dlatego próg wejścia jest stosunkowo wysoki.

Wraz ze wzrostem popularności Godot niektórzy członkowie społeczności podjęli próby stworzenia szablonów gier Mario Forever opartych na tym silniku. Obecnie najczęściej używanym projektem tego typu jest Thunder Engine dla Godot 4, stworzony przez Meteo Dream. Oprócz niego dostępny jest również Mario Forever Mole Editor autorstwa ChloePrime.

<AssetsEntry name="Thunder Engine" /><AssetsEntry name="Mario Forever Mole Editor" />