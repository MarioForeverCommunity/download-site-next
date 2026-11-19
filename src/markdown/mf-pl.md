<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import DownloadButton from "../components/ButtonDownload.vue"
  import OriginalMfTable from '../components/DesignMfTable.vue'
  import NxGallery from '../components/next/NxGallery.vue'

  defineProps({
    lastUpdateEn: String
  })

  const imagesOriginal = [
    "/data/mf-index/title.webp",
    "/data/mf-index/World_3-2.webp",
    "/data/mf-index/World_3-4.webp",
    "/data/mf-index/World_4-1.webp",
    "/data/mf-index/6-3.webp",
    "/data/mf-index/8-3.webp",
    "/data/mf-index/8-4.webp",
    "/data/mf-index/Hardcore_2-3.webp",
    "/data/mf-index/World_GRYo2_-1.webp",
    "/data/mf-index/LostMap-4.webp",
  ]

  onMounted(() => {
  })

  onBeforeUnmount(() => {
  })
</script>

<p v-if="lastUpdateEn" class="last-update" style="font-weight: bold;">Ostatnia aktualizacja: {{ lastUpdateEn }}</p>

## Pobierz Mario Forever: Community Edition

**Zalecana wersja.** Odpowiednia dla stosunkowo nowoczesnych komputerów PC. Obsługuje kontrolery oraz wysoką liczbę klatek na sekundę (FPS). Zawiera wbudowane opcje pozwalające dostosować rozgrywkę do własnych preferencji. Oferuje również niestandardowe skórki postaci oraz możliwość gry jako Luigi.

Dostępny jest również nieoficjalny port na Androida.

<MfGamesEntry name="Mario Forever: Community Edition" /><MfGamesEntry name="Mario Forever: Community Edition Android" />

## Pobierz Mario Forever Remake

Odpowiednia dla zdecydowanej większości komputerów z systemem Windows. Na niektórych nowoczesnych komputerach działa lepiej niż oryginalne Mario Forever. Dodaje również kilka światów stworzonych przez fanów. Gra występuje w dwóch różnych wersjach: europejskiej (PAL) i chińskiej.

<MfGamesEntry name="Mario Forever Remake (PAL)" /><MfGamesEntry name="Mario Forever Remake" /><MfGamesEntry name="Mario Forever Advance Remake" />

## Pobierz oryginalne Mario Forever

Dla osób poszukujących najbardziej autentycznych wrażeń z gry w jej oryginalnej postaci. Wersje 4.4 i starsze mogą działać nieprawidłowo w systemie Windows 7 i nowszych, ponieważ korzystają ze standardowego trybu renderowania działającego z częstotliwością 50 FPS. Wersje 5.0 i nowsze są na ogół mało satysfakcjonujące — warto je wypróbować tylko z ciekawości.

