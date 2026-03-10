<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
  import DownloadHeader from '../../components/HeaderNav.vue';
  import {getLanguage, setLanguageZh, setLanguageEn, getDisplayMode, setDisplayModeLine, setDisplayModeCard} from "../../util/Language.js";
  import { navTop } from "../../config.js";
  import SiteFooter from '../../components/SiteFooter.vue';
  import {readList} from "../../util/ReadList.js";
  import GameLine from "../../components/GameLine.vue";
  import GameCard from '../../components/GameCard.vue';
  import GameLineHeader from '../../components/GameLineHeader.vue';
  import {getAuthor, getName, getAuthorList} from "../../util/GemeUtil.js";
  import {parseVer} from "../../util/Misc.js";
  import introZh from '../../markdown/mf-games-zh.md';
  import introEn from '../../markdown/mf-games-en.md';
  import { SortUpIcon, SortDownIcon, SortUpDownIcon, InfoIcon, FilterIcon, ListIcon, GridIcon, QuestionIcon } from "../../components/icons/Icons.js";
  import {getVideoDesc, getResourceURL, filterList, getDataResourceURL, getStrFromList, getDownloadEntries, getDownloadInfo} from "../../util/GemeUtil.js"
  import ClipboardButton from '../../components/ButtonClipboard.vue';
  import axios from 'axios';
  import Tooltip from '../../components/ToolTip.vue';
  import ButtonBackToTop from '../../components/ButtonBackToTop.vue';
  import ButtonDarkMode from '../../components/ButtonDarkMode.vue';
  import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/vue';
  import { createGameImageResolver } from "../../util/ImageUtil.js";
  import FullscreenModal from '../../components/FullscreenModal.vue';
  import { disableScroll, enableScroll } from '../../util/OverlayScrollbarsUtil.js';

  const lan = ref(getLanguage());

  const pageId = "mf-games"

  // Credits modal state and click delegation on markdown content
  const showCredits = ref(false);
  const creditsHtml = ref("");
  const mdContainer = ref(null);
  const mdClickHandler = (e) => {
    const opener = e.target.closest && e.target.closest('#open-credits');
    if (opener) {
      e.preventDefault();
      const contentEl = mdContainer.value?.querySelector?.('#credits-content');
      if (contentEl) {
        creditsHtml.value = contentEl.innerHTML;
        showCredits.value = true;
      }
    }
  };

  onMounted(() => {
    if (mdContainer.value) {
      mdContainer.value.addEventListener('click', mdClickHandler);
    }
  });

  onBeforeUnmount(() => {
    if (mdContainer.value) {
      mdContainer.value.removeEventListener('click', mdClickHandler);
    }
  });

  // Change title.

  const titleZh = navTop.find(item => item.id === pageId).title;
  const titleEn = navTop.find(item => item.id === pageId).title_alt;

  document.title = lan.value == "zh" ? titleZh : titleEn;

  // Fetch game list.

  const games = ref([]);

  const imageResolver = createGameImageResolver('mf-games');

  Promise.all([readList("list-mf.yaml"), imageResolver.init()]).then(([list]) => {
    for (var entry of list) {
      entry.category = "mf";
      // Support single and multiple versions.
      if (entry.ver == null) {
        entry.ver = "";
      }
      if (entry.type === "international" && entry.author_alias) {
        entry.first_author = entry.author_alias;
      } else if (typeof entry.author == "object") {
        entry.first_author = entry.author[0];
      } else {
        entry.first_author = entry.author;
      }
      if (typeof(entry.ver) != "object") {
        entry.currentVerStr = entry.ver;
        entry.currentVerStrAlt = entry.ver_alt;
        entry.ver = [{
          [entry.ver] : {
            code : entry.code,
            date : entry.date,
            download_url : entry.download_url,
            download_url_alt : entry.download_url_alt,
            file_name : entry.file_name,
            file_url : entry.file_url,
            source_url : entry.source_url,
            source_url_alt : entry.source_url_alt,
            ver_alt : entry.ver_alt,
            data_download_url : entry.data_download_url
          }
        }];
      } else {
        entry.currentVerStr = Object.keys(entry.ver[0])[0];
        entry.currentVerStrAlt = entry.ver[0][entry.currentVerStr].ver_alt;
      }

      // 国际作品 old-versions/ 处理
      if (entry.type === "international" && Array.isArray(entry.ver) && entry.ver.length > 0) {
        // 找到所有current: true的索引
        let currentIndexes = entry.ver.map((verRaw, idx) => {
          const verObj = verRaw[Object.keys(verRaw)[0]];
          return verObj.current === true ? idx : -1;
        }).filter(idx => idx !== -1);
        // 找到日期最新的最大时间戳
        let maxDate = Math.max(...entry.ver.map(verRaw => {
          const verObj = verRaw[Object.keys(verRaw)[0]];
          return new Date(verObj.date).getTime();
        }));
        // 找到所有日期为maxDate的索引
        let allLatestIdxs = entry.ver.map((verRaw, idx) => {
          const verObj = verRaw[Object.keys(verRaw)[0]];
          return new Date(verObj.date).getTime() === maxDate ? idx : -1;
        }).filter(idx => idx !== -1);
        // 只保留第一个为真正最新
        let trueLatestIdx = allLatestIdxs.length > 0 ? allLatestIdxs[0] : -1;
        entry.ver.forEach((verRaw, idx) => {
          const verObj = verRaw[Object.keys(verRaw)[0]];
          // file_name 归档
          if (verObj.file_name) {
            if (
              !verObj.repacker &&
              (
                verObj.current === false ||
                (
                  !currentIndexes.includes(idx) &&
                  (
                    (new Date(verObj.date).getTime() !== maxDate) || (allLatestIdxs.includes(idx) && idx !== trueLatestIdx)
                  )
                )
              ) &&
              !verObj.file_name.startsWith("old-versions/") &&
              !verObj.file_name.toLowerCase().endsWith('.apk')
            ) {
              verObj.file_name = "old-versions/" + verObj.file_name;
            }
          }
          // data_file_name 归档
          if (verObj.data_file_name) {
            if (
              !verObj.repacker &&
              (
                verObj.current === false ||
                (
                  !currentIndexes.includes(idx) &&
                  (
                    (new Date(verObj.date).getTime() !== maxDate) || (allLatestIdxs.includes(idx) && idx !== trueLatestIdx)
                  )
                )
              ) &&
              !verObj.data_file_name.startsWith("old-versions/") &&
              !verObj.data_file_name.toLowerCase().endsWith('.apk')
            ) {
              verObj.data_file_name = "old-versions/" + verObj.data_file_name;
            }
          }
        });
      }

      // Automatically generate file_url if file_name is provided.
      for (var verRaw of entry.ver) {
        var ver = verRaw[Object.keys(verRaw)[0]];
        if (!ver.file_url) {
          if (ver.file_name) {
            // 检查是否为APK文件，如果是则使用包含作者名的安卓游戏路径
            if (ver.file_name.toLowerCase().endsWith('.apk')) {
              ver.file_url_zh = `https://file.marioforever.net/Mario Forever/安卓游戏/${entry.first_author}/${ver.file_name}`;
              ver.file_url_en = `https://file.marioforever.net/mario-forever/games/mobile-fangames/${entry.first_author}/${ver.file_name}`;
            } else if (ver.repacker) {
              ver.file_url_zh = `https://file.marioforever.net/Mario Forever/重打包作品/${ver.file_name}`;
              ver.file_url_en = `https://file.marioforever.net/mario-forever/games/repackaged-fangames/${ver.file_name}`;
            } else if (entry.type == "chinese") {
              ver.file_url_zh = `https://file.marioforever.net/Mario Forever/国内作品/${ver.date.toISOString().split('-')[0]}/${ver.file_name}`;
              ver.file_url_en = `https://file.marioforever.net/mario-forever/games/chinese-fangames/${ver.date.toISOString().split('-')[0]}/${ver.file_name}`;
            } else if (entry.type == "international") {
              ver.file_url_zh = `https://file.marioforever.net/Mario Forever/国外作品/${entry.first_author}/${ver.file_name}`;
              ver.file_url_en = `https://file.marioforever.net/mario-forever/games/international-fangames/${entry.first_author}/${ver.file_name}`;
            }
          } 
        } else {
          ver.file_url_zh = ver.file_url;
          ver.file_url_en = ver.file_url;
        }
        if (!ver.data_file_url) {
          if (ver.data_file_name) {
            // 检查是否为APK相关的数据文件，如果是则使用包含作者名的安卓游戏路径
            if (ver.data_file_name.toLowerCase().endsWith('.apk') || ver.file_name?.toLowerCase().endsWith('.apk')) {
              ver.data_file_url_zh = `https://file.marioforever.net/Mario Forever/安卓游戏/${entry.first_author}/${ver.data_file_name}`;
              ver.data_file_url_en = `https://file.marioforever.net/mario-forever/games/mobile-fangames/${entry.first_author}/${ver.data_file_name}`;
            } else if (ver.repacker) {
              ver.data_file_url_zh = `https://file.marioforever.net/Mario Forever/重打包作品/${ver.data_file_name}`;
              ver.data_file_url_en = `https://file.marioforever.net/mario-forever/games/repacked-fangames/${ver.data_file_name}`;
            } else if (entry.type == "chinese") {
              ver.data_file_url_zh = `https://file.marioforever.net/Mario Forever/国内作品/${ver.date.toISOString().split('-')[0]}/${ver.data_file_name}`;
              ver.data_file_url_en = `https://file.marioforever.net/mario-forever/games/chinese-fangames/${ver.date.toISOString().split('-')[0]}/${ver.data_file_name}`;
            } else if (entry.type == "international") {
              ver.data_file_url_zh = `https://file.marioforever.net/Mario Forever/国外作品/${entry.first_author}/${ver.data_file_name}`;
              ver.data_file_url_en = `https://file.marioforever.net/mario-forever/games/international-fangames/${entry.first_author}/${ver.data_file_name}`;
            }
          }
        } else {
          ver.data_file_url_zh = ver.data_file_url;
          ver.data_file_url_en = ver.data_file_url;
        }

        // Check validity of urls.
        if (ver.source_url != null && ver.source_url[0] == "~") {
          ver.source_url = ver.source_url.substring(1);
          ver.source_url_invalid = true
        } else {
          ver.source_url_invalid = false
        }

        if (ver.source_url_alt != null && ver.source_url_alt[0] == "~") {
          ver.source_url_alt = ver.source_url_alt.substring(1);
          ver.source_url_invalid_alt = true
        } else {
          ver.source_url_invalid_alt = false
        }

        if (ver.download_url != null && ver.download_url[0] == "~") {
          ver.download_url = ver.download_url.substring(1);
          ver.download_url_invalid = true
        } else {
          ver.download_url_invalid = false
        }

        if (ver.download_url_alt != null && ver.download_url_alt[0] == "~") {
          ver.download_url_alt = ver.download_url_alt.substring(1);
          ver.download_url_alt_invalid = true
        } else {
          ver.download_url_alt_invalid = false
        }
      }
      entry.currentVer = parseVer(entry.ver[0]);
      games.value.push(entry);
    }
    
    defaultSort();
    checkUrlGameParam();
    /* // 收集所有链接
    const allLinks = [];
    for (const entry of games.value) {
      if (Array.isArray(entry.ver)) {
        for (const verRaw of entry.ver) {
          const ver = verRaw[Object.keys(verRaw)[0]];
          if (ver.file_url_zh) allLinks.push(ver.file_url_zh);
        }
      }
    }
    console.log(allLinks); // 这里是所有作品所有版本的 file_url_zh */
  });

  const getGameSlug = (entry, language) => {
    const name = getName(entry, language);
    const author = getAuthorList(entry);
    const authorStr = Array.isArray(author) ? author.join('-') : author;
    const slug = `${name}-${authorStr}`.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
    return slug;
  };

  const checkUrlGameParam = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameSlug = urlParams.get('game');
    if (!gameSlug) return;

    const found = games.value.find(entry => {
      const slugZh = getGameSlug(entry, 'zh');
      const slugEn = getGameSlug(entry, 'en');
      return slugZh === gameSlug || slugEn === gameSlug;
    });

    if (found) {
      selectedGameDetail.value = found;
    }
  };

  const selectedDownload = ref(null); // For download modal.
  const selectedVideo = ref(null); // For download modal.
  const tiebaDialog = ref(null); // For tieba dialog.
  const selectedGameDetail = ref(null); // For game detail modal.

  watch([selectedDownload, selectedVideo, tiebaDialog, selectedGameDetail, showCredits], ([newDownload, newVideo, newTieba, newGameDetail, newShowCredits]) => {
    if (newDownload || newVideo || newTieba || newGameDetail || newShowCredits) {
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      disableScroll();
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      enableScroll();
    }
  });

  // Sort operations.

  const sort_option = ref({
    active : false,
    field : null,
    asc : true
  });

  function defaultSort() {
    games.value.sort((a, b) => parseVer(b.ver[0]).date - parseVer(a.ver[0]).date);
    sort_option.value.field = null;
  }

  function sortByName() {
    if (sort_option.value.field != "game") {
      sort_option.value.field = "game";
      sort_option.value.asc = true;
    } else if (sort_option.value.asc == true) {
      sort_option.value.asc = false;
    } else {
      defaultSort();
      return; 
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? getName(a, lan.value).localeCompare(getName(b, lan.value)) : getName(b, lan.value).localeCompare(getName(a, lan.value)));
  }

  function sortByAuthor() {
    if (sort_option.value.field != "author") {
      sort_option.value.field = "author";
      sort_option.value.asc = true;
    } else if (sort_option.value.asc == true) {
      sort_option.value.asc = false;
    } else {
      defaultSort();
      return; 
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? getAuthor(a, lan.value).localeCompare(getAuthor(b, lan.value)) : getAuthor(b, lan.value).localeCompare(getAuthor(a, lan.value)));
  }

  function sortByDate() {
    if (sort_option.value.field != "date") {
      sort_option.value.field = "date";
      sort_option.value.asc = true;
    } else {
      sort_option.value.asc = !sort_option.value.asc;
    }
    games.value = games.value.sort((a, b) => sort_option.value.asc ? a.currentVer.date - b.currentVer.date : b.currentVer.date - a.currentVer.date);
  }

  // Filter operations.

  const filter_option = ref({
    active : false,
    name : "",
    year : "",
    chinese : true,
    international : true,
  });

  function clearName() {
    filter_option.value.name = "";
  }
  function clearFilter() {
    filter_option.value.name = "";
    filter_option.value.year = "";
    filter_option.value.chinese = true;
    filter_option.value.international = true;
    // expandAllVersions.value = false;
  }

  const expandAllVersions = ref(false);

  const filteredGames = computed(() => {
    let list = games.value.filter((a) => 
      (
        (a.game && (filter_option.value.name.trim() == "" || a.game.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
        || (a.game_alt && (filter_option.value.name.trim() == "" || a.game_alt.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
        || (getStrFromList(a.author) && (filter_option.value.name.trim() == "" || getStrFromList(a.author).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
        || (getStrFromList(a.author_alt) && (filter_option.value.name.trim() == "" || getStrFromList(a.author_alt).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
        || filterList(filter_option.value.name.trim(), a.alias)
        || (Array.isArray(a.ver) && a.ver.some(verRaw => {
            const verObj = verRaw[Object.keys(verRaw)[0]];
            return verObj.file_name && verObj.file_name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase());
        }))
      )
      && (isNaN(parseInt(filter_option.value.year)) || (parseInt(a.currentVer.date.toISOString().split('-')[0]) == parseInt(filter_option.value.year)))
      && ((filter_option.value.chinese && a.type == "chinese")
      || (filter_option.value.international && a.type == "international")
      || filter_option.value.force)
    );
    if (!expandAllVersions.value) {
      return list;
    } else {
      // flatMap 优化：每个版本单独一条，所有筛选条件都在 verRaw 层判断
      const expanded = games.value.flatMap((entry) => {
        // 名称/作者/别名等只需判断一次
        const nameMatch = (
          (entry.game && (filter_option.value.name.trim() == "" || entry.game.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (entry.game_alt && (filter_option.value.name.trim() == "" || entry.game_alt.toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (getStrFromList(entry.author) && (filter_option.value.name.trim() == "" || getStrFromList(entry.author).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || (getStrFromList(entry.author_alt) && (filter_option.value.name.trim() == "" || getStrFromList(entry.author_alt).toUpperCase().match(filter_option.value.name.trim().toUpperCase())))
          || filterList(filter_option.value.name.trim(), entry.alias)
        );
        if (!Array.isArray(entry.ver)) return [];
        // 计算每个版本的最新版标记
        let latestIndexes = [];
        if (entry.ver.length > 0) {
          // 先找所有 current: true
          let currentIndexes = entry.ver.map((verRaw, idx) => {
            const verObj = verRaw[Object.keys(verRaw)[0]];
            return verObj.current === true ? idx : -1;
          }).filter(idx => idx !== -1);
          if (currentIndexes.length > 0) {
            latestIndexes = currentIndexes;
          } else {
            // 没有 current: true，找日期最新，只保留第一个
            let maxDate = Math.max(...entry.ver.map(verRaw => {
              const verObj = verRaw[Object.keys(verRaw)[0]];
              return new Date(verObj.date).getTime();
            }));
            let firstIdx = entry.ver.findIndex(verRaw => {
              const verObj = verRaw[Object.keys(verRaw)[0]];
              return new Date(verObj.date).getTime() === maxDate;
            });
            latestIndexes = firstIdx !== -1 ? [firstIdx] : [];
          }
        }
        return entry.ver.map((verRaw, idx) => {
          const verKey = Object.keys(verRaw)[0];
          const verObj = verRaw[verKey];
          // file_name匹配
          const fileNameMatch = verObj.file_name && verObj.file_name.toUpperCase().includes(filter_option.value.name.trim().toUpperCase());
          if (!nameMatch && !fileNameMatch) return null;
          // 年份判断
          const yearMatch = isNaN(parseInt(filter_option.value.year)) || (parseInt(verObj.date.toISOString().split('-')[0]) == parseInt(filter_option.value.year));
          // 类型判断
          const typeVal = verObj.type || entry.type;
          const typeMatch = (filter_option.value.chinese && typeVal == "chinese")
            || (filter_option.value.international && typeVal == "international")
            || filter_option.value.force;
          // 国际作品旧版file_name前缀处理
          let patchedVerRaw = { ...verRaw };
          if (typeVal === "international" && verObj.file_name && !latestIndexes.includes(idx) && !verObj.current) {
            if (!verObj.file_name.startsWith("old-versions/") && !verObj.file_name.toLowerCase().endsWith('.apk')) {
              // 只patch file_name，不影响原数据
              const newVerObj = { ...verObj, file_name: "old-versions/" + verObj.file_name };
              patchedVerRaw = { [verKey]: newVerObj };
            }
          }
          if (yearMatch && typeMatch) {
            return {
              ...entry,
              ver: [patchedVerRaw],
              currentVer: parseVer(patchedVerRaw),
              currentVerStr: verKey,
              currentVerStrAlt: patchedVerRaw[verKey].ver_alt,
              type: typeVal,
              _isVersionSplit: true,
              _isLatestVersion: verKey && latestIndexes.includes(idx)
            };
          }
          return null;
        }).filter(Boolean);
      });
      // 按排序选项排序
      if (sort_option.value.field === "game") {
        expanded.sort((a, b) => sort_option.value.asc
          ? getName(a, lan.value).localeCompare(getName(b, lan.value))
          : getName(b, lan.value).localeCompare(getName(a, lan.value))
        );
      } else if (sort_option.value.field === "author") {
        expanded.sort((a, b) => sort_option.value.asc
          ? getAuthor(a, lan.value).localeCompare(getAuthor(b, lan.value))
          : getAuthor(b, lan.value).localeCompare(getAuthor(a, lan.value))
        );
      } else if (sort_option.value.field === "date") {
        expanded.sort((a, b) => sort_option.value.asc
          ? a.currentVer.date - b.currentVer.date
          : b.currentVer.date - a.currentVer.date
        );
      } else {
        expanded.sort((a, b) => b.currentVer.date - a.currentVer.date);
      }
      return expanded;
    }
  });

  // Language changes.

  function pageSetLanguageZh() {
    lan.value =  setLanguageZh();
    document.title=titleZh;
    if (allDatesLoaded.value) {
      updateLastUpdate();
    }
  }

  function pageSetLanguageEn() {
    lan.value =  setLanguageEn();
    document.title=titleEn;
    if (allDatesLoaded.value) {
      updateLastUpdate();
    }
  }

  // Get last update date.

  const lastUpdate = ref(null);

  const yamlUpdateDate = ref(null);
  const mdUpdateDateZh = ref(null);
  const mdUpdateDateEn = ref(null);
  const allDatesLoaded = ref(false);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('zh-CN', options).replace(/\//g, '-');
  };

  const getLatestDateZh = () => {
    const dates = [];
    if (yamlUpdateDate.value) dates.push(new Date(yamlUpdateDate.value));
    if (mdUpdateDateZh.value) dates.push(new Date(mdUpdateDateZh.value));
    if (dates.length === 0) return null;
    const maxDate = new Date(Math.max(...dates));
    return formatDate(maxDate);
  };

  const getLatestDateEn = () => {
    const dates = [];
    if (yamlUpdateDate.value) dates.push(new Date(yamlUpdateDate.value));
    if (mdUpdateDateEn.value) dates.push(new Date(mdUpdateDateEn.value));
    if (dates.length === 0) return null;
    const maxDate = new Date(Math.max(...dates));
    return formatDate(maxDate);
  };

  const updateLastUpdate = () => {
    lastUpdate.value = lan.value === 'zh' ? getLatestDateZh() : getLatestDateEn();
  };

  const fetchYamlUpdate = () => {
    return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=public%2Fdata%2Flist-mf.yaml&page=1&per_page=1").then((response) => {
      yamlUpdateDate.value = response.data[0].commit.committer.date;
    });
  };

  const fetchMdUpdateZh = () => {
    return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmf-games-zh.md&page=1&per_page=1").then((response) => {
      mdUpdateDateZh.value = response.data[0].commit.committer.date;
    });
  };

  const fetchMdUpdateEn = () => {
    return axios.get("https://api.github.com/repos/MarioForeverCommunity/download-site-next/commits?path=src%2Fmarkdown%2Fmf-games-en.md&page=1&per_page=1").then((response) => {
      mdUpdateDateEn.value = response.data[0].commit.committer.date;
    });
  };

  Promise.all([fetchYamlUpdate(), fetchMdUpdateZh(), fetchMdUpdateEn()]).then(() => {
    allDatesLoaded.value = true;
    updateLastUpdate();
  });

  // Get window width.

  const wideScreen = ref(window.innerWidth >= 1100);
  const isMobile = ref(window.innerWidth <= 480);
  window.addEventListener('resize', () => {
    wideScreen.value = window.innerWidth >= 1100;
    isMobile.value = window.innerWidth <= 480;
  })

  // Display mode toggle (line/card)
  const displayMode = ref(getDisplayMode()); // 'line' or 'card'
  
  function toggleDisplayMode() {
    if (displayMode.value === 'line') {
      displayMode.value = setDisplayModeCard();
    } else {
      displayMode.value = setDisplayModeLine();
    }
  }

  // Image utilities.
  const getGameImage = (game) => {
    return imageResolver.resolve(game);
  };

  // Optimized tooltip.

  function tooltipMouseEnter(obj) {
    if (obj[0] != reference.value) {
      reference.value = obj[0];
      floatingText.value = obj[1];
    }
  }

  function tooltipMouseLeave(obj) {
    if (obj == reference.value) {
      reference.value = null;
      floatingText.value = null;
    }
  }
  
  const reference = ref(null);
  const floating = ref(null);
  const floatingText = ref(null);
  const { floatingStyles} = useFloating(reference, floating, 
  {
    middleware: [flip(), shift(), offset(10)],
    whileElementsMounted: autoUpdate,
  });

  // 根据文件名判断tooltip类型
  function getTooltipType(download) {
    if (!download || !download.currentVer || !download.currentVer.file_name) {
      return 'archive'; // 默认为压缩包
    }
    
    const fileName = download.currentVer.file_name.toLowerCase();
    
    // 检查是否包含安装相关关键词
    if (fileName.includes('install') || fileName.includes('setup') || fileName.includes('安装')) {
      return 'installer';
    }
    
    // 检查是否为exe文件
    if (fileName.endsWith('.exe')) {
      return 'exe';
    }
    
    if (fileName.endsWith('.apk')) {
      return 'apk';
    }
    
    // 默认为压缩包
    return 'archive';
  }

  function getDownloadEntriesForView(game) {
    if (!game) {
      return [];
    }
    return getDownloadEntries(game, lan.value);
  }

  function shouldShowResourceLink(game) {
    if (!game) {
      return false;
    }
    const entries = getDownloadEntriesForView(game);
    if (!entries.length) {
      return !!getResourceURL(game, lan.value);
    }
    const hasFileMirror = entries.some((e) => e.url && e.url.indexOf('file.marioforever.net') >= 0);
    return !hasFileMirror && !!getResourceURL(game, lan.value);
  }

  function hasDataDownload(game) {
    if (!game || !game.currentVer) {
      return false;
    }
    return !!(game.currentVer.data_download_url || getDataResourceURL(game, lan.value));
  }

</script>

<template>
  <DownloadHeader :pageId="pageId" :lan-var="lan" @change-lan-zh="pageSetLanguageZh();" @change-lan-en="pageSetLanguageEn();"/>

  <div class="container md-container" ref="mdContainer">
    <h1>{{ lan == "en" ? titleEn : titleZh }}</h1>
    <introZh v-if="lan == 'zh'" />
    <introEn v-if="lan == 'en'" />
    <p v-if="lastUpdate" class="last-update">{{ lan == "en" ? "Last updated: " : "最后更新：" }}{{ lastUpdate }}</p>
  </div>

  <div class="hidden-container">
    <div class="container icon-container" :class="sort_option.active ? 'expand' : '' ">
      <!-- <SortIcon v-if="!wideScreen" class="icon button" :class="sort_option.active ? 'active' : '' " @click="sort_option.active = !sort_option.active"></SortIcon> -->
      <div class="icon-container">
        {{ lan == "en" ? "Filter" : "筛选" }}
        <div class="inline-block search-box">
          <input v-model="filter_option.name" class="input" @input="onSearchInput">
          <span v-if="filter_option.name" class="clear-btn" @click="clearName" title="Clear">✕</span>
        </div>&nbsp;
        <div class="inline-block">
          {{ lan == "en" ? "Year" : "年份" }}
          <select v-model="filter_option.year">
            <option value="">{{ lan == "en" ? "Select..." : "请选择.." }}</option>
            <option v-for="year in Array.from({length: new Date().getFullYear()-2013+1}, (_, i) => i + 2013).reverse()" :key="year">{{year}}</option>
          </select>&nbsp;
        </div>
        <div class="inline-block">
          <input v-model="filter_option.chinese" type="checkbox" id="filterChinese">
          <label for="filterChinese">{{ lan == "en" ? "Chinese" : "国内作品" }}</label>
        </div>
        <div class="inline-block">
          <input v-model="filter_option.international" type="checkbox" id="filterInternational">
          <label for="filterInternational">{{ lan == "en" ? "International" : "国外作品" }}</label>
        </div>
        <div class="inline-block">
          <input v-model="expandAllVersions" type="checkbox" id="expandAllVersions">
          <label for="expandAllVersions">{{ lan == "en" ? "Expand all versions" : "展开全部版本" }}</label>
          <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
            <InfoIcon class="icon button-shift" style="margin-left: 0.4em;"></InfoIcon>
            <template #popper>
              <span v-if="lan == 'zh'" style="text-align: left; display: block;">
                勾选此项后，所有包含多个版本的作品将在列表中全部展开，每个版本单独显示；取消勾选则将同一作品的所有版本折叠为一条。由于展开后条目数量增多，可能影响排序性能，建议结合筛选功能使用。
              </span>
              <span v-else style="text-align: left; display: block;">
                When checked, all games with multiple versions will be fully expanded in the list, with each version shown as a separate entry. When unchecked, all versions of a game will be collapsed into a single entry. Enabling this may reduce sorting performance due to the increased number of entries, so using filters is recommended.
              </span>
            </template>
          </Tooltip>
        </div>
        <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
          <FilterIcon class="icon button" @click="clearFilter()" />
          <template #popper>{{ lan == 'en' ? 'Reset filters' : '重置筛选' }}</template>
        </Tooltip>
        <div class="inline-block display-mode-toggle" v-if="wideScreen">
          <Tooltip :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
            <ListIcon class="icon button" v-if="displayMode === 'card'" @click="toggleDisplayMode()" />
            <GridIcon class="icon button" v-if="displayMode === 'line'" @click="toggleDisplayMode()" />
            <template #popper>{{ displayMode === 'line' ? (lan == 'en' ? 'Switch to Card' : '切换到卡片') : (lan == 'en' ? 'Switch to List' : '切换到列表') }}</template>
          </Tooltip>
        </div>
        <div class="inline-block item-count">
          {{ lan == "en" ? `${filteredGames.length} items` : `${filteredGames.length} 个条目` }}
        </div>
      </div>
      <div class="icon-container" v-if="!wideScreen || (wideScreen && displayMode === 'card')">
        {{ lan == "en" ? "Sort by " : "排序选项 " }}
        <div class="visible-button" @click="sortByName();">
          {{ lan == "en" ? "Name" : "名称" }}
          <span v-if="sort_option.field == 'game'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'game'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortByAuthor();">
          {{ lan == "en" ? "Author" : "作者" }}
          <span v-if="sort_option.field == 'author'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'author'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
        <div class="visible-button" @click="sortByDate();">
          {{ lan == "en" ? "Date" : "日期" }}
          <span v-if="sort_option.field == 'date'">
            <SortUpIcon class="icon button-shift" v-if="sort_option.asc"></SortUpIcon>
            <SortDownIcon class="icon button-shift" v-if="!sort_option.asc"></SortDownIcon>
          </span>
          <span v-if="sort_option.field != 'date'">
            <SortUpDownIcon class="icon button-shift"></SortUpDownIcon>
          </span>
        </div>
      </div>
    </div>
  </div>

  <GameLineHeader v-if="wideScreen && displayMode === 'line'" :lan="lan" category="mf" :sort_option="sort_option" @sort-by-name="sortByName();" @sort-by-author="sortByAuthor();" @sort-by-date="sortByDate();"/>
  <div v-if="wideScreen && displayMode === 'line'">
    <div v-for="(game, idx) in filteredGames" :key="game.game + '|' + getStrFromList(game.author) + '|' + (game.type || '') + '|' + (game.currentVerStr || '') + '|' + (game.currentVer.date?.toISOString?.() || '') + '|' + idx">
      <GameLine :game="game" :lan="lan" :get-game-image="getGameImage" @select-game="(entry) => {selectedDownload = entry;}" @select-videos="(entry) => {selectedVideo = entry;}" @select-version="(entry) => {Object.assign(game, entry);}" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)" @show-tieba-dialog="(data) => {tiebaDialog = data;}" @show-game-detail="(entry) => {selectedGameDetail = entry;}"/>
    </div>
  </div>
  <div v-if="(wideScreen && displayMode === 'card') || !wideScreen" class="card-container">
    <div v-for="(game, idx) in filteredGames" :key="game.game + '|' + getStrFromList(game.author) + '|' + (game.type || '') + '|' + (game.currentVerStr || '') + '|' + (game.currentVer.date?.toISOString?.() || '') + '|' + idx">
      <GameCard :game="game" :lan="lan" :get-game-image="getGameImage" @select-game="(entry) => {selectedDownload = entry;}" @select-videos="(entry) => {selectedVideo = entry;}" @select-version="(entry) => {Object.assign(game, entry);}" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)" @show-tieba-dialog="(data) => {tiebaDialog = data;}" @show-game-detail="(entry) => {selectedGameDetail = entry;}"/>
    </div>
  </div>

  <Transition name="modal">
    <div v-if="showCredits" class="modal-bg" @click="showCredits = false;">
      <div class="modal-content" @click.stop="">
        <div v-html="creditsHtml"></div>
      </div>
    </div>
  </Transition>

  <Transition name="modal">
    <div v-if="selectedDownload != null" class="modal-bg" @click="selectedDownload = null;">
      <div class="modal-content" @click.stop="">
        <div>
          {{ lan == 'en' ? "Download" : "下载" }} {{ getName(selectedDownload, lan) }} {{ lan == 'en' && selectedDownload.currentVerStrAlt ? selectedDownload.currentVerStrAlt : selectedDownload.currentVerStr }}
          <Tooltip v-if="lan == 'zh'" :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
            <QuestionIcon class="icon button-shift" style="vertical-align: middle; cursor: help;"/>
            <template #popper>
              <span v-if="isMobile && getTooltipType(selectedDownload) === 'apk'" style="text-align: left; display: block;">
                   本作品为 .apk 文件，可在安卓手机上直接安装运行。<br>
                   安装前请确保设备允许安装“未知来源”的应用。
                 </span>
                 <span v-else-if="isMobile" style="text-align: left; display: block;">
                   您当前正在使用手机浏览本页面。本作品为电脑平台设计，通常无法在手机上直接运行。<br>
                   如需游玩，请将下载的文件传输至电脑并在电脑上操作。
                 </span>
                <template v-else>
                  <span v-if="getTooltipType(selectedDownload) === 'installer'" style="text-align: left; display: block;">
                    本作品以安装程序形式提供，需运行安装程序完成安装，建议选择非系统盘作为安装路径。<br>
                    安装完成后，打开桌面快捷方式即可启动游戏。
                  </span>
                  <span v-else-if="getTooltipType(selectedDownload) === 'exe'" style="text-align: left; display: block;">
                    本作品为可执行文件（.exe），可以直接打开运行。<br>
                    建议将其放在一个独立文件夹中，避免与其他作品的文件混合存放，不要将文件放在桌面。
                  </span>
                  <span v-else-if="getTooltipType(selectedDownload) === 'apk'" style="text-align: left; display: block;">
                    本作品为 .apk 文件，为安卓设备专用，电脑无法直接运行。<br>
                    请在安卓设备上安装后游玩。
                  </span>
                  <span v-else style="text-align: left; display: block;">
                    本作品以压缩包形式提供，需使用解压软件（如 7-Zip）解压。<br>
                    请将所有文件解压至一个单独文件夹，避免与其他作品的文件混合存放，不要将文件放在桌面。<br>
                    解压完成后，打开生成的 .exe 文件即可启动游戏。
                  </span>
                </template>
            </template>
          </Tooltip>
        </div>
        <div v-if="selectedDownload.currentVer && selectedDownload.currentVer.repacker" class="italic">
            {{ lan == "en" ? `Repackaged by ${selectedDownload.currentVer.repacker_alt ? selectedDownload.currentVer.repacker_alt : selectedDownload.currentVer.repacker}.` : `该版本由 ${selectedDownload.currentVer.repacker} 重打包。` }}
            <Tooltip v-if="lan == 'zh'" :in-card="false" @show-tooltip="(obj)=>tooltipMouseEnter(obj)" @hide-tooltip="(obj) => tooltipMouseLeave(obj)">
                <QuestionIcon class="icon button-shift" style="vertical-align: middle; cursor: help;"/>
                <template #popper>
                <span style="text-align: left; display: block;">
                    重打包作品即由非原作者打包的 Mario Forever 作品。由于一些老作品的原下载链接已失效，作者提供的压缩包已经失传，而部分吧友的电脑中可能仍有存留，经考虑后，决定开放收录此类作品。<br>
                    <br>
                    重打包作品收录的原则是：<br>
                    1. 只收录原压缩包已失传的作品；<br>
                    2. 作品内容（包括游戏本体、自带文档、BGM 等）不得被篡改；<br>
                    3. 不影响游戏游玩的文件（BGM 除外）在保证不破坏游戏本体完整性的前提下可以缺失，但不得随意增删文件；<br>
                    4. 重打包的作品不应包含游玩过的存档文件。
                </span>
                </template>
            </Tooltip>
        </div>
        <div class="button-line">
          <a class="download" v-if="shouldShowResourceLink(selectedDownload)" :href="getResourceURL(selectedDownload, lan)" target="_blank">{{ lan == "en" ? "file.marioforever.net" : "社区资源站" }}</a>
          <template v-for="entry in getDownloadEntriesForView(selectedDownload)" :key="entry.url">
            <a class="download" :href="entry.url" target="_blank">{{ entry.desc }}</a>
            <ClipboardButton
              v-if="entry.code"
              :code="entry.code"
              :lan="lan"
            ></ClipboardButton>
          </template>
        </div>
        <div v-if="hasDataDownload(selectedDownload)" class="button-line" style="margin-top: 8px;">
          <span>{{ lan == 'en' ? `Download ${getName(selectedDownload, lan)} ${selectedDownload.currentVerStrAlt || selectedDownload.currentVerStr || ''} Data` : `下载 ${getName(selectedDownload, lan)} ${selectedDownload.currentVerStr || ''} 数据包` }}</span>
        </div>
        <div v-if="hasDataDownload(selectedDownload)" class="button-line">
          <template v-if="selectedDownload.currentVer.data_download_url">
            <a class="download" v-if="getDataResourceURL(selectedDownload, lan)" :href="getDataResourceURL(selectedDownload, lan)" target="_blank">{{ lan == "en" ? "file.marioforever.net" : "社区资源站" }}</a>
            <a class="download" :href="selectedDownload.currentVer.data_download_url" target="_blank">
              {{ getDownloadInfo(null, selectedDownload.currentVer.data_download_url, lan).desc }}
              <template v-if="selectedDownload.currentVer.data_code">
                ({{ lan == 'en' ? `Code: ${selectedDownload.currentVer.data_code}` : `提取码: ${selectedDownload.currentVer.data_code}` }})
              </template>
            </a>
            <ClipboardButton v-if="selectedDownload.currentVer.data_code" :code="selectedDownload.currentVer.data_code" :lan="lan" style="margin-left:2px;" />
          </template>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="modal">
    <div v-if="selectedVideo != null" class="modal-bg" @click="selectedVideo = null;">
      <div class="modal-content" @click.stop="">
        <div>
          {{ lan == 'en' ? "Related videos of " : "相关视频：" }}{{ getName(selectedVideo, lan) }}
          <div v-if="lan == 'zh'">
            <p v-for="video in selectedVideo.video_zh" :key="Object.keys(video)[0] + (Object.values(video)[0] || '')">
              <a :href="Object.values(video)[0]" target="_blank">▶ {{ Object.keys(video)[0] }} ({{ getVideoDesc(Object.values(video)[0], lan) }})</a>
            </p>
          </div>
          <div v-if="lan == 'en'">
            <p v-for="video in selectedVideo.video_en" :key="Object.keys(video)[0] + (Object.values(video)[0] || '')">
              <a :href="Object.values(video)[0]" target="_blank">▶ {{ Object.keys(video)[0] }} ({{ getVideoDesc(Object.values(video)[0], lan) }})</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="modal">
    <div v-if="tiebaDialog != null" class="modal-bg" @click="tiebaDialog = null;">
      <div class="modal-content" @click.stop="">
        <div>
          {{ lan == 'en' ? 'Choose Link to Visit' : '选择要访问的链接' }}
        </div>
        <div class="button-line">
          <a class="download" :href="tiebaDialog.originalUrl" target="_blank" @click="tiebaDialog = null;">
            {{ lan == 'en' ? 'Baidu Tieba (tieba.baidu.com)' : '百度贴吧源站' }}
          </a>
          <a class="download" :href="tiebaDialog.archiveUrl" target="_blank" @click="tiebaDialog = null;">
            {{ lan == 'en' ? 'Tieba Archive (archive.marioforever.net)' : '社区备份站' }}
          </a>
        </div>
      </div>
    </div>
  </Transition>

  <FullscreenModal :show="selectedGameDetail != null" :game="selectedGameDetail" :lan="lan" category="mf-games" @close="selectedGameDetail = null" />

  <div ref="floating" class="floating-obj" v-if="floatingText" :style="floatingStyles" v-html="floatingText">
  </div>
  
  <ButtonBackToTop />
  <ButtonDarkMode />

  <SiteFooter />
</template>

<style scoped>
  @import "../../assets/general.css";
</style>

<style scoped>
  html {
    max-width: 100%;
    overflow-x: hidden;
  }

  .hidden-container {
    width: 100vw;
    margin-top: -10px;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .icon-container {
    padding: .25em 10px;
  }

  .md-container {
    width: 100vw;
    box-sizing: border-box;
    padding: 10px 20px;
    margin: 20px auto;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
    font-feature-settings: normal;
    font-kerning: auto;
    font-optical-sizing: auto;
    font-size-adjust: none;
    font-stretch: 100%;
    font-style: normal;
    font-variant-alternates: normal;
    font-variant-caps: normal;
    font-variant-east-asian: normal;
    font-variant-ligatures: normal;
    font-variant-numeric: normal;
    font-variant-position: normal;
    font-variation-settings: normal;
  }

  @media (max-width: 1333px) and (min-width: 800px) {
    .md-container {
      width: 90vw;
      border-radius: 2px;
    }

    .hidden-container {
      width: 90vw;
      margin: auto;
      margin-top: -10px;
    }
  }

  @media (min-width: 1333px) {
    .md-container {
      width: 1200px;
      border-radius: 2px;
    }

    .hidden-container {
      width: 1200px;
      margin: auto;
      margin-top: -10px;
    }
  }

  .icon {
    color: #000;
    width: 16px;
    height: 16px;
    display: inline-block;
    vertical-align: middle;
    margin: 2px;
  }

  .button {
    border: 1px solid rgba(0, 0, 0, 0);
    padding: 4px;
    border-radius: .25em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: pointer;
    display: inline-block;
  }

  .button:hover, .button:focus {
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
    color: rgba(0, 0, 0, 0.65);
  }

  .button:hover {
    transform: translateY(-1px);
  }

  .button:active {
    background-color: #F0F0F1;
    border: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
  }

  .visible-button {
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 2px .5em;
    margin-right: .5em;
    border-radius: .25em;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    cursor: pointer;
    display: inline-block;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .visible-button:hover, .visible-button:focus {
    box-shadow: rgba(0, 0, 0, 0.1) 2px 2px 6px;
  }

  .visible-button:active {
    background-color: #F0F0F1;
    box-shadow: rgba(0, 0, 0, 0.06) 1px 1px 2px;
    color: rgba(0, 0, 0, 0.65);
    transform: translateY(0);
  }

  .modal-bg {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
  }

  .modal-enter-active, .modal-leave-active {
    transition: opacity 0.5s ease;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    max-width: 80vw;
    max-height: 80vh;
    padding: 1em;
    border-radius: .5em;
    overflow-y: auto;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

  .download {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
    line-height: 1.5em;
  }

  .download:hover, .download:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .download:active {
    background-color: #007cdf;
  }

  .button-line {
    margin-top: .5em;
  }

  .input {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    height: 1.3em;
    line-height: 1.3em;
  }

  .input:hover, .input:focus {
    cursor: auto;
    border-color: #008cff
  }

  .search-box {
    position: relative;
    display: inline-block;
  }

  .clear-btn {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #999;
    font-size: 14px;
    line-height: 1;
    padding: 2px 4px;
    user-select: none;
  }

  .clear-btn:hover {
    color: #333;
  }

  select {
    cursor: text;
    color: #4e6e8e;
    display: inline-block;
    border: 1px solid #cfd4db;
    border-radius: 5px;
    outline: none;
    padding: .2em .6em;
  }

  select:hover, select:focus {
    cursor: pointer;
    border-color: #008cff
  }

  .italic {
    font-style: italic;
  }

  .button-shift {
    transform: translateY(-1px);
  }

  .floating-obj {
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    width: max-content;
    max-width: calc(min(800px, 90vw));
    padding: .25em .75em;
    z-index: 1002;
    font-family: Helvetica, Arial, "Microsoft YaHei", "PingFang SC", "WenQuanYi Micro Hei", "tohoma,sans-serif";
  }

</style>
<style>

  a {
    color: #008cff;
    text-decoration: none;
    font-weight: normal;
  }

  a:hover {
    color: #006eff;
    text-decoration: underline;
  }

  table {
    width: 100%;
  }

  p {
    margin: .5em 0;
  }

  ul {
    margin: .5em 0;
    padding-left: 30px;
  }

  h1 {
    font-size: 30px;
    margin-top: 12px;
  }

  p, ol, ul, h4, h5, h6, table, button {
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;  
    line-height: 1.5em;
  }

  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  table thead {
    background: #404248;
    color: #fff;
    text-align: left;
  }

  table tr:first-child {
    border-top: 0 !important;
  }

  table tr {
    border-top: solid 1px #eee;
  }
  
  table td {
    padding: 0.5em 1em 0.5em 1em;
  }
  
  table th {
    padding: 0.5em 1em 0.5em 1em;
  }

  .md-button {
    color: white;
    cursor: pointer;
    background-color: #008cff;
    padding: .5em;
    border-radius: .5em;
    margin-right: .5em;
    margin: .25em;
    display: inline-block;
  }

  .md-button:hover, .md-button:focus {
    background-color: #30acff;
    text-decoration: none;
  }

  .md-button:active {
    background-color: #007cdf;
  }

  .md-button:hover {
    color: white;
  }
</style>
