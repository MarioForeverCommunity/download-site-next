<script setup>
import { ref, onMounted } from 'vue';
import ButtonDownload from './ButtonDownload.vue';
import { readList } from '../util/ReadList';

const props = defineProps({
  lan: {
    type: String,
    required: true
  }
});

// 定义基础URL
const baseUrls = {
  'zh': {
    installer: 'https://file.marioforever.net/Mario%20Forever/Mario%20Forever%20全版本下载/安装版/',
    portable: 'https://file.marioforever.net/Mario%20Forever/Mario%20Forever%20全版本下载/绿色版/',
    nsmf_installer: 'https://file.marioforever.net/Mario%20Forever/New%20Super%20Mario%20Forever%20%E4%B8%8B%E8%BD%BD/%E5%AE%89%E8%A3%85%E7%89%88/'
  },
  'en': {
    installer: 'https://file.marioforever.net/mario-forever/games/original-mf/installer/',
    portable: 'https://file.marioforever.net/mario-forever/games/original-mf/portable/',
    nsmf_installer: 'https://file.marioforever.net/mario-forever/games/softendo/installer/'
  }
};

const versions = ref([]);

onMounted(async () => {
  try {
    const data = await readList('list-original-mf.yaml');
    versions.value = data;
  } catch (error) {
    console.error('Failed to load original MF versions:', error);
  }
});

// 格式化日期显示
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取下载链接
const getDownloadUrl = (version, type) => {
  if (type === 'installer' && version.installer) {
    const baseUrl = version.nsmf ? baseUrls[props.lan].nsmf_installer : baseUrls[props.lan].installer;
    return `${baseUrl}${version.installer}`;
  } else if (type === 'portable' && version.portable) {
    return `${baseUrls[props.lan].portable}${version.portable}`;
  }
  return null;
};
</script>

<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>{{ lan === 'en' ? 'Version' : '版本' }}</th>
          <th>{{ lan === 'en' ? 'Release date' : '发布日期' }}</th>
          <th>{{ lan === 'en' ? 'Rating' : '推荐度' }}</th>
          <th>{{ lan === 'en' ? 'Installer' : '安装版' }}</th>
          <th>{{ lan === 'en' ? 'Portable' : '绿色版' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(version, index) in versions" :key="index">
          <td>{{ version.ver }}</td>
          <td>{{ formatDate(version.date) }}</td>
          <td>
            <span class="rating">{{ version.rating }}</span>
          </td>
          <td>
            <ButtonDownload 
              v-if="getDownloadUrl(version, 'installer')" 
              :href="getDownloadUrl(version, 'installer')"
              :lan="lan"
              :hasToolbar="!!version.toolbar"
              type="installer"
            />
          </td>
          <td>
            <ButtonDownload 
              v-if="getDownloadUrl(version, 'portable')" 
              :href="getDownloadUrl(version, 'portable')"
              :lan="lan"
              :hasToolbar="!!version.toolbar"
              type="portable"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>