Historia zmian jest dostępna na [stronie Wiki](https://en.wiki.marioforever.net/wiki/Mario_Forever).
<OriginalMfTable lan="pl" />
<div class="foot-note" style="font-size:12px">

1. Dla wersji v1.16.1 nie jest dostępne archiwum w wersji przenośnej, ponieważ ta wersja instaluje swoje zasoby w katalogu systemu Windows. Dla wersji v7.02_30 nie jest dostępny instalator.
2. Oznaczenia wersji v3.50/v3.51 zostały wprowadzone w celu ułatwienia ich rozróżnienia — są to różne kompilacje wersji v3.5. Instalator v3.50 jest chińską, zmodyfikowaną wersją pakietu instalacyjnego. Ta wersja zawiera błąd w świecie 4-2, który uniemożliwia dalszą rozgrywkę. Błąd ten został naprawiony w v3.51.
3. Wersje v5.011/v5.013 są identyczne z v5.01, a v5.08b jest identyczna z v5.08. Dla każdej z wersji v4.15/v5.9/v5.9s dostępne są dwa instalatory z różnymi znacznikami czasu, jednak zainstalowane pliki są identyczne.
4. Oznaczenia wersji v5.9s/v5.9t/v5.9r zostały wprowadzone w celu ułatwienia ich rozróżnienia — są to różne kompilacje wersji v5.9. Plik wykonywalny wersji v5.9r (litera „r” oznacza *ridiculous* — „absurdalny”, ponieważ wiadomo, że ta wersja nie działa) ma znacznik czasu 2013-01-18, natomiast instalator [najwyraźniej został wydany 2014-06-26](https://archive.marioforever.net/post/3258680750.html).
5. Od wersji v6.0 oficjalna numeracja wersji stała się dość niejasna. Oznaczenia v6.0, v6.01, v6.1 i v6.11 zostały wprowadzone w celu ułatwienia ich rozróżnienia — są to różne kompilacje wersji „v6.0 Beta”.
6. Pliki wersji v6.1/v6.11 pochodzą z pakietu Super Mario Forever 2016 Pack wydanego przez Softendo. Dla wersji v6.1 dostępny jest również instalator przepakowany w 2017 roku.
7. W przypadku wersji v6.000027 (2018), znanej również jako „Mario Forever 6.00 Fixed Version”, nie jest jasne, dlaczego Softendo wydało ją po wersji v7.02.
8. Instalator wersji v7.02e nosi oryginalną nazwę `super-mario-forever-v702e.exe`. W zainstalowanej wersji v7.02e znajduje się plik `MarioForever 7.02 Beta.exe`, którego data modyfikacji to 2019-01-28. Plik ten nie jest właściwym plikiem wykonywalnym gry — pełni jedynie funkcję programu uruchamiającego, który otwiera okno zatytułowane „Softendo Games Steam”. Właściwy plik wykonywalny gry v7.02e jest identyczny z plikiem z wersji v7.02_31 Beta.
9. Data wydania Advance v4.4 (2011) odnosi się do daty modyfikacji pliku wykonywalnego gry.
10. Wersja przenośna nie zawiera ikon, skrótów URL, deinstalatorów ani oprogramowania reklamowego.

</div>

### Zrzuty ekranu
<NxGallery :images="imagesOriginal" alt="Mario Forever" :max-height="480" :autoplay="3000" />

## Pobierz modyfikacje oryginalnego Mario Forever

Znanych jest kilka modyfikacji opartych na oryginalnym Mario Forever.

<MfGamesEntry name="Mario Forever v1.16.1 Mod" /><MfGamesEntry name="Mario Forever v4.4 Fixed Speedrun Edition" />

## Pobierz New Super Mario Forever

New Super Mario Forever (często nazywane New Super Mario Forever 2012) to fanowska gra z serii Mario opracowana przez Softendo. Stanowi oficjalną kontynuację Mario Forever i została wydana w 2012 roku. Gra oferuje oprawę graficzną całkowicie odmienną od oryginalnego Mario Forever, a także nowych przeciwników, ulepszenia i światy. Zalecaną wersją gry jest wydanie z **2013-03-04**.

Dostępna jest również modyfikacja tej gry, która usuwa niektóre frustrujące elementy i wprowadza kilka usprawnień.

<SoftendoEntry name="New Super Mario Forever" /><MfGamesEntry name="New Super Mario Forever 2012: Slightly-Fixed Plus Edition" />

## Często zadawane pytania

**P: Czy Mario Forever jest bezpieczne? Słyszałem, że zawiera wirusa.**

**O:** Wiele osób nadal uważa Mario Forever za grę „zainfekowaną złośliwym oprogramowaniem”, ale rzeczywistość jest nieco bardziej złożona: sama gra **nie zawiera** żadnego tradycyjnego wirusa. W przypadku niektórych wersji instalator zawiera dodatek reklamowy do przeglądarki Internet Explorer o nazwie „Mario Forever Toolbar”. Dodatek ten jest niepopularny i uciążliwy, jednak jest klasyfikowany jako adware (oprogramowanie reklamowe), a nie wirus.

Istnieje jednak uzasadniony problem związany z bezpieczeństwem, na który zwrócili uwagę badacze. Według [firmy Cyble](https://cyble.com/blog/trojanized-super-mario-game-installer-spreads-supremebot-malware/) jeden z instalatorów wersji *super-mario-forever-v702e* został zmodyfikowany w celu rozpowszechniania trojana i zawierał złośliwe komponenty: koparkę kryptowaluty XMR, klienta koparki SupremeBot oraz open-source'owe narzędzie kradnące dane Umbral. Jest to prawdopodobnie jedno ze źródeł powszechnej plotki o tym, że „MF zawiera wirusa”.

**Ważna informacja:** Żadna z wersji udostępnionych na tej stronie nie zawiera żadnego ze złośliwych komponentów zidentyfikowanych przez Cyble. Wszystkie udostępnione instalatory zostały sprawdzone i uznane za bezpieczne. Instalatory niektórych wersji zawierają wprawdzie dodatek „Mario Forever Toolbar”, ale podczas instalacji można zrezygnować z jego instalowania.

Ponadto niektóre wersje Mario Forever zawierają odnośniki do domen `mariocoins.com` i `broshome.com`. Domeny te nie należą już do swoich pierwotnych właścicieli i zostały przejęte przez niepowiązane z nimi podmioty. Mogą przekierowywać do niezaufanych lub potencjalnie niebezpiecznych treści. W niektórych wersjach dostęp do tych odnośników jest możliwy z poziomu opcji w grze (takich jak „Get Secrets” lub „Get Coins”) albo za pośrednictwem skrótów URL utworzonych przez instalator. **Zdecydowanie zalecamy, aby nie otwierać tych odnośników.**

Aby rozwiać wszelkie pozostałe obawy, udostępniamy przenośną wersję gry. Nie zawiera ona dołączonego paska narzędzi i została pozbawiona skrótów URL oraz innych zbędnych elementów. Możesz również wybrać jedną z fanowskich wersji odtworzonych na podstawie oryginału, takich jak Mario Forever Remake lub Mario Forever: Community Edition — one również są wolne od złośliwego oprogramowania.
